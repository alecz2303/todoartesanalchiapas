<?php
declare(strict_types=1);
require __DIR__.'/bootstrap.php';
requireUser();
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  header('Allow: GET');
  respond(405, ['error' => 'Método no permitido']);
}

// Diagnóstico solo local y opt-in. La URL y el ID nunca proceden del cliente.
$host = $_SERVER['HTTP_HOST'] ?? '';
$localCheck = getenv('TAC_N8N_LOCAL_HEALTHCHECK') === '1'
  && preg_match('/^(localhost|127\\.0\\.0\\.1)(:\\d+)?$/', $host) === 1;
$n8n = 'not_configured';
$workflow = 'not_configured';
if ($localCheck) {
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

  // No hacer esta consulta sin una clave API configurada en el proceso PHP.
  // La respuesta de n8n contiene datos del workflow: solo extraer "active".
  $apiKey = getenv('TAC_N8N_API_KEY');
  if ($apiKey !== false && $apiKey !== '' && $n8n === 'reachable' && function_exists('curl_init')) {
    $workflow = 'unverified';
    $ch = curl_init('http://127.0.0.1:5678/api/v1/workflows/dWTUD02LAVnjEmmJ');
    if ($ch !== false) {
      curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT_MS => 700,
        CURLOPT_TIMEOUT_MS => 1500,
        CURLOPT_FOLLOWLOCATION => false,
        CURLOPT_MAXREDIRS => 0,
        CURLOPT_HTTPHEADER => ['Accept: application/json', 'X-N8N-API-KEY: '.$apiKey],
      ]);
      $response = curl_exec($ch);
      $httpCode = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
      curl_close($ch);
      if ($response !== false && $httpCode === 200) {
        $data = json_decode($response, true);
        if (is_array($data) && ($data['id'] ?? null) === 'dWTUD02LAVnjEmmJ') {
          if (($data['active'] ?? null) === true) $workflow = 'active';
          elseif (($data['active'] ?? null) === false) $workflow = 'inactive';
        }
      } elseif ($httpCode === 404) {
        $workflow = 'not_found';
      }
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
    'robotWorkflow' => $workflow,
  ],
]);
