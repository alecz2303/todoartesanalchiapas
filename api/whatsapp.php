<?php
declare(strict_types=1);
// WhatsApp Cloud API — aviso automático de cotización lista (TACAPP-30).
//
// Cuando Alecz pone precio a una cotización en el panel (el pedido pasa a
// 'En cotización'), api/orders.php llama a waNotifyQuotePriced() y el
// cliente recibe este mensaje automáticamente. Nada de esto corre si
// WhatsApp no está configurado: el panel sigue funcionando igual.
//
// PLANTILLA A CREAR EN META (WhatsApp Manager > Plantillas de mensajes):
//   Nombre:     cotizacion_lista
//   Idioma:     es_MX (Español - México)
//   Categoría:  UTILITY
//   Cuerpo:
//     ¡Hola! Tu cotización {{1}} de Todo Artesanal Chiapas ya tiene precio:
//     total {{2}}, con anticipo del 60% de {{3}}. Confírmala aquí: {{4}}
//     ¡Gracias por confiar en nosotros!
//   Parámetros: {{1}} folio (ej. TAC-20261117-001), {{2}} total formateado
//   (ej. $1,000.00), {{3}} anticipo del 60% formateado (ej. $600.00),
//   {{4}} enlace de confirmación (ej. https://TU-DOMINIO/cotizacion).
//
// Configuración en api/config.local.php (ver api/config.example.php):
//   'wa_enabled', 'wa_phone_number_id', 'wa_token', 'wa_template',
//   'wa_template_lang', 'wa_api_base', 'site_url'.
//
// Ninguna función de este archivo lanza excepciones ni responde HTTP:
// devuelven [bool $ok, string $error] y el panel nunca se rompe por un
// fallo de WhatsApp.

function waConfig(): array {
  static $cfg = null;
  if ($cfg !== null) return $cfg;
  $cfg = [];
  $path = __DIR__ . '/config.local.php';
  if (!is_file($path)) return $cfg;
  $c = require $path;
  if (!is_array($c)) return $cfg;
  $cfg = [
    'enabled' => !empty($c['wa_enabled']),
    'phone_number_id' => trim((string) ($c['wa_phone_number_id'] ?? '')),
    'token' => (string) ($c['wa_token'] ?? ''),
    'template' => trim((string) ($c['wa_template'] ?? '')) ?: 'cotizacion_lista',
    'lang' => trim((string) ($c['wa_template_lang'] ?? '')) ?: 'es_MX',
    'api_base' => rtrim((string) ($c['wa_api_base'] ?? ''), '/') ?: 'https://graph.facebook.com/v21.0',
    'site_url' => rtrim((string) ($c['site_url'] ?? ''), '/'),
  ];
  return $cfg;
}

function waIsConfigured(array $cfg): bool {
  return !empty($cfg['enabled']) && $cfg['phone_number_id'] !== ''
    && $cfg['token'] !== '' && $cfg['template'] !== '' && $cfg['site_url'] !== '';
}

// Teléfono en formato de la API: solo dígitos con lada de México (52).
// Acepta 9611120913, +52 961 112 0913 o 529611120913. Devuelve '' si no
// tiene un formato válido.
function waNormalizePhone(string $phone): string {
  $d = preg_replace('/\D+/', '', $phone) ?? '';
  if (strlen($d) === 12 && str_starts_with($d, '52')) return $d;
  if (strlen($d) === 11 && str_starts_with($d, '1')) $d = substr($d, 1);
  if (strlen($d) === 10) return '52' . $d;
  return '';
}

function waMoney(float $n): string {
  return '$' . number_format($n, 2, '.', ',');
}

// Misma fórmula que totals() en src/model.ts y publicTotals() en
// api/quotes.php: total = subtotal + IVA (si aplica) + envío;
// anticipo = 60 % del total.
function waTotals(array $o): array {
  $subtotal = 0.0;
  foreach (($o['items'] ?? []) as $i) $subtotal += ((float) ($i['quantity'] ?? 0)) * ((float) ($i['unitPrice'] ?? 0));
  $tax = !empty($o['iva']) ? round($subtotal * 0.16 * 100) / 100 : 0;
  $shipping = ($o['delivery'] ?? '') === 'Envío a domicilio' ? (float) ($o['shipping'] ?? 0) : 0;
  $total = $subtotal + $tax + $shipping;
  return ['total' => $total, 'requiredDeposit' => round($total * 0.6 * 100) / 100];
}

// Envía un mensaje de plantilla por la WhatsApp Cloud API.
// Devuelve [true, ''] si Meta lo aceptó, o [false, 'motivo'] si no.
function sendWhatsAppTemplate(string $to, string $template, array $params): array {
  $cfg = waConfig();
  if (!waIsConfigured($cfg)) return [false, 'WhatsApp no configurado'];
  $to = waNormalizePhone($to);
  if ($to === '') return [false, 'Teléfono inválido'];
  $url = $cfg['api_base'] . '/' . $cfg['phone_number_id'] . '/messages';
  $payload = [
    'messaging_product' => 'whatsapp',
    'to' => $to,
    'type' => 'template',
    'template' => [
      'name' => $template,
      'language' => ['code' => $cfg['lang']],
      'components' => [[
        'type' => 'body',
        'parameters' => array_map(
          static fn($p) => ['type' => 'text', 'text' => (string) $p],
          $params
        ),
      ]],
    ],
  ];
  $json = json_encode($payload, JSON_UNESCAPED_UNICODE);
  if ($json === false) return [false, 'No se pudo codificar el mensaje'];
  $headers = ['Authorization: Bearer ' . $cfg['token'], 'Content-Type: application/json'];
  if (function_exists('curl_init')) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_POST => true,
      CURLOPT_POSTFIELDS => $json,
      CURLOPT_HTTPHEADER => $headers,
      CURLOPT_TIMEOUT => 15,
    ]);
    $raw = curl_exec($ch);
    $err = curl_error($ch);
    $code = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);
    if ($raw === false) return [false, 'Error de red: ' . $err];
  } else {
    $ctx = stream_context_create(['http' => [
      'method' => 'POST',
      'header' => implode("\r\n", $headers),
      'content' => $json,
      'timeout' => 15,
      'ignore_errors' => true,
    ]]);
    $raw = @file_get_contents($url, false, $ctx);
    $code = 0;
    foreach (($http_response_header ?? []) as $h) {
      if (preg_match('/^HTTP\/\S+\s+(\d+)/', $h, $m)) $code = (int) $m[1];
    }
    if ($raw === false) return [false, 'Error de red al contactar WhatsApp'];
  }
  $data = json_decode((string) $raw, true);
  if ($code >= 200 && $code < 300 && is_array($data) && !empty($data['messages'][0]['id'])) {
    return [true, ''];
  }
  $msg = is_array($data) ? (string) ($data['error']['message'] ?? '') : '';
  return [false, $msg !== '' ? "Meta ($code): $msg" : "Meta respondió HTTP $code"];
}

// Aviso de "tu cotización ya tiene precio" para un pedido que acaba de
// pasar a 'En cotización'. Persiste la marca wa_price_notified_at y
// audita el resultado. Nunca lanza excepciones.
// Devuelve ['sent' => bool, 'error' => ?string].
function waNotifyQuotePriced(PDO $pdo, array &$order, array $actor): array {
  $cfg = waConfig();
  if (!waIsConfigured($cfg)) return ['sent' => false, 'error' => null];
  $t = waTotals($order);
  $link = $cfg['site_url'] . '/cotizacion';
  [$ok, $err] = sendWhatsAppTemplate(
    (string) ($order['phone'] ?? ''),
    $cfg['template'],
    [(string) ($order['folio'] ?? ''), waMoney((float) $t['total']), waMoney((float) $t['requiredDeposit']), $link]
  );
  $action = $ok ? 'wa.quote_priced' : 'wa.quote_priced_failed';
  $subject = (string) ($order['id'] ?? '');
  try {
    if ($ok) {
      $order['wa_price_notified_at'] = gmdate('Y-m-d\TH:i:s\Z');
      $json = json_encode($order, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
      $pdo->prepare('UPDATE orders SET payload = ? WHERE id = ?')->execute([$json, $subject]);
    }
    // audit_log.subject es VARCHAR(100): se trunca el motivo del fallo.
    $subj = mb_substr($subject . ($ok ? '' : ' ' . $err), 0, 100);
    $pdo->prepare('INSERT INTO audit_log(user_id,action,subject) VALUES(?,?,?)')
      ->execute([(int) ($actor['id'] ?? 0), $action, $subj]);
  } catch (Throwable $e) {
    return ['sent' => false, 'error' => 'No se pudo registrar el aviso: ' . $e->getMessage()];
  }
  return ['sent' => $ok, 'error' => $ok ? null : $err];
}
