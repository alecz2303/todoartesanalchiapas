<?php
declare(strict_types=1);
require __DIR__.'/bootstrap.php';
require __DIR__.'/tac-permissions.php';
$user = requireUser();
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  header('Allow: POST');
  respond(405, ['error' => 'Método no permitido']);
}
requireCsrf();
tacRequirePermission('approvals.draft.create', $user);
$input = body();
// This endpoint creates an isolated request draft. It never updates orders or sends notifications.
if (array_diff(array_keys($input), ['title','description','order_id'])) {
  respond(400, ['error' => 'Campos no permitidos']);
}
$title = $input['title'] ?? null;
$description = $input['description'] ?? null;
$orderId = $input['order_id'] ?? null;
if (!is_string($title) || !is_string($description) ||
    mb_strlen(trim($title)) < 5 || mb_strlen(trim($title)) > 120 ||
    mb_strlen(trim($description)) < 10 || mb_strlen(trim($description)) > 2000 ||
    ($orderId !== null && (!is_string($orderId) || !preg_match('/^[0-9a-fA-F-]{36}$/D', $orderId)))) {
  respond(400, ['error' => 'Título, descripción o pedido inválidos']);
}
$title = trim($title);
$description = trim($description);
$keyBytes = random_bytes(16);
$keyBytes[6] = chr((ord($keyBytes[6]) & 0x0f) | 0x40);
$keyBytes[8] = chr((ord($keyBytes[8]) & 0x3f) | 0x80);
$hex = bin2hex($keyBytes);
$key = substr($hex,0,8).'-'.substr($hex,8,4).'-'.substr($hex,12,4).'-'.substr($hex,16,4).'-'.substr($hex,20);
try {
  $pdo = db();
  $pdo->beginTransaction();
  if ($orderId !== null) {
    $check = $pdo->prepare('SELECT id FROM orders WHERE id = ? FOR UPDATE');
    $check->execute([$orderId]);
    if (!$check->fetchColumn()) {
      $pdo->rollBack();
      respond(404, ['error' => 'Pedido no encontrado']);
    }
    // The current schema permits only one request per order/version.
    $exists = $pdo->prepare('SELECT id FROM tac_approval_requests WHERE order_id = ? AND version = 1 LIMIT 1');
    $exists->execute([$orderId]);
    if ($exists->fetchColumn()) {
      $pdo->rollBack();
      respond(409, ['error' => 'Ya existe una solicitud inicial para este pedido']);
    }
  }
  $snapshot = json_encode(['title'=>$title, 'description'=>$description], JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
  $insert = $pdo->prepare("INSERT INTO tac_approval_requests
    (order_id,request_key,version,status,submitted_by,after_snapshot)
    VALUES (?,?,1,'draft',?,?)");
  $insert->execute([$orderId,$key,(int)$user['id'],$snapshot]);
  $id = (int)$pdo->lastInsertId();
  $audit = $pdo->prepare("INSERT INTO tac_audit_events
    (actor_user_id,action_code,entity_type,entity_id,entity_version,outcome,metadata)
    VALUES (?,'tac.approval.draft.create','approval_request',?,1,'success',?)");
  $audit->execute([(int)$user['id'],(string)$id,json_encode(['request_key'=>$key,'order_linked'=>$orderId !== null], JSON_THROW_ON_ERROR)]);
  $pdo->commit();
  respond(201, ['ok'=>true,'id'=>$id,'request_key'=>$key,'version'=>1,'status'=>'draft']);
} catch (PDOException $e) {
  if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
  error_log('TAC draft creation database error: '.$e->getCode());
  respond(503, ['error'=>'No fue posible guardar el borrador']);
} catch (Throwable $e) {
  if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
  error_log('TAC draft creation error');
  respond(500, ['error'=>'No fue posible guardar el borrador']);
}
