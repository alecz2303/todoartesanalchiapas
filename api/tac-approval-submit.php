<?php
declare(strict_types=1);
require __DIR__.'/bootstrap.php';
require __DIR__.'/tac-permissions.php';
$user = requireUser();
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  header('Allow: POST');
  respond(405, ['error'=>'Método no permitido']);
}
requireCsrf();
tacRequirePermission('approvals.submit', $user);
$data = body();
if (array_diff(array_keys($data), ['id','version']) ||
    !isset($data['id'],$data['version']) ||
    !is_int($data['id']) || $data['id'] < 1 ||
    !is_int($data['version']) || $data['version'] < 1) {
  respond(400, ['error'=>'Solicitud o versión inválida']);
}
try {
  $pdo = db();
  $pdo->beginTransaction();
  $query = $pdo->prepare('SELECT id,request_key,status,version,submitted_by,after_snapshot FROM tac_approval_requests WHERE id=? FOR UPDATE');
  $query->execute([$data['id']]);
  $row = $query->fetch();
  if (!$row) { $pdo->rollBack(); respond(404,['error'=>'Solicitud no encontrada']); }
  if ((int)$row['submitted_by'] !== (int)$user['id']) {
    $pdo->rollBack(); respond(403,['error'=>'Solo quien creó el borrador puede enviarlo']);
  }
  if ($row['status'] !== 'draft' || (int)$row['version'] !== $data['version']) {
    $pdo->rollBack(); respond(409,['error'=>'La solicitud ya cambió de estado o versión']);
  }
  $snapshot = json_decode($row['after_snapshot'], true);
  if (!is_array($snapshot) ||
      !is_string($snapshot['title'] ?? null) || mb_strlen(trim($snapshot['title'])) < 5 ||
      !is_string($snapshot['description'] ?? null) || mb_strlen(trim($snapshot['description'])) < 10) {
    $pdo->rollBack(); respond(409,['error'=>'El borrador no contiene datos válidos para revisión']);
  }
  $latest = $pdo->prepare('SELECT MAX(version) FROM tac_approval_requests WHERE request_key=?');
  $latest->execute([$row['request_key']]);
  if ((int)$latest->fetchColumn() !== (int)$row['version']) {
    $pdo->rollBack(); respond(409,['error'=>'Existe una versión posterior']);
  }
  $update = $pdo->prepare("UPDATE tac_approval_requests SET status='submitted',submitted_at=NOW()
    WHERE id=? AND status='draft' AND version=? AND submitted_by=?");
  $update->execute([$data['id'],$data['version'],(int)$user['id']]);
  if ($update->rowCount() !== 1) {
    $pdo->rollBack(); respond(409,['error'=>'La solicitud cambió; actualiza la bandeja']);
  }
  $audit = $pdo->prepare("INSERT INTO tac_audit_events
    (actor_user_id,action_code,entity_type,entity_id,entity_version,outcome,metadata)
    VALUES (?,'tac.approval.submit','approval_request',?,?,'success',?)");
  $audit->execute([(int)$user['id'],(string)$data['id'],$data['version'],json_encode(['from'=>'draft','to'=>'submitted'],JSON_THROW_ON_ERROR)]);
  $pdo->commit();
  respond(200,['ok'=>true,'id'=>$data['id'],'version'=>$data['version'],'status'=>'submitted']);
} catch (Throwable $e) {
  if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
  error_log('TAC submit error');
  respond(503,['error'=>'No se pudo enviar la solicitud']);
}
