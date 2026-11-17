<?php
require __DIR__.'/bootstrap.php';
require __DIR__.'/whatsapp.php';
$actor=requireUser();$pdo=db();
if($_SERVER['REQUEST_METHOD']==='GET'){
 $q=$pdo->query('SELECT payload FROM orders ORDER BY updated_at DESC LIMIT 2000');
 respond(200,['orders'=>array_map(static fn($row)=>json_decode($row['payload'],true),$q->fetchAll())]);
}
requirePost();requireCsrf();$b=body();$action=$b['action']??'';
if($action==='save'){
 $order=$b['order']??null;
 if(!is_array($order)||!preg_match('/^[a-zA-Z0-9-]{10,40}$/',(string)($order['id']??''))||strlen((string)($order['folio']??''))>40||empty($order['customer'])||empty($order['phone'])||empty($order['deliveryDate'])||!is_array($order['items']??null)||!is_array($order['payments']??null))respond(400,['error'=>'Pedido inválido']);
 // Estado anterior, para avisar por WhatsApp solo cuando el pedido
 // PASA a 'En cotización' (no en cada guardado posterior).
 $old=null;
 try {$qo=$pdo->prepare('SELECT payload FROM orders WHERE id=? LIMIT 1');$qo->execute([(string)$order['id']]);$ro=$qo->fetch();if($ro)$old=json_decode($ro['payload'],true);}
 catch(Throwable $e) {$old=null;}
 $json=json_encode($order,JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR);
 if(strlen($json)>250000)respond(413,['error'=>'Pedido demasiado grande']);
 $q=$pdo->prepare('INSERT INTO orders(id,folio,payload,created_by,updated_by) VALUES(?,?,?,?,?) ON DUPLICATE KEY UPDATE payload=VALUES(payload),updated_by=VALUES(updated_by)');
 try {$q->execute([$order['id'],$order['folio'],$json,$actor['id'],$actor['id']]);}
 catch(PDOException $e){respond(409,['error'=>'Conflicto de folio o pedido']);}
 $pdo->prepare('INSERT INTO audit_log(user_id,action,subject) VALUES(?,?,?)')->execute([$actor['id'],'order.save',$order['id']]);
 // Aviso automático de cotización lista. Si WhatsApp no está
 // configurado se omite en silencio; si el envío falla, el guardado
 // sigue siendo exitoso y el fallo queda auditado.
 $wa=['sent'=>false,'error'=>null];
 $oldStatus=is_array($old)?(string)($old['status']??''):'';
 if($oldStatus!=='En cotización'&&($order['status']??'')==='En cotización'&&!empty($order['phone'])&&empty($order['wa_price_notified_at'])){
   try {$wa=waNotifyQuotePriced($pdo,$order,$actor);}
   catch(Throwable $e) {$wa=['sent'=>false,'error'=>$e->getMessage()];}
 }
 respond(200,['ok'=>true,'whatsapp'=>$wa]);
}
respond(400,['error'=>'Acción desconocida']);
