<?php
declare(strict_types=1);
require __DIR__.'/bootstrap.php';
require __DIR__.'/tac-permissions.php';
$user = requireUser();
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
  header('Allow: GET');
  respond(405, ['error' => 'Método no permitido']);
}
$role = tacCurrentRole($user);
respond(200, [
  'schemaVersion' => 1,
  'role' => $role ?? 'unassigned',
  'permissions' => [
    'diagnosticsRead' => tacCan('diagnostics.read', $role),
    'approvalsRead' => tacCan('approvals.read', $role),
    'approvalsApprove' => tacCan('approvals.approve', $role),
    'conversationsHandoff' => tacCan('conversations.handoff', $role),
    'robotControl' => tacCan('robot.control', $role),
  ],
  'operationalPermissionsEnabled' => false,
]);
