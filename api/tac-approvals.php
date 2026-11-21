<?php
declare(strict_types=1);
require __DIR__.'/bootstrap.php';
require __DIR__.'/tac-permissions.php';
$user = requireUser();
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  header('Allow: GET');
  respond(405, ['error' => 'Método no permitido']);
}
tacRequirePermission('approvals.read', $user);
// No retornar snapshots, teléfonos ni información sensible en el listado.
try {
  $query = db()->query("SELECT id, request_key, order_id, version, status, submitted_by, submitted_at, created_at
    FROM tac_approval_requests ORDER BY
    CASE WHEN status = 'submitted' THEN 0 WHEN status = 'returned' THEN 1 ELSE 2 END,
    submitted_at ASC, id ASC LIMIT 100");
  $items = $query->fetchAll();
  // Keep the historical rows accessible via detail/history, but show only the newest
  // version of each request in the active queue to avoid counting returned ancestors.
  $latest = db()->query('SELECT request_key, MAX(version) AS latest_version FROM tac_approval_requests GROUP BY request_key')->fetchAll();
  $latestVersions = [];
  foreach ($latest as $versionRow) $latestVersions[$versionRow['request_key']] = (int)$versionRow['latest_version'];
  $items = array_values(array_filter($items, static function ($item) use ($latestVersions) {
    return (int)$item['version'] === ($latestVersions[$item['request_key']] ?? 0);
  }));
} catch (PDOException $e) {
  error_log('TAC approvals list unavailable');
  respond(503, ['error' => 'Bandeja de aprobaciones no disponible; verifica la migración 002 en la base de prueba']);
}
respond(200, ['schemaVersion' => 1, 'items' => $items, 'readOnly' => true, 'currentUserId' => (int)$user['id']]);
