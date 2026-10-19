<?php
require __DIR__.'/bootstrap.php';
$actor=requireUser();
$pdo=db();
if($_SERVER['REQUEST_METHOD']==='GET'){
 $q=$pdo->query('SELECT id,username,display_name,is_active,created_at,last_login_at FROM users ORDER BY id');
 respond(200,['users'=>$q->fetchAll()]);
}
requirePost();requireCsrf();$b=body();$action=$b['action']??'';
if($action==='create'){
 $username=trim((string)($b['username']??''));$name=trim((string)($b['display_name']??''));$password=(string)($b['password']??'');
 if(!preg_match('/^[a-zA-Z0-9_.-]{3,80}$/',$username)||mb_strlen($name)<2||mb_strlen($name)>120||strlen($password)<8||strlen($password)>4096)respond(400,['error'=>'Usuario, nombre o contraseña inválidos (mínimo 8 caracteres)']);
 try {$pdo->prepare('INSERT INTO users(username,display_name,password_hash) VALUES(?,?,?)')->execute([$username,$name,password_hash($password,PASSWORD_DEFAULT)]);}
 catch(PDOException $e){respond(409,['error'=>'El usuario ya existe']);}
 $pdo->prepare('INSERT INTO audit_log(user_id,action,subject) VALUES(?,?,?)')->execute([$actor['id'],'user.create',$username]);
 respond(201,['ok'=>true]);
}
if($action==='set_active'){
 $id=(int)($b['id']??0);$active=($b['is_active']??false)?1:0;
 if($id===(int)$actor['id']&&!$active)respond(400,['error'=>'No puedes desactivar tu propia cuenta']);
 $pdo->prepare('UPDATE users SET is_active=? WHERE id=?')->execute([$active,$id]);
 $pdo->prepare('INSERT INTO audit_log(user_id,action,subject) VALUES(?,?,?)')->execute([$actor['id'],'user.set_active',(string)$id]);
 respond(200,['ok'=>true]);
}
respond(400,['error'=>'Acción desconocida']);
