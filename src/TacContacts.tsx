import { useEffect, useMemo, useState } from 'react';
import { MessageCircle, Search, ClipboardList, ShieldCheck, RefreshCw } from 'lucide-react';
import type { Order } from './model';
import { getRobotCapabilities, type RobotCapabilities } from './robotApi';
import './PanelTac.css';
import { tacPhoneKey, tacWhatsAppUrl } from './tacPhone';

type LegacyConversation = { telefono:string; modo_atencion:'robot'|'karo'; actualizado_en:string|null };
type LegacyRead = { connected:boolean; reason?:string|null; conversaciones:LegacyConversation[]; robot:{estado:'activo'|'pausado';actualizadoEn:string|null}|null };
type Contact = { key:string; name:string; phone:string; orders:Order[]; latest:string };
export default function TacContacts({orders,onOpenOrder}:{orders:Order[];onOpenOrder:(order:Order)=>void}) {
 const [search,setSearch]=useState('');
 const [expanded,setExpanded]=useState<string|null>(null);
 const [onlyActive,setOnlyActive]=useState(false);
 const [showTechnical,setShowTechnical]=useState(false);
 const [robotStatus,setRobotStatus]=useState<{state:'loading'|'ready'|'error';data:RobotCapabilities|null}>({state:'loading',data:null});
 const [diagnostic,setDiagnostic]=useState<{status:'loading'|'ready'|'error';tables:string[];message:string}>({status:'loading',tables:[],message:''});
 const [reload,setReload]=useState(0);
 const [legacy,setLegacy]=useState<{state:'loading'|'ready'|'error';data:LegacyRead|null}>({state:'loading',data:null});
 useEffect(()=>{
  const controller=new AbortController();
  setDiagnostic({status:'loading',tables:[],message:''});
  setRobotStatus({state:'loading',data:null});
  setLegacy({state:'loading',data:null});
  fetch('/api/tac-legacy-read.php',{credentials:'same-origin',cache:'no-store',signal:controller.signal})
   .then(async response=>{if(!response.ok)throw new Error('LEGACY_UNAVAILABLE');return response.json() as Promise<LegacyRead>;})
   .then(data=>{if(!controller.signal.aborted)setLegacy({state:'ready',data});})
   .catch(()=>{if(!controller.signal.aborted)setLegacy({state:'error',data:null});});
  getRobotCapabilities(controller.signal)
   .then(data=>{if(!controller.signal.aborted)setRobotStatus({state:'ready',data});})
   .catch(()=>{if(!controller.signal.aborted)setRobotStatus({state:'error',data:null});});
  fetch('/api/tac-conversations-diagnostics.php',{credentials:'same-origin',cache:'no-store',signal:controller.signal})
   .then(async response=>{if(!response.ok)throw new Error('HTTP '+response.status);return response.json();})
   .then(data=>{if(!controller.signal.aborted)setDiagnostic({status:'ready',tables:Array.isArray(data.candidateTables)?data.candidateTables:[],message:String(data.message||'')});})
   .catch(()=>{if(!controller.signal.aborted)setDiagnostic({status:'error',tables:[],message:'No fue posible consultar el diagnóstico autenticado.'});});
  return ()=>controller.abort();
 },[reload]);
 const contacts=useMemo(()=>{
  const map=new Map<string,Contact>();
  for(const order of orders){
   const digits=tacPhoneKey(order.phone||'');
   // Un número puede pertenecer a distintos clientes; no fusionar sus pedidos.
   const customer=(order.customer||'').trim().toLocaleLowerCase('es-MX').replace(/\s+/g,' ');
   const key=digits ? digits+'|'+customer : 'sin-telefono-'+order.id;
   const current=map.get(key);
   if(current){
    current.orders.push(order);
    if((order.createdAt||'')>current.latest){current.latest=order.createdAt;current.name=order.customer||current.name;current.phone=order.phone||current.phone;}
   } else map.set(key,{key,name:order.customer||'Sin nombre',phone:order.phone||'',orders:[order],latest:order.createdAt||''});
  }
  return [...map.values()].sort((a,b)=>b.latest.localeCompare(a.latest));
 },[orders]);
 const conversations=legacy.data?.connected?legacy.data.conversaciones:[];
 const activeOrders=orders.filter(o=>!['Entregado','Cancelado'].includes((o.status||'').trim()));
 const filtered=contacts.filter(c=>
  (!onlyActive||c.orders.some(o=>!['Entregado','Cancelado'].includes((o.status||'').trim())))&&
  (c.name+' '+c.phone+' '+c.orders.map(o=>o.folio).join(' ')).toLocaleLowerCase('es-MX').includes(search.toLocaleLowerCase('es-MX'))
 );
 return <div className="tac-module">
  <div className="tac-module-intro"><div className="tac-module-icon"><MessageCircle size={29}/></div>
   <div><span className="tac-module-tag">Contactos provenientes de Pedidos</span><h2>Atención por WhatsApp</h2>
    <p>Acceso a los contactos registrados en pedidos. Esta lista no es una bandeja de mensajes ni muestra el modo de atención del robot.</p></div>
  </div>
  <section className="panel tac-module-panel" aria-label="Conversaciones del Panel TAC anterior">
   <div className="tac-approval-toolbar"><h3>Conversaciones del Panel TAC anterior</h3><button className="outline" type="button" onClick={()=>setReload(n=>n+1)} disabled={legacy.state==='loading'}><RefreshCw size={16}/> Actualizar</button></div>
   <p>{legacy.state==='loading'?'Consultando el servicio anterior…':legacy.state==='error'?'No se pudo consultar el puente de lectura.':!legacy.data?.connected?'La conexión de lectura con el servidor anterior aún no está configurada o no está disponible.':`${conversations.length} conversaciones recuperadas · Robot: ${legacy.data.robot?.estado||'sin verificar'}`}</p>
   {legacy.data?.connected&&<div className="tac-live-list">{conversations.map((c,i)=><div key={c.telefono+'-'+i}><div><strong>{c.telefono}</strong><span>Atiende: {c.modo_atencion==='robot'?'Robot':'Karo'}</span><small>{c.actualizado_en||'Sin fecha de actualización'}</small></div><div className="tac-live-actions">{tacWhatsAppUrl(c.telefono)&&<a className="outline tac-wa-link" href={tacWhatsAppUrl(c.telefono)!} target="_blank" rel="noopener noreferrer"><MessageCircle size={16}/> Abrir WhatsApp</a>}</div></div>)}</div>}
   <small>Datos de solo lectura; los controles de transferencia y activación no están habilitados.</small>
  </section>
  <div className="tac-live-grid tac-contact-summary">
   <article><MessageCircle size={20}/><span>Contactos de pedidos</span><strong>{contacts.length}</strong></article>
   <article><ClipboardList size={20}/><span>Pedidos activos</span><strong>{activeOrders.length}</strong></article>
   <article><ShieldCheck size={20}/><span>Mensajes conectados</span><strong>No</strong></article>
  </div>
  <div className="tac-approval-toolbar"><button type="button" className="outline" onClick={()=>setShowTechnical(value=>!value)} aria-expanded={showTechnical}>{showTechnical?'Ocultar diagnóstico técnico':'Mostrar diagnóstico técnico'}</button></div>
  {showTechnical&&<>
  <section className="panel tac-module-panel" aria-label="Estado de n8n y Robot Cotizador">
   <h3>Conexión con Robot Cotizador</h3>
   <p><strong>Servicio n8n:</strong> {robotStatus.state==='loading'?'Consultando…':robotStatus.state==='error'?'No se pudo verificar':robotStatus.data?.integrations.n8n==='reachable'?'Accesible desde PHP':robotStatus.data?.integrations.n8n==='unavailable'?'Sin respuesta':'Comprobación local no habilitada'}</p>
   <p><strong>Workflow del robot:</strong> {robotStatus.state!=='ready'?'No verificado':robotStatus.data?.integrations.robotWorkflow==='active'?'Activo en n8n':robotStatus.data?.integrations.robotWorkflow==='inactive'?'Inactivo en n8n':robotStatus.data?.integrations.robotWorkflow==='not_found'?'No encontrado':robotStatus.data?.integrations.robotWorkflow==='unverified'?'No verificable':'Consulta no configurada'}</p>
   <p><strong>Mensajes de WhatsApp:</strong> No conectados a esta interfaz.</p>
   <small>Lectura de estado mediante la API existente; no activa, detiene ni modifica el workflow.</small>
  </section>
  <section className="panel tac-module-panel" aria-label="Diagnóstico de integración de conversaciones">
   <div className="tac-approval-toolbar"><h3>Fuente de conversaciones</h3><button className="outline" type="button" onClick={()=>setReload(n=>n+1)} disabled={diagnostic.status==='loading'}><RefreshCw size={16}/> Actualizar</button></div>
   <p>{diagnostic.status==='loading'?'Comprobando tablas disponibles…':diagnostic.message}</p>
   {diagnostic.tables.length>0&&<p><strong>Tablas candidatas:</strong> {diagnostic.tables.join(', ')}</p>}
   <small>Diagnóstico de solo lectura: no confirma que exista conexión a WhatsApp ni muestra mensajes.</small>
  </section>
  </>}
  <div className="tac-contacts-toolbar"><label htmlFor="tac-contact-search"><Search size={17}/> Buscar contacto, teléfono o folio</label>
   <input id="tac-contact-search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar..." type="search"/>
   <label className="tac-contacts-filter"><input type="checkbox" checked={onlyActive} onChange={e=>setOnlyActive(e.target.checked)}/> Solo clientes con pedidos activos</label></div>
  <section className="panel tac-module-panel"><h3>Contactos registrados ({filtered.length})</h3>
   {filtered.length===0?<p>No se encontraron contactos entre los pedidos cargados.</p>:<div className="tac-live-list">{filtered.map(c=>{
    const latest=[...c.orders].sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||''))[0];
    const url=tacWhatsAppUrl(c.phone);
    return <div key={c.key} className="tac-contact-entry"><div><strong>{c.name}</strong><span>{c.phone||'Sin teléfono'} · {c.orders.length} pedido(s)</span>
     <small>Último pedido: {latest.folio||'Sin folio'} · {latest.status}</small></div>
     <div className="tac-live-actions">{url&&<a className="outline tac-wa-link" href={url} target="_blank" rel="noopener noreferrer"><MessageCircle size={16}/> Abrir WhatsApp</a>}
      <button className="outline" onClick={()=>setExpanded(expanded===c.key?null:c.key)} aria-expanded={expanded===c.key}>{expanded===c.key?'Ocultar pedidos':'Ver pedidos'}</button></div>
     {expanded===c.key&&<div className="tac-contact-orders">{[...c.orders].sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||'')).map(o=>
      <div key={o.id}><span><strong>{o.folio||'Sin folio'}</strong> · {o.status} · {o.deliveryDate||'Sin fecha de entrega'}</span>
       <button className="outline" onClick={()=>onOpenOrder(o)}><ClipboardList size={15}/> Abrir pedido</button></div>)}</div>}
    </div>;
   })}</div>}</section>
  <section className="panel tac-module-notice"><div><ShieldCheck size={20}/><strong>Sin automatizaciones ni mensajes enviados</strong></div>
   <p>Los enlaces abren WhatsApp de forma externa. Para mostrar conversaciones reales, transferencias Robot/Karo y su auditoría se requiere conectar la API de conversaciones existente con autenticación y verificar su contrato.</p>
  </section>
 </div>;
}
