<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
ini_set('display_errors', '0');
if (empty($_SERVER['HTTPS']) || $_SERVER['HTTPS'] === 'off') {
  // HTTPS is mandatory in production. Local PHP testing can use localhost.
  $host = $_SERVER['HTTP_HOST'] ?? '';
  if (!preg_match('/^(localhost|127\.0\.0\.1)(:\d+)?$/', $host)) {
    http_response_code(403);
    echo json_encode(['error'=>'HTTPS obligatorio']);
    exit;
  }
}
session_name('tac_session');
session_set_cookie_params(['lifetime'=>0,'path'=>'/api','secure'=>!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off','httponly'=>true,'samesite'=>'Strict']);
session_start();
function respond(int $status, array $data): never {http_response_code($status);echo json_encode($data,JSON_UNESCAPED_UNICODE);exit;}
function db(): PDO {
 $path=__DIR__.'/config.local.php';
 if (!is_file($path)) respond(503,['error'=>'Base de datos no configurada']);
 $c=require $path;
 try {return new PDO('mysql:host='.$c['db_host'].';dbname='.$c['db_name'].';charset=utf8mb4',$c['db_user'],$c['db_password'],[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC,PDO::ATTR_EMULATE_PREPARES=>false]);}
 catch(Throwable $e){error_log($e->getMessage());respond(503,['error'=>'No se pudo conectar a la base de datos']);}
}
function body(): array { $raw=file_get_contents('php://input');$v=json_decode($raw?:'{}',true);if(!is_array($v))respond(400,['error'=>'JSON inválido']);return $v;}
function requireUser(): array {if(empty($_SESSION['user_id']))respond(401,['error'=>'Inicia sesión']);$q=db()->prepare('SELECT id,username,display_name FROM users WHERE id=? AND is_active=1');$q->execute([$_SESSION['user_id']]);$u=$q->fetch();if(!$u){$_SESSION=[];respond(401,['error'=>'Sesión no válida']);}return $u;}
function requireCsrf(): void {$sent=$_SERVER['HTTP_X_CSRF_TOKEN']??'';if(!is_string($sent)||!hash_equals($_SESSION['csrf']??'', $sent))respond(403,['error'=>'Token de seguridad inválido']);}
function requirePost(): void {if($_SERVER['REQUEST_METHOD']!=='POST')respond(405,['error'=>'Método no permitido']);}
