<?php
declare(strict_types=1);
// Incluir desde endpoints TAC después de bootstrap.php.
// Denegación por defecto: ninguna acción operativa está habilitada.
function tacCurrentRole(array $user): ?string {
  try {
    $stmt = db()->prepare('SELECT role_code FROM tac_user_roles WHERE user_id = ? LIMIT 1');
    $stmt->execute([$user['id']]);
    $role = $stmt->fetchColumn();
  } catch (PDOException $e) {
    error_log('TAC permission role lookup failed');
    respond(503, ['error' => 'No se pudo verificar el permiso TAC']);
  }
  return in_array($role, ['karo', 'alec'], true) ? $role : null;
}
function tacCan(string $permission, ?string $role): bool {
  // Única escritura permitida: borradores aislados; sin impacto en pedidos ni robot.
  $allowed = [
    'diagnostics.read' => ['karo', 'alec'],
    'approvals.read' => ['karo', 'alec'],
    'approvals.draft.create' => ['karo', 'alec'],
    'approvals.submit' => ['karo', 'alec'],
    'approvals.review' => ['karo'],
  ];
  return $role !== null && in_array($role, $allowed[$permission] ?? [], true);
}
function tacRequirePermission(string $permission, array $user): void {
  if (!tacCan($permission, tacCurrentRole($user))) {
    respond(403, ['error' => 'Sin permiso TAC para esta operación']);
  }
}
