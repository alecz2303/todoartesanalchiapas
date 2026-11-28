<?php
require __DIR__.'/bootstrap.php';
$actor=requireUser();$pdo=db();
if($_SERVER['REQUEST_METHOD']==='GET'){
 $q=$pdo->query('SELECT id,description,measures,unit_price FROM products ORDER BY description ASC LIMIT 3000');
 respond(200,['products'=>$q->fetchAll()]);
}
requirePost();requireCsrf();$b=body();$action=$b['action']??'';
if($action==='import_orders'){
 $rows=$pdo->query('SELECT payload FROM orders ORDER BY updated_at DESC LIMIT 2000')->fetchAll();
 $existing=$pdo->query('SELECT id,description,measures,unit_price FROM products')->fetchAll();
 $key=static function(string $description,string $measures):string{
  $normalized=mb_strtolower(trim(preg_replace('/\\s+/u',' ',$description)),'UTF-8');
  $normalizedMeasures=mb_strtolower(trim(preg_replace('/\\s+/u',' ',$measures)),'UTF-8');
  return $normalized.'|'.$normalizedMeasures;
 };
 $known=[];foreach($existing as $p){$known[$key((string)$p['description'],(string)$p['measures'])]=$p;}
 $insert=$pdo->prepare('INSERT INTO products(description,measures,unit_price) VALUES(?,?,?)');
 $update=$pdo->prepare('UPDATE products SET unit_price=? WHERE id=?');
 $created=0;$updated=0;$skipped=0;$seen=[];
 $pdo->beginTransaction();
 try{
  foreach($rows as $row){
   $order=json_decode((string)$row['payload'],true);
   if(!is_array($order)||!is_array($order['items']??null)){continue;}
   foreach($order['items'] as $item){
    if(!is_array($item)){continue;}
    $description=trim(preg_replace('/\\s+/u',' ',(string)($item['description']??'')));
    $measures=trim(preg_replace('/\\s+/u',' ',(string)($item['dimensions']??'')));
    $unitPrice=is_numeric($item['unitPrice']??null)?(float)$item['unitPrice']:null;
    if(mb_strlen($description)<2||mb_strlen($description)>255||mb_strlen($measures)>120||$unitPrice===null||$unitPrice<0||$unitPrice>=1000000){$skipped++;continue;}
    $k=$key($description,$measures);
    if(isset($seen[$k])){$skipped++;continue;}
    $seen[$k]=true;
    if(isset($known[$k])){
     $old=(float)$known[$k]['unit_price'];
     if($unitPrice!==$old){$update->execute([$unitPrice,$known[$k]['id']]);$known[$k]['unit_price']=$unitPrice;$updated++;}
     else{$skipped++;}
    }else{
     $insert->execute([$description,$measures,$unitPrice]);
     $known[$k]=['id'=>$pdo->lastInsertId(),'description'=>$description,'measures'=>$measures,'unit_price'=>$unitPrice];$created++;
    }
   }
  }
  $pdo->prepare('INSERT INTO audit_log(user_id,action,subject) VALUES(?,?,?)')->execute([$actor['id'],'product.import_orders','created='.$created.',updated='.$updated]);
  $pdo->commit();
 }catch(Throwable $e){$pdo->rollBack();respond(500,['error'=>'No se pudo completar la importación de productos']);}
 respond(200,['ok'=>true,'created'=>$created,'updated'=>$updated,'skipped'=>$skipped]);
}
if($action==='save'){
 $description=trim(preg_replace('/\\s+/u',' ',(string)($b['description']??'')));
 $measures=trim(preg_replace('/\\s+/u',' ',(string)($b['measures']??'')));
 $unitPrice=is_numeric($b['unit_price']??null)?(float)$b['unit_price']:null;
 $id=(int)($b['id']??0);
 if(mb_strlen($description)<2||mb_strlen($description)>255||mb_strlen($measures)>120||$unitPrice===null||$unitPrice<0||$unitPrice>=1000000)respond(400,['error'=>'Datos del producto inválidos']);
 if($id>0){
  $q=$pdo->prepare('UPDATE products SET description=?,measures=?,unit_price=? WHERE id=?');
  $q->execute([$description,$measures,$unitPrice,$id]);
  if(!$q->rowCount()){ $check=$pdo->prepare('SELECT id FROM products WHERE id=?');$check->execute([$id]);if(!$check->fetch())respond(404,['error'=>'Producto no encontrado']);}
 }else{
  $q=$pdo->prepare('SELECT id FROM products WHERE LOWER(description)=LOWER(?) AND LOWER(measures)=LOWER(?) LIMIT 1');
  $q->execute([$description,$measures]);$found=$q->fetch();
  if($found){$id=(int)$found['id'];$pdo->prepare('UPDATE products SET description=?,measures=?,unit_price=? WHERE id=?')->execute([$description,$measures,$unitPrice,$id]);}
  else{$pdo->prepare('INSERT INTO products(description,measures,unit_price) VALUES(?,?,?)')->execute([$description,$measures,$unitPrice]);$id=(int)$pdo->lastInsertId();}
 }
 $pdo->prepare('INSERT INTO audit_log(user_id,action,subject) VALUES(?,?,?)')->execute([$actor['id'],'product.save',(string)$id]);
 respond(200,['ok'=>true,'id'=>$id]);
}
respond(400,['error'=>'Acción desconocida']);
