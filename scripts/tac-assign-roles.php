<?php
declare(strict_types=1);
// CLI ONLY. Assign roles in a local TEST database, with explicit verified identities.
// Dry-run is the default; use --apply --confirm-db=<actual database name>.
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
$options = getopt('', ['karo-id:', 'alec-id:', 'actor-id:', 'apply', 'confirm-db:']);
$ids = [];
foreach (['karo-id', 'alec-id', 'actor-id'] as $key) {
    $raw = $options[$key] ?? '';
    if (!is_string($raw) || !ctype_digit($raw) || (int)$raw < 1) {
        fwrite(STDERR, "Uso: php scripts/tac-assign-roles.php --karo-id=N --alec-id=N --actor-id=N [--apply --confirm-db=NOMBRE_BD]\n");
        exit(2);
    }
    $ids[$key] = (int)$raw;
}
if ($ids['karo-id'] === $ids['alec-id']) {
    fwrite(STDERR, "Karo y Alec deben tener cuentas diferentes.\n");
    exit(2);
}
$configPath = dirname(__DIR__).'/api/config.local.php';
if (!is_file($configPath)) { fwrite(STDERR, "Falta api/config.local.php\n"); exit(2); }
$config = require $configPath;
$host = (string)($config['db_host'] ?? '');
$name = (string)($config['db_name'] ?? '');
if (!in_array($host, ['localhost', '127.0.0.1'], true) || $name === '') {
    fwrite(STDERR, "Solo se permite MySQL local con nombre de base explícito.\n");
    exit(2);
}
$apply = isset($options['apply']);
if ($apply && ($options['confirm-db'] ?? null) !== $name) {
    fwrite(STDERR, "Para aplicar debes confirmar exactamente la base con --confirm-db=".$name."\n");
    exit(2);
}
try {
    $pdo = new PDO('mysql:host='.$host.';dbname='.$name.';charset=utf8mb4',
        $config['db_user'], $config['db_password'],
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
         PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
         PDO::ATTR_EMULATE_PREPARES => false]);
    $pdo->beginTransaction();
    $stmt = $pdo->prepare('SELECT id, username, display_name, is_active FROM users WHERE id IN (?,?,?) FOR UPDATE');
    $stmt->execute(array_values($ids));
    $users = [];
    foreach ($stmt->fetchAll() as $row) $users[(int)$row['id']] = $row;
    foreach ($ids as $key => $id) {
        if (!isset($users[$id]) || (int)$users[$id]['is_active'] !== 1) {
            throw new RuntimeException("Cuenta inexistente o inactiva: ".$key);
        }
    }
    $existing = $pdo->query('SELECT user_id, role_code FROM tac_user_roles FOR UPDATE')->fetchAll();
    if ($existing) throw new RuntimeException('Ya existen roles TAC. No sobrescribir ni duplicar: revisar manualmente.');
    foreach (['karo-id' => 'karo', 'alec-id' => 'alec'] as $key => $role) {
        $user = $users[$ids[$key]];
        echo strtoupper($role).': id='.$user['id'].' usuario='.$user['username'].' nombre='.$user['display_name']."\n";
    }
    echo "Actor de auditoría: id=".$ids['actor-id']." usuario=".$users[$ids['actor-id']]['username']."\n";
    echo "Base de datos local: ".$name." | Modo: ".($apply ? 'APLICAR' : 'SIMULACIÓN')."\n";
    if (!$apply) { $pdo->rollBack(); echo "Sin cambios. Verifica las identidades antes de aplicar.\n"; exit(0); }
    $insertRole = $pdo->prepare('INSERT INTO tac_user_roles (user_id, role_code, assigned_by) VALUES (?,?,?)');
    $insertAudit = $pdo->prepare("INSERT INTO tac_audit_events
        (actor_user_id, action_code, entity_type, entity_id, outcome, metadata)
        VALUES (?, 'tac.role.assign', 'user', ?, 'success', ?)");
    foreach (['karo-id' => 'karo', 'alec-id' => 'alec'] as $key => $role) {
        $id = $ids[$key];
        $insertRole->execute([$id, $role, $ids['actor-id']]);
        $insertAudit->execute([$ids['actor-id'], (string)$id, json_encode(['role' => $role], JSON_THROW_ON_ERROR)]);
    }
    $pdo->commit();
    echo "Roles asignados y 2 eventos de auditoría registrados en la base de prueba.\n";
} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    fwrite(STDERR, "Operación cancelada: ".$e->getMessage()."\n");
    exit(1);
}
