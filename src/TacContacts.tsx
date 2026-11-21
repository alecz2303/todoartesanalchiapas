import { useMemo, useState } from 'react';
import { MessageCircle, Search, ClipboardList, ShieldCheck } from 'lucide-react';
import type { Order } from './model';
import './PanelTac.css';

type Contact = { key:string; name:string; phone:string; orders:Order[]; latest:string };
function whatsappUrl(phone:string):string|null {
 const digits=phone.replace(/\D/g,'');
 if(digits.length===10)return 'https://wa.me/52'+digits;
 if(digits.length===12&&digits.startsWith('52'))return 'https://wa.me/'+digits;
 if(digits.length>=11&&digits.length<=15)return 'https://wa.me/'+digits;
 return null;
}
export default function TacContacts({orders,onOpenOrder}:{orders:Order[];onOpenOrder:(order:Order)=>void}) {
 const [search,setSearch]=useState('');
 const contacts=useMemo(()=>{
  const map=new Map<string,Contact>();
  for(const order of orders){
   const digits=(order.phone||'').replace(/\D/g,'');
   const key=digits||'sin-telefono-'+order.id;
   const current=map.get(key);
   if(current){
    current.orders.push(order);
    if(order.createdAt>current.latest){current.latest=order.createdAt;current.name=order.customer||current.name;current.phone=order.phone||current.phone;}
   } else map.set(key,{key,name:order.customer||'Sin nombre',phone:order.phone||'',orders:[order],latest:order.createdAt||''});
  }
  return [...map.values()].sort((a,b)=>b.latest.localeCompare(a.latest));
 },[orders]);
 const filtered=contacts.filter(c=>(c.name+' '+c.phone+' '+c.orders.map(o=>o.folio).join(' ')).toLocaleLowerCase('es-MX').includes(search.toLocaleLowerCase('es-MX')));
 return <div className="tac-module">
  <div className="tac-module-intro"><div className="tac-module-icon"><MessageCircle size={29}/></div>
   <div><span className="tac-module-tag">Contactos provenientes de Pedidos</span><h2>Atención por WhatsApp</h2>
    <p>Acceso a los contactos registrados en pedidos. Esta lista no es una bandeja de mensajes ni muestra el modo de atención del robot.</p></div>
  </div>
  <div className="tac-contacts-toolbar"><label htmlFor="tac-contact-search"><Search size={17}/> Buscar contacto, teléfono o folio</label>
   <input id="tac-contact-search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar..." type="search"/></div>
  <section className="panel tac-module-panel"><h3>Contactos registrados ({filtered.length})</h3>
   {filtered.length===0?<p>No se encontraron contactos entre los pedidos cargados.</p>:<div className="tac-live-list">{filtered.map(c=>{
    const latest=[...c.orders].sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||''))[0];
    const url=whatsappUrl(c.phone);
    return <div key={c.key}><div><strong>{c.name}</strong><span>{c.phone||'Sin teléfono'} · {c.orders.length} pedido(s)</span>
     <small>Último pedido: {latest.folio||'Sin folio'} · {latest.status}</small></div>
     <div className="tac-live-actions">{url&&<a className="outline tac-wa-link" href={url} target="_blank" rel="noopener noreferrer"><MessageCircle size={16}/> Abrir WhatsApp</a>}
      <button className="outline" onClick={()=>onOpenOrder(latest)}><ClipboardList size={16}/> Ver pedido</button></div></div>;
   })}</div>}</section>
  <section className="panel tac-module-notice"><div><ShieldCheck size={20}/><strong>Sin automatizaciones ni mensajes enviados</strong></div>
   <p>Los enlaces abren WhatsApp de forma externa. Para mostrar conversaciones reales, transferencias Robot/Karo y su auditoría se requiere conectar la API de conversaciones existente con autenticación y verificar su contrato.</p>
  </section>
 </div>;
}
