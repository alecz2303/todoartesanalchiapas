<?php
declare(strict_types=1);
require __DIR__.'/bootstrap.php';
$user = requireUser();
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  header('Allow: GET');
  respond(405, ['error' => 'Método no permitido']);
}
// Solo la cuenta autenticada. Nunca aceptar un user_id del navegador.
try {
  $query = db()->prepare('SELECT role_code FROM tac_user_roles WHERE user_id = ? LIMIT 1');
  $query->execute([$user['id']]);
  $role = $query->fetchColumn();
} catch (PDOException $e) {
  // No mostrar detalles de SQL ni asumir permisos si falta la migración.
  error_log('TAC role lookup failed');
  respond(503, ['error' => 'No se pudo verificar el rol TAC']);
}
if ($role !== false && !in_array($role, ['karo', 'alec'], true)) {
  respond(503, ['error' => 'Rol TAC no reconocido']);
}
respond(200, [
  'schemaVersion' => 1,
  'role' => $role === false ? 'unassigned' : $role,
  'operationalPermissionsEnabled' => false,
]);
