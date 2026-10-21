import { CalendarDays, Heart, MapPin, Package, Truck, Wallet } from 'lucide-react';
import { money, totals, type Order } from './model';

const date = (value: string) => {
  if (!value) return '—';
  const day = value.slice(0, 10).split('-');
  return day.length === 3 ? [day[2], day[1], day[0]].join('/') : value;
};

export default function PrintNote({ order }: { order: Order }) {
  const quote = order.status === 'En cotización';
  const amount = totals(order);
  const paid = amount.balance <= 0 && amount.total > 0;
  return <article className="print-sheet" aria-label={quote?"Cotización imprimible":"Nota de pedido imprimible"}>
    {quote?<div className="note-quotation-header"><img src="/logo-todo-artesanal.png" alt="Todo Artesanal Chiapas"/><div><span>TODO ARTESANAL CHIAPAS</span><h2>COTIZACIÓN</h2><p>Una propuesta hecha especialmente para ti ✨</p></div></div>:<div className="note-header-art"><img src="/header.png" alt="Todo Artesanal Chiapas — Nota de pedido, piñatas y decoraciones artesanales" /></div>}
    <div className="note-dates"><div><b>{quote?"Cotización #":"Pedido #"}</b> <span>{order.folio || 'Sin asignar'}</span></div><div><CalendarDays size={19}/><b>Fecha de pedido:</b> {date(order.createdAt)}</div><div><b>Fecha y hora de entrega:</b> {date(order.deliveryDate)} · {order.deliveryTime || 'Por confirmar'}</div></div>
    <section className="note-box note-customer"><h3>DATOS DEL CLIENTE</h3><div className="note-client-grid"><p><b>Nombre:</b> {order.customer || '—'}</p><p><b>Teléfono:</b> {order.phone || '—'}</p><p className="full"><b>Dirección:</b> {order.address || '—'}</p></div></section>
    <section className="note-products"><h3>{quote?"DETALLE DE LA COTIZACIÓN":"DETALLES DEL PEDIDO"}</h3><table><thead><tr><th>Cant.</th><th>Descripción del producto</th><th>Medidas</th><th>Precio unitario</th><th>Importe</th></tr></thead><tbody>{order.items.map(item=><tr key={item.id}><td>{item.quantity}</td><td>{item.description || '—'}{item.observations?.trim() && <div style={{fontSize:'0.85em',marginTop:4,whiteSpace:'pre-wrap'}}><b>Obs.:</b> {item.observations}</div>}</td><td>{item.dimensions || '—'}</td><td>{money(item.unitPrice)}</td><td>{money(item.quantity * item.unitPrice)}</td></tr>)}</tbody></table></section>
    <div className="note-grid">
      <section className="note-box note-instructions"><h3><Heart size={17}/> INDICACIONES ESPECIALES</h3><p>{order.instructions || 'Sin indicaciones especiales.'}</p>{order.eventDate && <p><b>Fecha del evento:</b> {date(order.eventDate)}</p>}</section>
      <section className="note-box note-delivery"><h3><Truck size={18}/> ENTREGA</h3><p><b>Modalidad:</b> {order.delivery}</p><p><b>Dirección:</b> {order.delivery === 'Envío a domicilio' ? order.deliveryAddress || 'Por confirmar' : '6a Oriente Norte #132, Col. Centro'}</p><p><b>Referencias:</b> {order.directions || '—'}</p><p className="note-muted"><MapPin size={12}/> Envío local: {money(amount.shipping)} (editable según el pedido).</p></section>
      <section className="note-box note-terms"><h3><Package size={17}/> {quote?"CONDICIONES DE COTIZACIÓN":"CONDICIONES DEL PEDIDO"}</h3><ul><li>Pedidos con mínimo 25 días de anticipación.</li><li>Se requiere el 60 % de anticipo para confirmar y agendar.</li><li>Los cambios de diseño o fecha deben notificarse con anticipación.</li><li>En cancelaciones por parte del cliente, el anticipo no es reembolsable, sujeto a la legislación aplicable.</li></ul></section>
      <section className="note-box note-payment"><h3><Wallet size={18}/> MÉTODO DE PAGO</h3><p><b>Registrados:</b> {order.payments.length ? [...new Set(order.payments.map(p=>p.method))].join(' / ') : 'Sin pagos registrados'}</p><div className="note-totals"><div><span>Subtotal</span><b>{money(amount.subtotal)}</b></div>{order.iva && <div><span>IVA (16 % productos)</span><b>{money(amount.tax)}</b></div>}<div><span>Envío</span><b>{money(amount.shipping)}</b></div><div className="note-total"><span>{quote?"Total cotizado":"Total del pedido"}</span><b>{money(amount.total)}</b></div><div><span>Anticipo requerido (60 %)</span><b>{money(amount.requiredDeposit)}</b></div><div><span>Anticipo / abonos recibidos</span><b>{money(amount.paid)}</b></div><div className="note-balance"><span>Saldo pendiente</span><b>{money(amount.balance)}</b></div></div><p className="note-payment-state">{paid ? '✓ PAGADO' : 'PENDIENTE DE LIQUIDAR'}</p>{order.payments.length > 0 && <div className="note-payment-history"><b>Pagos:</b> {order.payments.map(p=>`${date(p.date)} · ${p.method} · ${money(p.amount)}`).join(' | ')}</div>}</section>
    </div>
    {!quote&&<div className="note-signature"><div><b>Conformidad del cliente:</b> {order.consent ? 'Condiciones aceptadas' : 'Pendiente de aceptación'}</div><div className="note-signature-line">Firma del cliente</div></div>}
    <footer className="note-footer"><img src="/nota-footer.png" alt="¡Gracias por apoyar lo hecho a mano!" /></footer>
  </article>;
}
