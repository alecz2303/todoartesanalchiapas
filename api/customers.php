<?php
require __DIR__.'/bootstrap.php';
$actor=requireUser();$pdo=db();
if($_SERVER['REQUEST_METHOD']==='GET'){
 $q=$pdo->query('SELECT id,name,phone,address FROM customers ORDER BY name ASC LIMIT 3000');
 respond(200,['customers'=>$q->fetchAll()]);
}
requirePost();requireCsrf();$b=body();$action=$b['action']??'';
if($action==='import_orders'){
 $rows=$pdo->query('SELECT payload FROM orders ORDER BY updated_at DESC LIMIT 2000')->fetchAll();
 $existing=$pdo->query('SELECT id,name,phone,address FROM customers')->fetchAll();
 $key=static function(string $name,string $phone):string{
  $normalized=mb_strtolower(trim(preg_replace('/\\s+/u',' ',$name)),'UTF-8');
  $digits=preg_replace('/\\D+/','',$phone);
  return $normalized.'|'.$digits;
 };
 $known=[];foreach($existing as $c){$known[$key((string)$c['name'],(string)$c['phone'])]=$c;}
 $insert=$pdo->prepare('INSERT INTO customers(name,phone,address) VALUES(?,?,?)');
 $update=$pdo->prepare('UPDATE customers SET address=? WHERE id=?');
 $created=0;$updated=0;$skipped=0;
 $pdo->beginTransaction();
 try{
  foreach($rows as $row){
   $order=json_decode((string)$row['payload'],true);
   if(!is_array($order)){$skipped++;continue;}
   $name=trim((string)($order['customer']??''));$phone=trim((string)($order['phone']??''));$address=trim((string)($order['address']??''));
   if(mb_strlen($name)<2||mb_strlen($name)>120||mb_strlen($phone)>40||mb_strlen($address)>2000){$skipped++;continue;}
   $k=$key($name,$phone);
   if(isset($known[$k])){
    $old=trim((string)$known[$k]['address']);
    if(mb_strlen($address)>mb_strlen($old)){
     $update->execute([$address,$known[$k]['id']]);$known[$k]['address']=$address;$updated++;
    }else{$skipped++;}
   }else{
    $insert->execute([$name,$phone,$address]);
    $known[$k]=['id'=>$pdo->lastInsertId(),'name'=>$name,'phone'=>$phone,'address'=>$address];$created++;
   }
  }
  $pdo->prepare('INSERT INTO audit_log(user_id,action,subject) VALUES(?,?,?)')->execute([$actor['id'],'customer.import_orders','created='.$created.',updated='.$updated]);
  $pdo->commit();
 }catch(Throwable $e){$pdo->rollBack();respond(500,['error'=>'No se pudo completar la importación de clientes']);}
 respond(200,['ok'=>true,'created'=>$created,'updated'=>$updated,'skipped'=>$skipped]);
}
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
