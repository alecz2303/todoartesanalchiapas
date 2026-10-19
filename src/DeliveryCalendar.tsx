import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, Clock3, ArrowUpRight } from 'lucide-react';
import { type Order, totals, money } from './model';
import './workflow.css';
const iso=(d:Date)=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
const done=(o:Order)=>o.status==='Entregado'||o.status==='Cancelado';
export default function DeliveryCalendar({orders,onOpen}:{orders:Order[];onOpen:(o:Order)=>void}){
 const [month,setMonth]=useState(()=>new Date(new Date().getFullYear(),new Date().getMonth(),1));
 const [selected,setSelected]=useState(()=>iso(new Date()));
 const [filter,setFilter]=useState<'all'|'active'>('active');
 const list=useMemo(()=>orders.filter(o=>o.deliveryDate&&(filter==='all'||!done(o))),[orders,filter]);
 const byDate=useMemo(()=>{const m=new Map<string,Order[]>();for(const o of list){const key=o.deliveryDate.slice(0,10);m.set(key,[...(m.get(key)||[]),o])}return m},[list]);
 const first=new Date(month.getFullYear(),month.getMonth(),1);
 const offset=(first.getDay()+6)%7;
 const days=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
 const cells=Array.from({length:Math.ceil((offset+days)/7)*7},(_,i)=>{const n=i-offset+1;return n>=1&&n<=days?iso(new Date(month.getFullYear(),month.getMonth(),n)):null});
 const picked=byDate.get(selected)||[];
 const shift=(n:number)=>{const d=new Date(month.getFullYear(),month.getMonth()+n,1);setMonth(d);setSelected(iso(d))};
 return <div className="tac-workflow"><div className="tac-workflow-hero"><div><span className="tac-workflow-kicker">🗓️ AGENDA DEL TALLER</span><h2>Calendario de entregas</h2><p>Organiza cada celebración sin perder de vista ninguna fecha.</p></div><CalendarDays size={42}/></div>
 <div className="tac-calendar-shell"><section className="tac-calendar-main"><div className="tac-calendar-toolbar"><div className="tac-calendar-switch"><button aria-label="Mes anterior" onClick={()=>shift(-1)}><ChevronLeft/></button><h3>{month.toLocaleDateString('es-MX',{month:'long',year:'numeric'})}</h3><button aria-label="Mes siguiente" onClick={()=>shift(1)}><ChevronRight/></button></div><div className="tac-calendar-filters"><button className="outline" onClick={()=>{const d=new Date();setMonth(new Date(d.getFullYear(),d.getMonth(),1));setSelected(iso(d))}}>Hoy</button><select aria-label="Filtrar pedidos" value={filter} onChange={e=>setFilter(e.target.value as 'all'|'active')}><option value="active">Solo pendientes</option><option value="all">Todos los estados</option></select></div></div>
 <div className="tac-calendar-grid">{['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(d=><span className="tac-calendar-weekday" key={d}>{d}</span>)}{cells.map((d,i)=>d?<button key={d} className={'tac-calendar-day'+(selected===d?' selected':'')+(iso(new Date())===d?' today':'')} onClick={()=>setSelected(d)} aria-label={d+' '+(byDate.get(d)?.length||0)+' pedidos'}><strong>{Number(d.slice(-2))}</strong>{(byDate.get(d)||[]).length>0&&<span className="tac-calendar-count">{byDate.get(d)?.length} pedido{byDate.get(d)?.length===1?'':'s'}</span>}<div className="tac-calendar-dots">{(byDate.get(d)||[]).slice(0,4).map(o=><i key={o.id} className={o.status==='Entregado'?'complete':o.status==='Cancelado'?'cancelled':'pending'}/>)}</div></button>:<div key={'blank'+i} className="tac-calendar-day blank"/>)}</div></section>
 <aside className="tac-calendar-aside"><span className="tac-workflow-kicker">ENTREGAS DEL DÍA</span><h3>{new Date(selected+'T12:00:00').toLocaleDateString('es-MX',{weekday:'long',day:'numeric',month:'long'})}</h3><p>{picked.length} pedido{picked.length===1?'':'s'} para esta fecha</p>{picked.length?<div className="tac-calendar-agenda">{picked.sort((a,b)=>(a.deliveryTime||'').localeCompare(b.deliveryTime||'')).map(o=><button key={o.id} onClick={()=>onOpen(o)}><span className="tac-calendar-agenda-time"><Clock3 size={14}/>{o.deliveryTime||'Por definir'}</span><strong>{o.customer}</strong><small>{o.folio} · {o.status}</small><span>{money(totals(o).balance)} por cobrar <ArrowUpRight size={14}/></span></button>)}</div>:<div className="tac-workflow-empty">🌷 No hay entregas registradas para este día.</div>}</aside></div></div>
}
