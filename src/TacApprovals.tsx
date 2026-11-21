import { useEffect, useState } from 'react';
import { ClipboardCheck, LockKeyhole, RefreshCw, ShieldAlert } from 'lucide-react';
import { getTacApprovals, type ApprovalSummary } from './tacApprovalsApi';
import './PanelTac.css';

type ViewState = 'loading' | 'forbidden' | 'not-ready' | 'ready';
const statusLabels: Record<ApprovalSummary['status'], string> = {
 draft: 'Borrador', submitted: 'Pendiente de aprobación',
 returned: 'Por corregir', approved: 'Aprobado', rejected: 'Rechazado',
};
export default function TacApprovals() {
 const [state, setState] = useState<ViewState>('loading');
 const [items, setItems] = useState<ApprovalSummary[]>([]);
 const [reload, setReload] = useState(0);
 useEffect(() => {
  const controller = new AbortController();
  setState('loading');
  getTacApprovals(controller.signal)
   .then(data => { if (!controller.signal.aborted) { setItems(data); setState('ready'); } })
   .catch(e => { if (!controller.signal.aborted) setState(e instanceof Error && e.message === 'FORBIDDEN' ? 'forbidden' : 'not-ready'); });
  return () => controller.abort();
 }, [reload]);
 const pending = items.filter(item => item.status === 'submitted').length;
 const returned = items.filter(item => item.status === 'returned').length;
 return <div className="tac-module">
  <div className="tac-module-intro">
   <div className="tac-module-icon"><ClipboardCheck size={29} aria-hidden="true"/></div>
   <div><span className="tac-module-tag">Bandeja segura · solo lectura</span><h2>Aprobaciones de Karo</h2><p>Consulta de solicitudes reales, sin datos ficticios. No se pueden aprobar, rechazar ni modificar pedidos desde aquí.</p></div>
  </div>
  <section className="panel tac-module-panel">
   <div className="tac-approval-toolbar"><h3>Solicitudes</h3><button className="outline" type="button" disabled={state === 'loading'} onClick={() => setReload(n => n + 1)}><RefreshCw size={16}/> Actualizar</button></div>
   {state === 'ready' ? <>
    <div className="tac-approval-counts"><span>Pendientes: <strong>{pending}</strong></span><span>Por corregir: <strong>{returned}</strong></span><span>Mostradas: <strong>{items.length}</strong></span></div>
    {items.length === 0 ? <p>No hay solicitudes registradas en la base de prueba.</p> :
     <div className="tac-approval-scroll"><table className="tac-approval-table"><thead><tr><th>Solicitud</th><th>Pedido</th><th>Versión</th><th>Estado</th><th>Enviada</th></tr></thead><tbody>
      {items.map(item => <tr key={item.id}><td>#{item.id}</td><td>{item.order_id ?? 'Sin pedido vinculado'}</td><td>{item.version}</td><td>{statusLabels[item.status]}</td><td>{item.submitted_at ?? '—'}</td></tr>)}
     </tbody></table></div>}
   </> : <p role="status">{state === 'loading' ? 'Consultando solicitudes…' : state === 'forbidden' ? 'Tu cuenta no tiene permiso para consultar aprobaciones TAC. Es necesario asignar un rol autorizado.' : 'La bandeja aún no está disponible. La migración 002 debe revisarse y aplicarse en la base de prueba antes de consultar solicitudes.'}</p>}
  </section>
  <section className="panel tac-module-notice"><div><ShieldAlert size={21}/><strong>Operaciones bloqueadas</strong></div>
   <p><LockKeyhole size={15}/> No existen acciones de aprobación ni rechazo. Los permisos se verifican en el servidor y el listado no devuelve snapshots comerciales.</p>
  </section>
 </div>;
}
