<?php
declare(strict_types=1);
// CLI only. Renames the existing test account and grants Karo role to a separately created user.
// Does not create passwords; create kramirez using the authenticated Users panel first.
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
$o = getopt('', ['apply', 'confirm-db:']);
$cpath = dirname(__DIR__).'/api/config.local.php';
if (!is_file($cpath)) { fwrite(STDERR, "Falta configuración local.\n"); exit(2); }
$c = require $cpath;
$dbname = (string)($c['db_name'] ?? '');
if (!in_array((string)($c['db_host'] ?? ''), ['localhost','127.0.0.1'], true) || $dbname !== 'todoartesanalchiapas') {
    fwrite(STDERR, "Solo permitido en base local todoartesanalchiapas.\n"); exit(2);
}
$apply = isset($o['apply']);
if ($apply && ($o['confirm-db'] ?? '') !== $dbname) {
    fwrite(STDERR, "Confirma con --confirm-db=todoartesanalchiapas\n"); exit(2);
}
try {
    $pdo = new PDO('mysql:host='.$c['db_host'].';dbname='.$dbname.';charset=utf8mb4',
        $c['db_user'], $c['db_password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false
    ]);
    $pdo->beginTransaction();
    $q = $pdo->query("SELECT id,username,display_name,is_active FROM users WHERE id=1 OR username IN ('arueda','admin','kramirez') ORDER BY id FOR UPDATE");
    $users = $q->fetchAll();
    $admin = null; $karo = null;
    foreach ($users as $u) {
        if ((int)$u['id'] === 1) $admin = $u;
        if ($u['username'] === 'kramirez') $karo = $u;
        if ($u['username'] === 'admin' && (int)$u['id'] !== 1) throw new RuntimeException('El username admin pertenece a otra cuenta.');
    }
    if (!$admin || !in_array($admin['username'], ['arueda','admin'], true) || (int)$admin['is_active'] !== 1) {
        throw new RuntimeException('La cuenta ID 1 no corresponde a arueda/admin activo.');
    }
    if (!$karo || (int)$karo['is_active'] !== 1 || (int)$karo['id'] === 1) {
        throw new RuntimeException('Primero crea kramirez como usuario activo distinto de ID 1 en Usuarios.');
    }
    $roles = $pdo->query('SELECT user_id,role_code FROM tac_user_roles FOR UPDATE')->fetchAll();
    $alecOk = false; $karoHasRole = false;
    foreach ($roles as $r) {
        if ((int)$r['user_id'] === 1 && $r['role_code'] === 'alec') $alecOk = true;
        if ((int)$r['user_id'] === (int)$karo['id']) $karoHasRole = true;
        if ($r['role_code'] === 'karo' && (int)$r['user_id'] !== (int)$karo['id']) throw new RuntimeException('Karo ya está asignado a otra cuenta.');
    }
    if (!$alecOk) throw new RuntimeException('El rol Alec de ID 1 no coincide.');
    if ($karoHasRole) throw new RuntimeException('kramirez ya tiene un rol TAC; revisar antes de continuar.');
    echo "Base: ".$dbname." | ".($apply ? 'APLICAR' : 'SIMULACIÓN')."\n";
    echo "ID 1: ".$admin['username']." -> admin; rol alec se conserva\n";
    echo "Karo: ID ".$karo['id']." username kramirez -> rol karo\n";
    if (!$apply) { $pdo->rollBack(); echo "Sin cambios.\n"; exit(0); }
    if ($admin['username'] !== 'admin') {
        $pdo->prepare("UPDATE users SET username = 'admin' WHERE id = 1 AND username = 'arueda'")->execute();
        $pdo->prepare("INSERT INTO tac_audit_events (actor_user_id,action_code,entity_type,entity_id,outcome,metadata)
            VALUES (1,'tac.user.rename','user','1','success',?)")
            ->execute([json_encode(['from'=>'arueda','to'=>'admin'], JSON_THROW_ON_ERROR)]);
    }
    $pdo->prepare("INSERT INTO tac_user_roles (user_id,role_code,assigned_by) VALUES (?,'karo',1)")
        ->execute([(int)$karo['id']]);
    $pdo->prepare("INSERT INTO tac_audit_events (actor_user_id,action_code,entity_type,entity_id,outcome,metadata)
        VALUES (1,'tac.role.assign','user',?,'success',?)")
        ->execute([(string)$karo['id'], json_encode(['role'=>'karo'], JSON_THROW_ON_ERROR)]);
    $pdo->commit();
    echo "Cuenta admin actualizada; rol Karo asignado y auditoría registrada.\n";
} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    fwrite(STDERR, "Cancelado: ".$e->getMessage()."\n"); exit(1);
}
