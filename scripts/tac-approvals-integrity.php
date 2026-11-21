<?php
declare(strict_types=1);
// Solo lectura: valida integridad del flujo TAC en la base LOCAL, sin escrituras.
if (PHP_SAPI !== 'cli') {http_response_code(404);exit;}
$configPath=dirname(__DIR__).'/api/config.local.php';
if (!is_file($configPath)) {fwrite(STDERR,"Falta configuración local.\n");exit(2);}
$config=require $configPath;
$host=(string)($config['db_host']??'');
$dbName=(string)($config['db_name']??'');
if (!in_array($host,['localhost','127.0.0.1'],true) || $dbName==='' || $dbName==='information_schema') {
 fwrite(STDERR,"Solo se permite revisar una base MySQL local.\n");exit(2);
}
try {
 $pdo=new PDO('mysql:host='.$host.';dbname='.$dbName.';charset=utf8mb4',
  $config['db_user'],$config['db_password'],[
   PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,
   PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC
  ]);
 $count=(int)$pdo->query('SELECT COUNT(*) FROM tac_approval_requests')->fetchColumn();
 echo "Base local: $dbName\nSolicitudes/versiones: $count\n";
 $checks=[
  'Versiones repetidas por identidad' => "SELECT COUNT(*) FROM (SELECT request_key,version FROM tac_approval_requests GROUP BY request_key,version HAVING COUNT(*)>1) x",
  'Versión inicial distinta de 1' => "SELECT COUNT(*) FROM (SELECT request_key,MIN(version) first_version FROM tac_approval_requests GROUP BY request_key HAVING first_version<>1) x",
  'Secuencia de versiones con huecos' => "SELECT COUNT(*) FROM (SELECT request_key,COUNT(*) total,MAX(version) max_version FROM tac_approval_requests GROUP BY request_key HAVING total<>max_version) x",
  'Revisiones de la propia solicitud' => "SELECT COUNT(*) FROM tac_approval_requests WHERE reviewed_by IS NOT NULL AND reviewed_by=submitted_by",
  'Pendientes sin fecha de envío' => "SELECT COUNT(*) FROM tac_approval_requests WHERE status='submitted' AND submitted_at IS NULL",
  'Decisiones sin revisor' => "SELECT COUNT(*) FROM tac_approval_requests WHERE status IN ('returned','approved','rejected') AND reviewed_by IS NULL",
  'Decisiones sin fecha de revisión' => "SELECT COUNT(*) FROM tac_approval_requests WHERE status IN ('returned','approved','rejected') AND reviewed_at IS NULL",
  'Devoluciones/rechazos sin motivo' => "SELECT COUNT(*) FROM tac_approval_requests WHERE status IN ('returned','rejected') AND (reason_code IS NULL OR reason_code='')",
  'Solicitudes sin autor' => "SELECT COUNT(*) FROM tac_approval_requests WHERE submitted_by IS NULL",
  'Revisiones sin estado terminal' => "SELECT COUNT(*) FROM tac_approval_requests WHERE reviewed_by IS NOT NULL AND status NOT IN ('returned','approved','rejected')",
  'Borradores con fecha de envío' => "SELECT COUNT(*) FROM tac_approval_requests WHERE status='draft' AND submitted_at IS NOT NULL",
  'Versiones posteriores sin anterior' => "SELECT COUNT(*) FROM tac_approval_requests child LEFT JOIN tac_approval_requests parent ON child.request_key=parent.request_key AND parent.version=child.version-1 WHERE child.version>1 AND parent.id IS NULL",
  'Versiones posteriores sin snapshot previo' => "SELECT COUNT(*) FROM tac_approval_requests WHERE version>1 AND before_snapshot IS NULL",
  'Versiones posteriores cuyo origen no fue devuelto' => "SELECT COUNT(*) FROM tac_approval_requests child INNER JOIN tac_approval_requests parent ON child.request_key=parent.request_key AND parent.version=child.version-1 WHERE child.version>1 AND parent.status<>'returned'"
 ];
 $problems=0;
 foreach($checks as $name=>$sql){
  $n=(int)$pdo->query($sql)->fetchColumn();
  echo ($n===0?'OK':'REVISAR')." | $name: $n\n";
  if($n>0)$problems++;
 }
 echo "Revisión finalizada sin escrituras.\n";
 exit($problems===0?0:1);
} catch(Throwable $e) {
 fwrite(STDERR,"No fue posible revisar la base local: ".$e->getMessage()."\n");exit(2);
}
