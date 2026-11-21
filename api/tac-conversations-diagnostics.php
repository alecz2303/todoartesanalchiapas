<?php
declare(strict_types=1);
require __DIR__.'/bootstrap.php';
require __DIR__.'/tac-permissions.php';
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') respond(405,['error'=>'Método no permitido']);
$user=requireUser();
tacRequirePermission('diagnostics.read',$user);
$pdo=db();
try {
  $tables=$pdo->query("SELECT table_name FROM information_schema.tables WHERE table_schema=DATABASE() AND table_type='BASE TABLE'")->fetchAll(PDO::FETCH_COLUMN);
  $found=[];
  foreach ($tables as $table) {
    // Solo metadatos de tablas con nombres relacionados; nunca leer mensajes ni credenciales.
    if (preg_match('/convers|whatsapp|mensaj|message|chat/i',(string)$table)) {
      $found[]=(string)$table;
    }
  }
  respond(200,[
    'connected'=>false,
    'source'=>'mysql_schema',
    'candidateTables'=>$found,
    'message'=>count($found)>0
      ? 'Se encontraron tablas candidatas; aún no hay un contrato de lectura verificado.'
      : 'No se encontraron tablas candidatas de conversaciones en esta base de datos.',
    'readOnly'=>true,
  ]);
} catch (PDOException $e) {
  error_log('TAC conversations diagnostics failed');
  respond(503,['error'=>'No se pudo consultar el esquema de conversaciones']);
}
