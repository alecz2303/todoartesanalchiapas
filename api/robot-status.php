<?php
declare(strict_types=1);
require __DIR__.'/bootstrap.php';
requireUser();
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  header('Allow: GET');
  respond(405, ['error' => 'Método no permitido']);
}

// Opt-in local exclusivamente: nunca aceptar una URL suministrada por el cliente.
// El endpoint /healthz de n8n es solo un indicador de proceso, no de workflows.
$n8n = 'not_configured';
if (getenv('TAC_N8N_LOCAL_HEALTHCHECK') === '1') {
  $n8n = 'unavailable';
  if (function_exists('curl_init')) {
    $ch = curl_init('http://127.0.0.1:5678/healthz');
    if ($ch !== false) {
      curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT_MS => 700,
        CURLOPT_TIMEOUT_MS => 1500,
        CURLOPT_FOLLOWLOCATION => false,
        CURLOPT_MAXREDIRS => 0,
        CURLOPT_HTTPHEADER => ['Accept: application/json'],
      ]);
      $response = curl_exec($ch);
      $httpCode = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
      curl_close($ch);
      if ($response !== false && $httpCode === 200) $n8n = 'reachable';
    }
  }
}
respond(200, [
  'schemaVersion' => 1,
  'mode' => 'preparation',
  'operational' => false,
  'capabilities' => [
    'robotControl' => false,
    'conversationHandoff' => false,
    'quotes' => false,
    'whatsappMessaging' => false,
  ],
  'integrations' => [
    'ordersDatabase' => 'not_checked',
    'n8n' => $n8n,
    'whatsapp' => 'not_connected',
  ],
]);
