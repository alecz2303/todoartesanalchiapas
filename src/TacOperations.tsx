import { useMemo } from 'react';
import { CalendarDays, ClipboardList, CreditCard, PackageCheck, ShieldCheck, Wallet } from 'lucide-react';
import { money, totals, type Order } from './model';
import './PanelTac.css';

const localDay = () => {
 const d = new Date();
 return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
};
export default function TacOperations({orders,onOpenOrders,onOpenOrder}:{
 orders:Order[];onOpenOrders:()=>void;onOpenOrder:(order:Order)=>void;
}) {
 const summary=useMemo(()=>{
  const today=localDay();
  const open=orders.filter(o=>o.status!=='Entregado'&&o.status!=='Cancelado');
  const due=open.filter(o=>o.deliveryDate?.slice(0,10)===today);
  const overdue=open.filter(o=>o.deliveryDate && o.deliveryDate.slice(0,10)<today);
  const quotes=open.filter(o=>o.status==='En cotización');
  const unpaid=open.filter(o=>totals(o).paid<totals(o).requiredDeposit);
  const balance=open.reduce((sum,o)=>sum+totals(o).balance,0);
  return {open,due,overdue,quotes,unpaid,balance};
 },[orders]);
 return <div className="tac-module">
  <div className="tac-module-intro">
   <div className="tac-module-icon"><ClipboardList size={29}/></div>
   <div><span className="tac-module-tag">Panel TAC · conectado al sistema de pedidos</span>
    <h2>Operación del negocio</h2>
    <p>Datos reales de los pedidos ya cargados desde MySQL. No se crea otra base ni se duplican registros.</p>
   </div>
  </div>
  <div className="tac-live-grid">
   <article><ClipboardList size={20}/><span>Pedidos en proceso</span><strong>{summary.open.length}</strong></article>
   <article><CalendarDays size={20}/><span>Entregas hoy</span><strong>{summary.due.length}</strong></article>
   <article><CalendarDays size={20}/><span>Entregas vencidas</span><strong>{summary.overdue.length}</strong></article>
   <article><PackageCheck size={20}/><span>En cotización</span><strong>{summary.quotes.length}</strong></article>
   <article><CreditCard size={20}/><span>Anticipo pendiente</span><strong>{summary.unpaid.length}</strong></article>
   <article><Wallet size={20}/><span>Saldo por cobrar (activos)</span><strong>{money(summary.balance)}</strong></article>
  </div>
  <section className="panel tac-module-panel">
   <div className="tac-approval-toolbar"><h3>Atención prioritaria de pedidos</h3><button className="outline" onClick={onOpenOrders}>Abrir pedidos</button></div>
   {summary.overdue.length===0 && summary.due.length===0 && summary.quotes.length===0
    ? <p>Sin entregas vencidas, entregas para hoy ni cotizaciones pendientes entre los pedidos cargados.</p>
    : <div className="tac-live-list">
      {[...summary.overdue.map(o=>({order:o,reason:'Entrega vencida'})),
       ...summary.due.map(o=>({order:o,reason:'Entrega hoy'})),
       ...summary.quotes.map(o=>({order:o,reason:'En cotización'}))]
       .filter((entry,index,array)=>array.findIndex(other=>other.order.id===entry.order.id)===index)
       .slice(0,20).map(({order,reason})=>
        <div key={order.id}><div><strong>{order.folio||'Sin folio'}</strong><span>{order.customer}</span><small>{reason} · {order.deliveryDate||'Sin fecha'}</small></div>
         <button className="outline" onClick={()=>onOpenOrder(order)}>Ver pedido</button></div>)}
     </div>}
  </section>
  <section className="panel tac-module-notice"><div><ShieldCheck size={20}/><strong>Una sola fuente de información</strong></div>
   <p>Este panel consulta el estado de pedidos existente. Las acciones comerciales siguen realizándose en Pedidos. No implica conexión con WhatsApp o n8n.</p>
  </section>
 </div>;
}
