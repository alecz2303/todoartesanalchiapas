<?php
declare(strict_types=1);
// Cotizador público de Todo Artesanal Chiapas (TACAPP-30).
//
// Endpoints SIN login. La sesión solo guarda el token CSRF y el contador
// del límite de intentos; nunca expone datos del panel.
//   GET  ?action=csrf                     → {csrf}
//   POST ?action=request (CSRF)            → crea un Order con estado
//                                            'Solicitud recibida' y responde {ok, folio}
//   GET  ?action=view&folio=...&phone=... → vista pública de la cotización
//   POST ?action=confirm (CSRF)            → 'En cotización' → 'Esperando anticipo'
//
// La cotización ES un pedido (Order) con el precio por definir: el admin le
// pone el precio unitario en el panel y cambia el estado a 'En cotización'.
// El anticipo es el 60 % del total (totals() en src/model.ts); no se toca.
//
// Nota: el aviso "Te avisaremos por WhatsApp cuando tenga precio" es
// AUTOMÁTICO: cuando el admin le pone precio en el panel (el pedido pasa
// a 'En cotización'), api/orders.php manda el mensaje con la plantilla
// 'cotizacion_lista' (ver api/whatsapp.php). Sin configuración de WhatsApp
// no se manda nada y el panel sigue funcionando igual.
require __DIR__.'/bootstrap.php';

date_default_timezone_set('America/Mexico_City');

$PRODUCT_TYPES = ['Piñata','Papel picado','Plástico picado','Taza','Thermo','Playera','Stickers','Otro'];
const QUOTE_MIN_DAYS = 25; // Anticipación mínima del taller.
const QUOTE_RATE_WINDOW = 600; // Ventana en segundos (10 minutos).

function uuidv4(): string {
  $b = random_bytes(16);
  $b[6] = chr((ord($b[6]) & 0x0f) | 0x40);
  $b[8] = chr((ord($b[8]) & 0x3f) | 0x80);
  return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($b), 4));
}

// Teléfono canónico para comparar: solo dígitos, sin lada 52 / prefijo 1.
function canonicalPhone(string $phone): string {
  $d = preg_replace('/\D+/', '', $phone) ?? '';
  if (strlen($d) === 12 && str_starts_with($d, '52')) $d = substr($d, 2);
  if (strlen($d) === 11 && str_starts_with($d, '1')) $d = substr($d, 1);
  return $d;
}

// Límite básico por sesión/IP, sin tablas nuevas. Cada acción tiene su
// propio contador: consultar el estado no gasta los intentos de crear
// solicitudes, y los errores de validación no cuentan (el límite de
// 'request' se aplica solo cuando la solicitud ya es válida).
function throttle(string $key, int $max): void {
  $now = time();
  $ip = $_SERVER['REMOTE_ADDR'] ?? '';
  $buckets = $_SESSION['quote_rate'] ?? [];
  $bucket = $buckets[$key] ?? ['ip' => $ip, 'ts' => []];
  if (($bucket['ip'] ?? '') !== $ip) $bucket = ['ip' => $ip, 'ts' => []];
  $bucket['ts'] = array_values(array_filter($bucket['ts'], static fn($t) => $t > $now - QUOTE_RATE_WINDOW));
  if (count($bucket['ts']) >= $max) respond(429, ['error' => 'Demasiados intentos. Inténtalo de nuevo en unos minutos.']);
  $bucket['ts'][] = $now;
  $buckets[$key] = $bucket;
  $_SESSION['quote_rate'] = $buckets;
}

// Folio con la misma convención del panel (App.tsx nextFolio): TAC-AAAAMMDD-###.
function nextFolio(PDO $pdo): string {
  $prefix = 'TAC-' . date('Ymd') . '-';
  $q = $pdo->prepare('SELECT folio FROM orders WHERE folio LIKE ?');
  $q->execute([$prefix . '%']);
  $max = 0;
  foreach ($q->fetchAll(PDO::FETCH_COLUMN) as $folio) {
    $n = (int) substr((string) $folio, strrpos((string) $folio, '-') + 1);
    if ($n > $max) $max = $n;
  }
  return $prefix . str_pad((string) ($max + 1), 3, '0', STR_PAD_LEFT);
}

// Totales con la misma fórmula que totals() en src/model.ts.
function publicTotals(array $o): array {
  $subtotal = 0.0;
  foreach ($o['items'] as $i) $subtotal += ((float) $i['quantity']) * ((float) $i['unitPrice']);
  $tax = !empty($o['iva']) ? round($subtotal * 0.16 * 100) / 100 : 0;
  $shipping = ($o['delivery'] ?? '') === 'Envío a domicilio' ? (float) ($o['shipping'] ?? 0) : 0;
  $total = $subtotal + $tax + $shipping;
  $paid = 0.0;
  foreach ($o['payments'] as $p) $paid += (float) $p['amount'];
  return ['subtotal' => $subtotal, 'tax' => $tax, 'shipping' => $shipping, 'total' => $total,
    'requiredDeposit' => round($total * 0.6 * 100) / 100, 'paid' => $paid, 'balance' => max(0, $total - $paid)];
}

// Solo los campos públicos de la cotización; nunca nombre, teléfono ni correo.
function publicView(array $order): array {
  return ['folio' => $order['folio'], 'status' => $order['status'], 'items' => $order['items'],
    'totals' => publicTotals($order), 'deliveryDate' => $order['deliveryDate'], 'eventDate' => $order['eventDate']];
}

function findOrder(PDO $pdo, string $folio): ?array {
  $q = $pdo->prepare('SELECT payload FROM orders WHERE folio = ? LIMIT 1');
  $q->execute([$folio]);
  $row = $q->fetch();
  if (!$row) return null;
  $order = json_decode($row['payload'], true);
  return is_array($order) ? $order : null;
}

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($action === 'csrf') {
  if ($method !== 'GET') respond(405, ['error' => 'Método no permitido']);
  if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));
  respond(200, ['csrf' => $_SESSION['csrf']]);
}

if ($action === 'view') {
  if ($method !== 'GET') respond(405, ['error' => 'Método no permitido']);
  throttle('view', 10);
  $folio = trim((string) ($_GET['folio'] ?? ''));
  $phone = trim((string) ($_GET['phone'] ?? ''));
  if ($folio === '' || strlen($folio) > 40 || $phone === '') respond(400, ['error' => 'Folio y teléfono son obligatorios']);
  $order = findOrder(db(), $folio);
  // Mismo mensaje exista o no, y coincida o no el teléfono: no filtrar datos.
  if ($order === null || ($order['source'] ?? '') !== 'public_quote' || !hash_equals(canonicalPhone((string) ($order['phone'] ?? '')), canonicalPhone($phone))) {
    respond(404, ['error' => 'No encontramos una cotización con ese folio y teléfono']);
  }
  respond(200, ['ok' => true, 'quote' => publicView($order)]);
}

if ($action === 'request') {
  requirePost();
  requireCsrf();
  $b = body();
  $productType = trim((string) ($b['productType'] ?? ''));
  $details = trim((string) ($b['details'] ?? ''));
  $quantity = $b['quantity'] ?? null;
  $eventDate = trim((string) ($b['eventDate'] ?? ''));
  $name = trim((string) ($b['name'] ?? ''));
  $phone = trim((string) ($b['phone'] ?? ''));
  $email = trim((string) ($b['email'] ?? ''));
  $consent = $b['consent'] ?? false;

  if (!in_array($productType, $PRODUCT_TYPES, true)) respond(400, ['error' => 'Tipo de producto inválido']);
  if ($details === '' || mb_strlen($details) < 3 || mb_strlen($details) > 2000) respond(400, ['error' => 'Cuéntanos los detalles: diseño, medidas, colores y temática']);
  if (!is_int($quantity) && !ctype_digit((string) $quantity)) respond(400, ['error' => 'Cantidad inválida']);
  $quantity = (int) $quantity;
  if ($quantity < 1 || $quantity > 999) respond(400, ['error' => 'Cantidad inválida']);
  if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $eventDate) || !checkdate((int) substr($eventDate, 5, 2), (int) substr($eventDate, 8, 2), (int) substr($eventDate, 0, 4))) {
    respond(400, ['error' => 'Fecha del evento inválida']);
  }
  $minDate = (new DateTimeImmutable('today'))->modify('+' . QUOTE_MIN_DAYS . ' days')->format('Y-m-d');
  $maxDate = (new DateTimeImmutable('today'))->modify('+2 years')->format('Y-m-d');
  if ($eventDate < $minDate) respond(400, ['error' => 'Los pedidos requieren al menos ' . QUOTE_MIN_DAYS . ' días de anticipación']);
  if ($eventDate > $maxDate) respond(400, ['error' => 'Fecha del evento demasiado lejana']);
  if ($name === '' || mb_strlen($name) < 2 || mb_strlen($name) > 120) respond(400, ['error' => 'Nombre inválido']);
  $digits = canonicalPhone($phone);
  if ($digits === '' || strlen($digits) < 10 || strlen($digits) > 15) respond(400, ['error' => 'Teléfono inválido']);
  if ($email !== '' && (mb_strlen($email) > 150 || filter_var($email, FILTER_VALIDATE_EMAIL) === false)) respond(400, ['error' => 'Correo inválido']);
  if ($consent !== true) respond(400, ['error' => 'Acepta las condiciones para enviar tu solicitud']);

  // Solo las solicitudes válidas cuentan para el límite.
  throttle('request', 5);

  $pdo = db();
  $id = uuidv4();
  $order = [
    'id' => $id,
    'folio' => '',
    'createdAt' => gmdate('Y-m-d\TH:i:s.v\Z'),
    'source' => 'public_quote',
    'customer' => $name,
    'phone' => $phone,
    'address' => '',
    'deliveryDate' => $eventDate,
    'deliveryTime' => '',
    'eventDate' => $eventDate,
    'delivery' => 'Recoger en tienda',
    'deliveryAddress' => '',
    'directions' => '',
    'instructions' => $email !== '' ? 'Correo: ' . $email : '',
    'iva' => false,
    'shipping' => 0,
    'items' => [[
      'id' => uuidv4(),
      'quantity' => $quantity,
      'description' => $productType,
      'dimensions' => $details,
      'unitPrice' => 0,
    ]],
    'payments' => [],
    'consent' => true,
    'status' => 'Solicitud recibida',
  ];
  $json = json_encode($order, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
  if (strlen($json) > 250000) respond(413, ['error' => 'Solicitud demasiado grande']);

  // El folio es único: si dos solicitudes chocan en el mismo número, se reintenta.
  for ($attempt = 0; $attempt < 5; $attempt++) {
    $order['folio'] = nextFolio($pdo);
    $json = json_encode($order, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    try {
      $q = $pdo->prepare('INSERT INTO orders(id,folio,payload,created_by,updated_by) VALUES(?,?,?,?,?)');
      $q->execute([$id, $order['folio'], $json, null, null]);
      break;
    } catch (PDOException $e) {
      if ($attempt === 4) respond(409, ['error' => 'No se pudo registrar tu solicitud. Inténtalo de nuevo.']);
    }
  }
  $pdo->prepare('INSERT INTO audit_log(user_id,action,subject) VALUES(?,?,?)')->execute([null, 'quote.request', $id]);
  respond(201, ['ok' => true, 'folio' => $order['folio']]);
}

if ($action === 'confirm') {
  requirePost();
  requireCsrf();
  throttle('confirm', 5);
  $b = body();
  $folio = trim((string) ($b['folio'] ?? ''));
  $phone = trim((string) ($b['phone'] ?? ''));
  if ($folio === '' || strlen($folio) > 40 || $phone === '') respond(400, ['error' => 'Folio y teléfono son obligatorios']);
  $pdo = db();
  $order = findOrder($pdo, $folio);
  if ($order === null || ($order['source'] ?? '') !== 'public_quote' || !hash_equals(canonicalPhone((string) ($order['phone'] ?? '')), canonicalPhone($phone))) {
    respond(404, ['error' => 'No encontramos una cotización con ese folio y teléfono']);
  }
  if ($order['status'] === 'Solicitud recibida') {
    respond(409, ['error' => 'Tu cotización aún está en revisión. Te avisaremos por WhatsApp cuando tenga precio.', 'status' => $order['status']]);
  }
  if ($order['status'] !== 'En cotización') {
    respond(409, ['error' => 'Esta cotización ya no se puede confirmar (estado actual: ' . $order['status'] . ').', 'status' => $order['status']]);
  }
  $totals = publicTotals($order);
  if ($totals['total'] <= 0 || $totals['requiredDeposit'] <= 0 || count($order['items'] ?? []) === 0) {
    respond(409, ['error' => 'La cotización todavía no tiene un precio válido']);
  }
  foreach ($order['items'] as $item) {
    if ((float) ($item['unitPrice'] ?? 0) <= 0 || (float) ($item['quantity'] ?? 0) <= 0) {
      respond(409, ['error' => 'La cotización tiene productos pendientes de precio']);
    }
  }
  $order['status'] = 'Esperando anticipo';
  $json = json_encode($order, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
  $pdo->prepare('UPDATE orders SET payload = ? WHERE id = ?')->execute([$json, $order['id']]);
  $pdo->prepare('INSERT INTO audit_log(user_id,action,subject) VALUES(?,?,?)')->execute([null, 'quote.confirm', $order['id']]);
  respond(200, ['ok' => true, 'quote' => publicView($order)]);
}

respond(400, ['error' => 'Acción desconocida']);
