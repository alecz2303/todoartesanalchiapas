<?php
require __DIR__.'/bootstrap.php';
$actor=requireUser();$pdo=db();
if($_SERVER['REQUEST_METHOD']==='GET'){
 $q=$pdo->query('SELECT id,name,phone,address FROM customers ORDER BY name ASC LIMIT 3000');
 respond(200,['customers'=>$q->fetchAll()]);
}
requirePost();requireCsrf();$b=body();$action=$b['action']??'';
if($action==='save'){
 $name=trim((string)($b['name']??''));$phone=trim((string)($b['phone']??''));$address=trim((string)($b['address']??''));
 $id=(int)($b['id']??0);
 if(mb_strlen($name)<2||mb_strlen($name)>120||mb_strlen($phone)>40||mb_strlen($address)>2000)respond(400,['error'=>'Datos del cliente inválidos']);
 if($id>0){
  $q=$pdo->prepare('UPDATE customers SET name=?,phone=?,address=? WHERE id=?');
  $q->execute([$name,$phone,$address,$id]);
  if(!$q->rowCount()){ $check=$pdo->prepare('SELECT id FROM customers WHERE id=?');$check->execute([$id]);if(!$check->fetch())respond(404,['error'=>'Cliente no encontrado']);}
 }else{
  $q=$pdo->prepare('SELECT id FROM customers WHERE LOWER(name)=LOWER(?) AND (phone=? OR (phone="" AND ?="")) LIMIT 1');
  $q->execute([$name,$phone,$phone]);$found=$q->fetch();
  if($found){$id=(int)$found['id'];$pdo->prepare('UPDATE customers SET name=?,phone=?,address=? WHERE id=?')->execute([$name,$phone,$address,$id]);}
  else{$pdo->prepare('INSERT INTO customers(name,phone,address) VALUES(?,?,?)')->execute([$name,$phone,$address]);$id=(int)$pdo->lastInsertId();}
 }
 $pdo->prepare('INSERT INTO audit_log(user_id,action,subject) VALUES(?,?,?)')->execute([$actor['id'],'customer.save',(string)$id]);
 respond(200,['ok'=>true,'id'=>$id]);
}
respond(400,['error'=>'Acción desconocida']);
