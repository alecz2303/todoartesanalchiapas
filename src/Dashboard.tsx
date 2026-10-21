import { useMemo, useState } from 'react';
import { AlertTriangle, ArrowUpRight, CalendarDays, Columns3, CalendarClock, CheckCircle2, CircleDollarSign, ClipboardList, CreditCard, PackageCheck, Plus, TrendingUp, Wallet, FileText } from 'lucide-react';
import { money, totals, type Order } from './model';
import './dashboard.css';

const day = (s: string) => s?.slice(0,10) || '';
const parseDay = (s:string) => new Date(s + 'T12:00:00');
const dateLabel = (s:string) => s ? parseDay(s).toLocaleDateString('es-MX',{day:'2-digit',month:'short'}) : 'Sin fecha';
const monthKey = (d:Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
const moneyShort = (n:number) => n >= 1000 ? `$${(n/1000).toFixed(n%1000===0?0:1)} mil` : money(n);
const finished = (o:Order) => o.status==='Entregado' || o.status==='Cancelado';

export default function Dashboard({orders,onNew,onOpen,onAll,onCalendar,onProduction,onAlert}:{orders:Order[];onNew:()=>void;onOpen:(order:Order)=>void;onAll:()=>void;onCalendar:()=>void;onProduction:()=>void;onAlert:(kind:'overdue'|'upcoming'|'deposit'|'quotes')=>void}){
  const [period,setPeriod]=useState<'30'|'90'|'all'>('90');
  const today=monthKey(new Date())+'-'+String(new Date().getDate()).padStart(2,'0');
  const todayDate=new Date();todayDate.setHours(12,0,0,0);
  const cutoff=new Date(todayDate);cutoff.setDate(cutoff.getDate()-(period==='30'?30:90));
  const visible=useMemo(()=>period==='all'?orders:orders.filter(o=>new Date(o.createdAt)>=cutoff),[orders,period]);
  const active=orders.filter(o=>!finished(o));
  const overdue=active.filter(o=>day(o.deliveryDate)&&day(o.deliveryDate)<today).sort((a,b)=>a.deliveryDate.localeCompare(b.deliveryDate));
  const next=active.filter(o=>day(o.deliveryDate)&&day(o.deliveryDate)>=today).sort((a,b)=>a.deliveryDate.localeCompare(b.deliveryDate));
  const urgent=next.filter(o=>parseDay(o.deliveryDate).getTime()-todayDate.getTime()<=7*86400000);
  const total=visible.reduce((n,o)=>n+totals(o).total,0);
  const collected=visible.reduce((n,o)=>n+totals(o).paid,0);
  const receivable=orders.filter(o=>o.status!=='Cancelado').reduce((n,o)=>n+totals(o).balance,0);
  const completed=visible.filter(o=>o.status==='Entregado').length;
  const pendingDeposits=active.filter(o=>totals(o).paid<totals(o).requiredDeposit);
  const quotations=orders.filter(o=>o.status==='En cotización');
  const statusData=Object.entries(orders.reduce<Record<string,number>>((a,o)=>{a[o.status]=(a[o.status]||0)+1;return a},{})).sort((a,b)=>b[1]-a[1]);
  const colors=['#FF1493','#2204CC','#00A1C7','#52BF23','#FF7300','#AA00FF','#F2C400','#697386'];
  const months=Array.from({length:6},(_,i)=>{const d=new Date(todayDate.getFullYear(),todayDate.getMonth()-5+i,1);return {key:monthKey(d),label:d.toLocaleDateString('es-MX',{month:'short'}),orders:orders.filter(o=>o.createdAt.slice(0,7)===monthKey(d)).reduce((n,o)=>n+totals(o).total,0),paid:orders.flatMap(o=>o.payments).filter(p=>p.date.slice(0,7)===monthKey(d)).reduce((n,p)=>n+p.amount,0)}});
  const peak=Math.max(1,...months.flatMap(m=>[m.orders,m.paid]));
  const totalCount=statusData.reduce((n,x)=>n+x[1],0);
  let sweep=0;
  const gradient=statusData.length? `conic-gradient(${statusData.map(([_,count],i)=>{const from=sweep;sweep+=count/totalCount*100;return `${colors[i%colors.length]} ${from}% ${sweep}%`}).join(',')})`:'conic-gradient(#e9e6f1 0 100%)';
  const recent=[...orders].sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).slice(0,5);
  const greeting=new Date().getHours()<12?'¡Buenos días, Karelly!':new Date().getHours()<19?'¡Buenas tardes, Karelly!':'¡Buenas noches, Karelly!';
  const todayDeliveries=active.filter(o=>day(o.deliveryDate)===today);
  return <div className="dashboard">
    <div className="dash-welcome"><div><span className="dash-kicker">✨ BIENVENIDA AL TALLER</span><h2>{greeting} <span aria-hidden="true">✿</span></h2><p>Cada pedido es una historia que estamos creando. Aquí tienes todo bajo control.</p></div><div className="dash-actions"><button className="outline" onClick={onAll}><ClipboardList size={17}/> Ver pedidos</button><button className="primary" onClick={onNew}><Plus size={18}/> Nuevo pedido</button></div></div>
    <div className="tac-dash-priorities"><div><span className="dash-kicker">TU DÍA EN EL TALLER</span><h3>Lo más importante de hoy ✨</h3><p>{todayDeliveries.length} entregas para hoy · {overdue.length} atrasadas · {pendingDeposits.length} anticipos incompletos</p></div><div className="tac-dash-shortcuts"><button className="outline" onClick={onCalendar}><CalendarDays size={17}/> Abrir calendario</button><button className="outline" onClick={onProduction}><Columns3 size={17}/> Ver producción</button></div></div>
    <div className="dash-toolbar"><span>Indicadores del periodo</span><select aria-label="Periodo del resumen" value={period} onChange={e=>setPeriod(e.target.value as '30'|'90'|'all')}><option value="30">Últimos 30 días</option><option value="90">Últimos 90 días</option><option value="all">Todo el historial</option></select></div>
    <div className="dash-kpis">
      <article className="dash-kpi pink"><div className="dash-kpi-top"><span>Pedidos del periodo</span><ClipboardList size={20}/></div><strong>{visible.length}</strong><small>{completed} entregados · {visible.filter(o=>o.status==='Cancelado').length} cancelados</small></article>
      <article className="dash-kpi cyan"><div className="dash-kpi-top"><span>Valor de pedidos</span><TrendingUp size={20}/></div><strong>{money(total)}</strong><small>Importe de pedidos creados en el periodo</small></article>
      <article className="dash-kpi green"><div className="dash-kpi-top"><span>Abonos registrados</span><Wallet size={20}/></div><strong>{money(collected)}</strong><small>Pagos de los pedidos del periodo</small></article>
      <article className="dash-kpi orange"><div className="dash-kpi-top"><span>Saldo por cobrar</span><CircleDollarSign size={20}/></div><strong>{money(receivable)}</strong><small>Todos los pedidos no cancelados</small></article>
    </div>
    <div className="dash-alerts">
      <button type="button" className={overdue.length?'dash-alert danger':'dash-alert calm'} onClick={()=>onAlert('overdue')}><AlertTriangle size={21}/><div><strong>{overdue.length} entrega{overdue.length===1?'':'s'} vencida{overdue.length===1?'':'s'}</strong><span>Ver pedidos con fecha anterior a hoy.</span></div><ArrowUpRight size={16} className="dash-alert-arrow"/></button>
      <button type="button" className="dash-alert amber" onClick={()=>onAlert('upcoming')}><CalendarClock size={21}/><div><strong>{urgent.length} entrega{urgent.length===1?'':'s'} en los próximos 7 días</strong><span>Ver entregas próximas.</span></div><ArrowUpRight size={16} className="dash-alert-arrow"/></button>
      <button type="button" className="dash-alert blue" onClick={()=>onAlert('deposit')}><CreditCard size={21}/><div><strong>{pendingDeposits.length} pedido{pendingDeposits.length===1?'':'s'} sin anticipo completo</strong><span>Ver pedidos con anticipo pendiente.</span></div><ArrowUpRight size={16} className="dash-alert-arrow"/></button>
      <button type="button" className="dash-alert quote" onClick={()=>onAlert('quotes')}><FileText size={21}/><div><strong>{quotations.length} cotización{quotations.length===1?'':'es'} pendiente{quotations.length===1?'':'s'}</strong><span>Ver cotizaciones y dar seguimiento.</span></div><ArrowUpRight size={16} className="dash-alert-arrow"/></button>
    </div>
    <div className="dash-charts">
      <section className="dash-card dash-chart-main"><div className="dash-card-heading"><div><h3>Pedidos y pagos por mes</h3><p>Comparación de los últimos seis meses</p></div><div className="dash-legend"><span><i className="dot pink-dot"/> Valor de pedidos</span><span><i className="dot cyan-dot"/> Pagos recibidos</span></div></div><div className="dash-bars" role="img" aria-label="Gráfica de barras con valor de pedidos y pagos recibidos en los últimos seis meses">{months.map(m=><div className="dash-bar-group" key={m.key}><div className="dash-bar-values"><div className="dash-bar pink-bar" style={{height:`${Math.max(m.orders?3:0,m.orders/peak*100)}%`}} title={`Pedidos: ${money(m.orders)}`}/><div className="dash-bar cyan-bar" style={{height:`${Math.max(m.paid?3:0,m.paid/peak*100)}%`}} title={`Pagos: ${money(m.paid)}`}/></div><span>{m.label}</span></div>)}</div><div className="dash-chart-note">Máximo de escala: {moneyShort(peak)} · Los pagos se agrupan por fecha de abono.</div></section>
      <section className="dash-card"><div className="dash-card-heading"><div><h3>Estado de los pedidos</h3><p>Todos los pedidos registrados</p></div></div><div className="dash-donut-row"><div className="dash-donut" style={{background:gradient}} role="img" aria-label={`${totalCount} pedidos distribuidos por estado`}><div><strong>{totalCount}</strong><span>pedidos</span></div></div><div className="dash-status-list">{statusData.length?statusData.map(([name,count],i)=><div key={name}><i className="dot" style={{background:colors[i%colors.length]}}/><span>{name}</span><strong>{count}</strong></div>):<p className="dash-empty">Aún no hay pedidos.</p>}</div></div></section>
    </div>
    <div className="dash-bottom">
      <section className="dash-card"><div className="dash-card-heading"><div><h3><CalendarClock size={19}/> Próximas entregas</h3><p>Ordenadas por fecha de entrega</p></div><button className="dash-text-button" onClick={onAll}>Ver todas <ArrowUpRight size={15}/></button></div>{overdue.length>0&&<p className="dash-overdue"><AlertTriangle size={15}/> {overdue.length} entrega(s) vencida(s) pendientes de revisar</p>}{next.length?<div className="dash-order-list">{next.slice(0,6).map(o=><button key={o.id} className="dash-order" onClick={()=>onOpen(o)}><div className="dash-date"><strong>{parseDay(o.deliveryDate).getDate()}</strong><span>{parseDay(o.deliveryDate).toLocaleDateString('es-MX',{month:'short'})}</span></div><div className="dash-order-info"><strong>{o.customer}</strong><small>{o.folio||'Sin folio'} · {o.deliveryTime||'Hora pendiente'}</small></div><span className="dash-status">{o.status}</span><ArrowUpRight size={17}/></button>)}</div>:<p className="dash-empty"><CheckCircle2 size={18}/> No hay próximas entregas registradas.</p>}</section>
      <section className="dash-card"><div className="dash-card-heading"><div><h3><PackageCheck size={19}/> Pedidos recientes</h3><p>Últimos pedidos creados</p></div><button className="dash-text-button" onClick={onAll}>Ver todos <ArrowUpRight size={15}/></button></div>{recent.length?<div className="dash-order-list">{recent.map(o=><button key={o.id} className="dash-order" onClick={()=>onOpen(o)}><div className="dash-recent-icon"><ClipboardList size={19}/></div><div className="dash-order-info"><strong>{o.customer}</strong><small>{o.folio||'Sin folio'} · {dateLabel(day(o.createdAt))}</small></div><strong className="dash-amount">{money(totals(o).total)}</strong><ArrowUpRight size={17}/></button>)}</div>:<div className="dash-empty dash-empty-cta"><p>¡Tu primer pedido aparecerá aquí!</p><button className="primary" onClick={onNew}><Plus size={16}/> Crear pedido</button></div>}</section>
    </div>
    <p className="dash-disclaimer">Datos calculados con los pedidos cargados desde MySQL. Los importes de pedidos no equivalen necesariamente a ingresos cobrados. No se incluyen costos ni utilidad.</p>
  </div>;
}
