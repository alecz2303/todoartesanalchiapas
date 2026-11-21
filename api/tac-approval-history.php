<?php
declare(strict_types=1);
require __DIR__.'/bootstrap.php';
require __DIR__.'/tac-permissions.php';
$user=requireUser();
if ($_SERVER['REQUEST_METHOD']!=='GET') {header('Allow: GET');respond(405,['error'=>'Método no permitido']);}
tacRequirePermission('approvals.read',$user);
$id=filter_input(INPUT_GET,'id',FILTER_VALIDATE_INT,['options'=>['min_range'=>1]]);
if (!$id)respond(400,['error'=>'ID inválido']);
try {
 $pdo=db();
 $q=$pdo->prepare('SELECT request_key,submitted_by FROM tac_approval_requests WHERE id=?');
 $q->execute([$id]);$row=$q->fetch();
 if (!$row)respond(404,['error'=>'Solicitud no encontrada']);
 if (tacCurrentRole($user)!=='karo' && (int)$row['submitted_by']!==(int)$user['id'])
  respond(403,['error'=>'Sin permiso para consultar el historial']);
 $q=$pdo->prepare('SELECT id,version,status,submitted_by,submitted_at,reviewed_at,created_at,reason_code FROM tac_approval_requests WHERE request_key=? ORDER BY version DESC LIMIT 50');
 $q->execute([$row['request_key']]);
 respond(200,['schemaVersion'=>1,'items'=>$q->fetchAll()]);
} catch(Throwable $e) {
 error_log('TAC history failed');respond(503,['error'=>'No se pudo consultar el historial']);
}
