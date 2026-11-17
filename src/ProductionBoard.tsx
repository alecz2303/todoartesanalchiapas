import { useMemo, useState } from 'react';
import { ArrowUpRight, CheckCircle2, Clock3, PackageCheck, Sparkles } from 'lucide-react';
import { type Order, money, totals } from './model';
import './workflow.css';
const lanes=[
 {name:'Por organizar',statuses:['Solicitud recibida','En cotización','Esperando anticipo','Agendado'],color:'purple',hint:'Por confirmar o comenzar'},
 {name:'En elaboración',statuses:['En elaboración'],color:'pink',hint:'Manos a la obra'},
 {name:'Listo para entregar',statuses:['Listo para recoger'],color:'orange',hint:'Preparado para su gran día'},
 {name:'Entregado',statuses:['Entregado'],color:'green',hint:'¡Otra creación hecha con amor!'}
];
export default function ProductionBoard({orders,onOpen,onChangeStatus,busy}:{orders:Order[];onOpen:(o:Order)=>void;onChangeStatus:(o:Order,status:string)=>Promise<boolean>;busy:boolean}){
 const [search,setSearch]=useState('');
 const [includeCancelled,setIncludeCancelled]=useState(false);
 const [moving,setMoving]=useState<string|null>(null);
 const visible=useMemo(()=>orders.filter(o=>(includeCancelled||o.status!=='Cancelado')&&(!search||[o.customer,o.folio,...o.items.map(i=>i.description)].join(' ').toLocaleLowerCase('es-MX').includes(search.toLocaleLowerCase('es-MX')))),[orders,search,includeCancelled]);
 async function move(o:Order,status:string){if(status===o.status)return;setMoving(o.id);try{await onChangeStatus(o,status)}finally{setMoving(null)}}
 return <div className="tac-workflow"><div className="tac-workflow-hero production"><div><span className="tac-workflow-kicker">✂️ MANOS A LA OBRA</span><h2>Tablero de producción</h2><p>De la primera idea hasta la entrega: cada pedido tiene su lugar.</p></div><Sparkles size={42}/></div>
 <div className="tac-production-toolbar"><label>Buscar pedido<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cliente, folio o producto…"/></label><label className="tac-production-check"><input type="checkbox" checked={includeCancelled} onChange={e=>setIncludeCancelled(e.target.checked)}/> Mostrar cancelados</label><span>{visible.length} pedidos visibles</span></div>
 <div className="tac-production-board">{lanes.map(lane=>{const list=visible.filter(o=>lane.statuses.includes(o.status)).sort((a,b)=>(a.deliveryDate||'9999').localeCompare(b.deliveryDate||'9999'));return <section className={'tac-production-lane '+lane.color} key={lane.name}><div className="tac-production-lane-head"><div><h3>{lane.name}</h3><small>{lane.hint}</small></div><strong>{list.length}</strong></div><div className="tac-production-cards">{list.length?list.map(o=><article key={o.id} className="tac-production-card"><div className="tac-production-card-top"><span>{o.folio||'Sin folio'}</span><button aria-label={'Abrir '+o.folio} title="Ver pedido" onClick={()=>onOpen(o)}><ArrowUpRight size={17}/></button></div><h4>{o.customer}</h4><p>{o.items.map(i=>i.description).filter(Boolean).join(' · ')||'Productos por definir'}</p><div className="tac-production-meta"><span><Clock3 size={14}/>{o.deliveryDate||'Sin fecha'} {o.deliveryTime||''}</span><span>{money(totals(o).balance)} pendiente</span></div><label className="tac-production-select">Etapa del pedido<select value={o.status} disabled={busy||moving===o.id} onChange={e=>void move(o,e.target.value)}>{['Solicitud recibida','En cotización','Esperando anticipo','Agendado','En elaboración','Listo para recoger','Entregado','Cancelado'].map(s=><option key={s} value={s}>{s}</option>)}</select></label></article>):<div className="tac-production-empty">{lane.name==='Entregado'?<CheckCircle2 size={22}/>:<PackageCheck size={22}/>}<span>No hay pedidos en esta etapa</span></div>}</div></section>})}</div>
 {includeCancelled&&visible.some(o=>o.status==='Cancelado')&&<section className="tac-production-cancelled"><h3>Pedidos cancelados</h3>{visible.filter(o=>o.status==='Cancelado').map(o=><button key={o.id} className="outline" onClick={()=>onOpen(o)}>{o.folio} · {o.customer} <ArrowUpRight size={15}/></button>)}</section>}
 <p className="tac-workflow-note">Los cambios de etapa se guardan en MySQL. No se crean copias de los pedidos.</p></div>
}
