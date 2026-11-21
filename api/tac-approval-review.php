<?php
declare(strict_types=1);
require __DIR__.'/bootstrap.php';
require __DIR__.'/tac-permissions.php';
$user = requireUser();
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  header('Allow: POST');
  respond(405,['error'=>'Método no permitido']);
}
requireCsrf();
tacRequirePermission('approvals.review', $user);
$input = body();
if (array_diff(array_keys($input), ['id','version','decision','reason_code','reason_text']) ||
    !isset($input['id'],$input['version'],$input['decision']) ||
    !is_int($input['id']) || $input['id'] < 1 ||
    !is_int($input['version']) || $input['version'] < 1 ||
    !is_string($input['decision']) ||
    !in_array($input['decision'],['approved','rejected','returned'],true)) {
  respond(400,['error'=>'Datos de decisión inválidos']);
}
$decision = $input['decision'];
$reasonCode = $input['reason_code'] ?? null;
$reasonText = $input['reason_text'] ?? null;
$allowedReasons = ['price','quantity','delivery_date','design','missing_info','other'];
if ($decision === 'approved') {
  if ($reasonCode !== null || $reasonText !== null) respond(400,['error'=>'La aprobación no lleva motivo de rechazo']);
} else {
  if (!is_string($reasonCode) || !in_array($reasonCode,$allowedReasons,true)) {
    respond(400,['error'=>'Selecciona un motivo válido']);
  }
  if ($reasonText !== null && (!is_string($reasonText) || mb_strlen(trim($reasonText)) > 1000)) {
    respond(400,['error'=>'Observaciones inválidas']);
  }
  $reasonText = $reasonText === null ? null : trim($reasonText);
  if ($reasonCode === 'other' && ($reasonText === null || mb_strlen($reasonText) < 10)) {
    respond(400,['error'=>'Especifica el motivo Otro (mínimo 10 caracteres)']);
  }
}
try {
  $pdo = db();
  $pdo->beginTransaction();
  $q = $pdo->prepare('SELECT id,status,version,submitted_by FROM tac_approval_requests WHERE id=? FOR UPDATE');
  $q->execute([$input['id']]);
  $row = $q->fetch();
  if (!$row) { $pdo->rollBack(); respond(404,['error'=>'Solicitud no encontrada']); }
  if ($row['status'] !== 'submitted' || (int)$row['version'] !== $input['version']) {
    $pdo->rollBack(); respond(409,['error'=>'Solicitud modificada; actualiza la bandeja']);
  }
  if ((int)$row['submitted_by'] === (int)$user['id']) {
    $pdo->rollBack(); respond(403,['error'=>'No puedes revisar tu propia solicitud']);
  }
  $q = $pdo->prepare("UPDATE tac_approval_requests
    SET status=?,reviewed_by=?,reason_code=?,reason_text=?,reviewed_at=NOW()
    WHERE id=? AND version=? AND status='submitted'");
  $q->execute([$decision,(int)$user['id'],$reasonCode,$reasonText,$input['id'],$input['version']]);
  if ($q->rowCount() !== 1) { $pdo->rollBack(); respond(409,['error'=>'La solicitud cambió de estado']); }
  $q = $pdo->prepare("INSERT INTO tac_audit_events
    (actor_user_id,action_code,entity_type,entity_id,entity_version,outcome,metadata)
    VALUES (?,'tac.approval.review','approval_request',?,?,'success',?)");
  $q->execute([(int)$user['id'],(string)$input['id'],$input['version'],
    json_encode(['decision'=>$decision,'reason_code'=>$reasonCode],JSON_THROW_ON_ERROR)]);
  $pdo->commit();
  respond(200,['ok'=>true,'id'=>$input['id'],'version'=>$input['version'],'status'=>$decision,'orderUpdated'=>false]);
} catch (Throwable $e) {
  if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
  error_log('TAC approval review failed');
  respond(503,['error'=>'No se pudo registrar la decisión']);
}
