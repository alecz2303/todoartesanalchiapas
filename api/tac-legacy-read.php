<?php
declare(strict_types=1);
require __DIR__.'/bootstrap.php';
require __DIR__.'/tac-permissions.php';
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') respond(405,['error'=>'Método no permitido']);
$user=requireUser();
tacRequirePermission('diagnostics.read',$user);

// Solo lectura. No reenvía cookies PHP ni permite URLs controladas por el navegador.
// Se habilita únicamente cuando el administrador configura una URL local y un token de lectura.
$base=getenv('TAC_LEGACY_READ_BASE');
$token=getenv('TAC_LEGACY_READ_TOKEN');
if (!$base || !$token) respond(200,['connected'=>false,'reason'=>'not_configured','conversaciones'=>[],'robot'=>null]);
$parts=parse_url($base);
$host=$parts['host']??'';
$port=$parts['port']??null;
if (($parts['scheme']??'')!=='http' || !in_array($host,['127.0.0.1','localhost'],true) ||
    !is_int($port) || $port<1024 || $port>65535 || isset($parts['user']) || isset($parts['pass']) ||
    !empty($parts['query']) || !empty($parts['fragment']) || !empty($parts['path'])) {
  respond(503,['error'=>'Origen legado no permitido']);
}
if (!function_exists('curl_init')) respond(503,['error'=>'Extensión HTTP no disponible']);
function legacyGet(string $url,string $token): ?array {
 $ch=curl_init($url);
 if ($ch===false) return null;
 curl_setopt_array($ch,[
  CURLOPT_RETURNTRANSFER=>true,CURLOPT_CONNECTTIMEOUT_MS=>500,CURLOPT_TIMEOUT_MS=>1800,
  CURLOPT_FOLLOWLOCATION=>false,CURLOPT_MAXREDIRS=>0,CURLOPT_PROTOCOLS=>CURLPROTO_HTTP,
  CURLOPT_HTTPHEADER=>['Accept: application/json','Authorization: Bearer '.$token],
 ]);
 $body=curl_exec($ch);
 $code=(int)curl_getinfo($ch,CURLINFO_RESPONSE_CODE);
 curl_close($ch);
 if ($code!==200 || !is_string($body) || strlen($body)>500000) return null;
 $json=json_decode($body,true);
 return is_array($json)?$json:null;
}
$origin='http://'.$host.':'.$port;
$rawConversations=legacyGet($origin.'/api/conversaciones',$token);
$rawRobot=legacyGet($origin.'/api/robot/estado',$token);
if ($rawConversations===null && $rawRobot===null) respond(200,['connected'=>false,'reason'=>'unavailable','conversaciones'=>[],'robot'=>null]);
$conversations=[];
foreach (($rawConversations['conversaciones']??[]) as $item) {
 if (!is_array($item)) continue;
 $phone=$item['telefono']??null;
 $mode=$item['modo_atencion']??null;
 if (!is_string($phone) || !preg_match('/^\\+?[0-9 ()-]{8,24}$/',$phone) || !in_array($mode,['robot','karo'],true)) continue;
 $conversations[]=['telefono'=>$phone,'modo_atencion'=>$mode,'actualizado_en'=>is_string($item['actualizado_en']??null)?substr($item['actualizado_en'],0,40):null];
 if (count($conversations)>=200) break;
}
$state=$rawRobot['estado']??null;
respond(200,[
 'connected'=>$rawConversations!==null,
 'reason'=>$rawConversations===null?'conversations_unavailable':null,
 'conversaciones'=>$conversations,
 'robot'=>in_array($state,['activo','pausado'],true)?['estado'=>$state,'actualizadoEn'=>is_string($rawRobot['actualizadoEn']??null)?substr($rawRobot['actualizadoEn'],0,40):null]:null,
 'readOnly'=>true,
]);
