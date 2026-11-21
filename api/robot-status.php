<?php
declare(strict_types=1);
require __DIR__.'/bootstrap.php';
requireUser();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  header('Allow: GET');
  respond(405, ['error' => 'Método no permitido']);
}

// Contrato de capacidades: no consulta n8n, Meta ni conversaciones.
// Nunca devolver secretos, URL internas o credenciales al navegador.
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
    'n8n' => 'not_connected',
    'whatsapp' => 'not_connected',
  ],
]);
