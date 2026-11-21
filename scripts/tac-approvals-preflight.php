<?php
declare(strict_types=1);
// CLI-only, read-only preflight for migration 002 in a LOCAL test database.
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
$path = dirname(__DIR__).'/api/config.local.php';
if (!is_file($path)) { fwrite(STDERR, "Falta api/config.local.php\n"); exit(2); }
$c = require $path;
$host = (string)($c['db_host'] ?? '');
$name = (string)($c['db_name'] ?? '');
if (!in_array($host, ['localhost', '127.0.0.1'], true) || $name === '') {
    fwrite(STDERR, "Se requiere base de datos local de prueba.\n"); exit(2);
}
try {
    $pdo = new PDO('mysql:host='.$host.';dbname='.$name.';charset=utf8mb4',
        $c['db_user'], $c['db_password'],
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
    $stmt = $pdo->prepare("SELECT TABLE_NAME FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN ('users','orders','tac_user_roles','tac_audit_events','tac_approval_requests')");
    $stmt->execute([$name]);
    $tables = array_column($stmt->fetchAll(), 'TABLE_NAME');
    echo "Base local: ".$name."\n";
    foreach (['users','orders','tac_user_roles','tac_audit_events','tac_approval_requests'] as $table) {
        echo $table.': '.(in_array($table, $tables, true) ? 'EXISTE' : 'FALTA')."\n";
    }
    if (count(array_intersect(['users','orders','tac_user_roles','tac_audit_events'], $tables)) !== 4) {
        fwrite(STDERR, "Faltan dependencias; no ejecutar migración 002.\n"); exit(1);
    }
    $roleRows = $pdo->query('SELECT user_id, role_code FROM tac_user_roles ORDER BY user_id')->fetchAll();
    foreach ($roleRows as $r) echo "Rol: usuario ".$r['user_id']." = ".$r['role_code']."\n";
    if (in_array('tac_approval_requests', $tables, true)) {
        $count = $pdo->query('SELECT COUNT(*) FROM tac_approval_requests')->fetchColumn();
        echo "Solicitudes registradas: ".$count."\n";
        $columnsStmt = $pdo->prepare("SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'tac_approval_requests'");
        $columnsStmt->execute([$name]);
        $columns = array_column($columnsStmt->fetchAll(), 'COLUMN_NAME');
        echo "Identidad request_key: ".(in_array('request_key', $columns, true) ? 'EXISTE' : 'FALTA')."\n";
        $indexStmt = $pdo->prepare("SELECT INDEX_NAME FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'tac_approval_requests'");
        $indexStmt->execute([$name]);
        $indexes = array_column($indexStmt->fetchAll(), 'INDEX_NAME');
        echo "Índice de versiones: ".(in_array('uq_tac_approval_request_version', $indexes, true) ? 'EXISTE' : 'FALTA')."\n";
        echo "La tabla 002 ya existe; NO ejecutar CREATE TABLE de nuevo.\n";
    } else {
        echo "Migración 002 pendiente. El script NO la ejecuta.\n";
    }
    echo "Preflight finalizado sin escrituras.\n";
} catch (Throwable $e) {
    fwrite(STDERR, "Preflight cancelado: ". $e->getMessage()."\n"); exit(1);
}
