<?php
declare(strict_types=1);
require __DIR__.'/bootstrap.php';
require __DIR__.'/tac-permissions.php';
$user=requireUser();
if ($_SERVER['REQUEST_METHOD'] !== 'GET') { header('Allow: GET'); respond(405,['error'=>'Método no permitido']); }
tacRequirePermission('approvals.read',$user);
$id=filter_input(INPUT_GET,'id',FILTER_VALIDATE_INT,['options'=>['min_range'=>1]]);
if (!$id) respond(400,['error'=>'ID inválido']);
try {
  $q=db()->prepare('SELECT id,request_key,order_id,version,status,submitted_by,before_snapshot,after_snapshot,reason_code,reason_text,submitted_at,reviewed_at FROM tac_approval_requests WHERE id=?');
  $q->execute([$id]);
  $item=$q->fetch();
  if (!$item) respond(404,['error'=>'Solicitud no encontrada']);
  $role=tacCurrentRole($user);
  if ($role!=='karo' && (int)$item['submitted_by']!==(int)$user['id']) respond(403,['error'=>'Sin permiso para consultar detalles']);
  $after=json_decode($item['after_snapshot'],true);
  $before=$item['before_snapshot']===null ? null : json_decode($item['before_snapshot'],true);
  if (!is_array($after)) respond(503,['error'=>'Formato de solicitud inválido']);
  respond(200,['schemaVersion'=>1,'item'=>[
    'id'=>(int)$item['id'],'request_key'=>$item['request_key'],'order_id'=>$item['order_id'],
    'version'=>(int)$item['version'],'status'=>$item['status'],'submitted_by'=>(int)$item['submitted_by'],
    'before'=>$before,'after'=>$after,'reason_code'=>$item['reason_code'],'reason_text'=>$item['reason_text'],
    'submitted_at'=>$item['submitted_at'],'reviewed_at'=>$item['reviewed_at']
  ]]);
} catch (Throwable $e) { error_log('TAC approval detail failed'); respond(503,['error'=>'No se pudo consultar la solicitud']); }
