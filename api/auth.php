<?php
require __DIR__.'/bootstrap.php';
$action=$_GET['action']??'session';
if($action==='session'){
 if(empty($_SESSION['user_id']))respond(200,['authenticated'=>false]);
 $u=requireUser();respond(200,['authenticated'=>true,'user'=>$u,'csrf'=>$_SESSION['csrf']??'']);
}
if($action==='login'){
 requirePost();
 $b=body();$username=trim((string)($b['username']??''));$password=(string)($b['password']??'');
 if(strlen($username)>80||strlen($password)>4096)respond(400,['error'=>'Datos inválidos']);
 $q=db()->prepare('SELECT id,username,display_name,password_hash FROM users WHERE username=? AND is_active=1');
 $q->execute([$username]);$u=$q->fetch();
 if(!$u||!password_verify($password,$u['password_hash'])){
   usleep(300000);respond(401,['error'=>'Usuario o contraseña incorrectos']);
 }
 session_regenerate_id(true);$_SESSION['user_id']=(int)$u['id'];$_SESSION['csrf']=bin2hex(random_bytes(32));
 db()->prepare('UPDATE users SET last_login_at=NOW() WHERE id=?')->execute([$u['id']]);
 unset($u['password_hash']);respond(200,['authenticated'=>true,'user'=>$u,'csrf'=>$_SESSION['csrf']]);
}
if($action==='logout'){requirePost();requireUser();requireCsrf();$_SESSION=[];session_destroy();respond(200,['ok'=>true]);}
respond(404,['error'=>'Acción desconocida']);
