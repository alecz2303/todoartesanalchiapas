<?php
declare(strict_types=1);
require __DIR__.'/bootstrap.php';
require __DIR__.'/tac-permissions.php';
$user=requireUser();
if ($_SERVER['REQUEST_METHOD']!=='POST') {header('Allow: POST');respond(405,['error'=>'Método no permitido']);}
requireCsrf();
tacRequirePermission('approvals.draft.create',$user);
$input=body();
if (array_diff(array_keys($input),['id','version','title','description']) ||
    !isset($input['id'],$input['version'],$input['title'],$input['description']) ||
    !is_int($input['id']) || $input['id']<1 || !is_int($input['version']) || $input['version']<1 ||
    !is_string($input['title']) || !is_string($input['description'])) respond(400,['error'=>'Datos inválidos']);
$title=trim($input['title']);$description=trim($input['description']);
if (mb_strlen($title)<5 || mb_strlen($title)>120 || mb_strlen($description)<10 || mb_strlen($description)>2000)
  respond(400,['error'=>'Título o descripción fuera de los límites']);
try {
 $pdo=db();$pdo->beginTransaction();
 $q=$pdo->prepare('SELECT id,request_key,order_id,version,status,submitted_by,after_snapshot FROM tac_approval_requests WHERE id=? FOR UPDATE');
 $q->execute([$input['id']]);$previous=$q->fetch();
 if (!$previous) {$pdo->rollBack();respond(404,['error'=>'Solicitud no encontrada']);}
 if ((int)$previous['submitted_by']!==(int)$user['id']) {$pdo->rollBack();respond(403,['error'=>'Solo el autor puede corregir la solicitud']);}
 if ($previous['status']!=='returned' || (int)$previous['version']!==$input['version']) {
  $pdo->rollBack();respond(409,['error'=>'La solicitud ya cambió; actualiza la bandeja']);
 }
 $latest=$pdo->prepare('SELECT MAX(version) FROM tac_approval_requests WHERE request_key=?');
 $latest->execute([$previous['request_key']]);
 if ((int)$latest->fetchColumn()!==(int)$previous['version']) {
  $pdo->rollBack();respond(409,['error'=>'Ya existe una versión posterior']);
 }
 $newVersion=(int)$previous['version']+1;
 $after=json_encode(['title'=>$title,'description'=>$description],JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR);
 $insert=$pdo->prepare("INSERT INTO tac_approval_requests
 (order_id,request_key,version,status,submitted_by,before_snapshot,after_snapshot)
 VALUES (?,?,?,'draft',?,?,?)");
 $insert->execute([$previous['order_id'],$previous['request_key'],$newVersion,(int)$user['id'],$previous['after_snapshot'],$after]);
 $newId=(int)$pdo->lastInsertId();
 $audit=$pdo->prepare("INSERT INTO tac_audit_events
 (actor_user_id,action_code,entity_type,entity_id,entity_version,outcome,metadata)
 VALUES (?,'tac.approval.revise','approval_request',?,?,'success',?)");
 $audit->execute([(int)$user['id'],(string)$newId,$newVersion,json_encode(['previous_id'=>(int)$previous['id'],'request_key'=>$previous['request_key']],JSON_THROW_ON_ERROR)]);
 $pdo->commit();
 respond(201,['ok'=>true,'id'=>$newId,'request_key'=>$previous['request_key'],'version'=>$newVersion,'status'=>'draft']);
} catch (PDOException $e) {
 if (isset($pdo)&&$pdo->inTransaction())$pdo->rollBack();
 if ($e->getCode()==='23000')respond(409,['error'=>'Ya existe una versión posterior; actualiza la bandeja']);
 error_log('TAC revision DB error');respond(503,['error'=>'No se pudo crear la corrección']);
} catch (Throwable $e) {
 if (isset($pdo)&&$pdo->inTransaction())$pdo->rollBack();
 error_log('TAC revision failed');respond(503,['error'=>'No se pudo crear la corrección']);
}
