import { useEffect, useState } from 'react';
import { ClipboardCheck, LockKeyhole, RefreshCw, ShieldAlert } from 'lucide-react';
import { getTacApprovals, createTacApprovalDraft, type ApprovalSummary } from './tacApprovalsApi';
import './PanelTac.css';

type ViewState = 'loading' | 'forbidden' | 'not-ready' | 'ready';
const statusLabels: Record<ApprovalSummary['status'], string> = {
 draft: 'Borrador', submitted: 'Pendiente de aprobación',
 returned: 'Por corregir', approved: 'Aprobado', rejected: 'Rechazado',
};
export default function TacApprovals({csrf, onSessionExpired}: {csrf: string; onSessionExpired: () => void}) {
 const [state, setState] = useState<ViewState>('loading');
 const [items, setItems] = useState<ApprovalSummary[]>([]);
 const [reload, setReload] = useState(0);
 const [title, setTitle] = useState('');
 const [description, setDescription] = useState('');
 const [saving, setSaving] = useState(false);
 const [saveMessage, setSaveMessage] = useState('');
 const [saveError, setSaveError] = useState('');
 const [filter, setFilter] = useState<'all' | ApprovalSummary['status']>('all');
 useEffect(() => {
  const controller = new AbortController();
  setState('loading');
  getTacApprovals(controller.signal)
   .then(data => { if (!controller.signal.aborted) { setItems(data); setState('ready'); } })
   .catch(e => { if (!controller.signal.aborted) setState(e instanceof Error && e.message === 'FORBIDDEN' ? 'forbidden' : 'not-ready'); });
  return () => controller.abort();
 }, [reload]);
 async function saveDraft(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  if (saving || title.trim().length < 5 || description.trim().length < 10) return;
  setSaving(true); setSaveError(''); setSaveMessage('');
  try {
   const created = await createTacApprovalDraft(csrf, {title: title.trim(), description: description.trim()});
   setTitle(''); setDescription('');
   setSaveMessage('Borrador #' + created.id + ' guardado. No se ha enviado a revisión.');
   setReload(n => n + 1);
  } catch (error) {
   if (error instanceof Error && error.message === 'SESSION_EXPIRED') onSessionExpired();
   else setSaveError(error instanceof Error && error.message === 'FORBIDDEN' ? 'No tienes permiso para crear borradores.' : error instanceof Error ? error.message : 'Error al guardar');
  } finally { setSaving(false); }
 }
 const pending = items.filter(item => item.status === 'submitted').length;
 const returned = items.filter(item => item.status === 'returned').length;
 const visibleItems = filter === 'all' ? items : items.filter(item => item.status === filter);
 return <div className="tac-module">
  <div className="tac-module-intro">
   <div className="tac-module-icon"><ClipboardCheck size={29} aria-hidden="true"/></div>
   <div><span className="tac-module-tag">Bandeja de solicitudes · decisiones bloqueadas</span><h2>Aprobaciones de Karo</h2><p>Consulta solicitudes y crea borradores aislados. Aprobar, rechazar y modificar pedidos sigue bloqueado.</p></div>
  </div>
  {state === 'ready' && <section className="panel tac-module-panel" aria-labelledby="tac-draft-heading">
   <h3 id="tac-draft-heading">Nueva solicitud · borrador</h3>
   <p>Describe el cambio que necesita revisión. Guardar no modifica ningún pedido ni envía la solicitud a Karo.</p>
   <form onSubmit={e => void saveDraft(e)} className="tac-draft-form">
    <label htmlFor="tac-draft-title">Título de la solicitud
     <input id="tac-draft-title" required minLength={5} maxLength={120} value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej. Ajustar detalles de un pedido"/>
    </label>
    <label htmlFor="tac-draft-description">Descripción del cambio
     <textarea id="tac-draft-description" required minLength={10} maxLength={2000} rows={4} value={description} onChange={e => setDescription(e.target.value)} placeholder="Explica qué se solicita cambiar y por qué."/>
    </label>
    <button className="primary" type="submit" disabled={saving || title.trim().length < 5 || description.trim().length < 10}>{saving ? 'Guardando…' : 'Guardar borrador'}</button>
    {saveMessage && <p role="status" className="tac-draft-success">{saveMessage}</p>}
    {saveError && <p role="alert" className="tac-draft-error">{saveError}</p>}
   </form>
  </section>}
  <section className="panel tac-module-panel">
   <div className="tac-approval-toolbar"><h3>Solicitudes</h3><button className="outline" type="button" disabled={state === 'loading'} onClick={() => setReload(n => n + 1)}><RefreshCw size={16}/> Actualizar</button></div>
   {state === 'ready' ? <>
    <div className="tac-approval-counts"><span>Pendientes: <strong>{pending}</strong></span><span>Por corregir: <strong>{returned}</strong></span><span>Mostradas: <strong>{items.length}</strong></span></div>
    {items.length > 0 && <div className="tac-approval-toolbar"><label htmlFor="tac-approval-filter">Filtrar por estado</label><select id="tac-approval-filter" value={filter} onChange={e => setFilter(e.target.value as typeof filter)}><option value="all">Todos</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>}
    {items.length === 0 ? <p>No hay solicitudes registradas en la base de prueba.</p> : visibleItems.length === 0 ? <p>No hay solicitudes con ese estado.</p> :
     <div className="tac-approval-scroll"><table className="tac-approval-table"><thead><tr><th>Solicitud</th><th>Identidad</th><th>Pedido</th><th>Versión</th><th>Estado</th><th>Enviada</th></tr></thead><tbody>
      {visibleItems.map(item => <tr key={item.id}><td>#{item.id}</td><td><code title={item.request_key}>{item.request_key.slice(0, 8)}…</code></td><td>{item.order_id ?? 'Sin pedido vinculado'}</td><td>{item.version}</td><td>{statusLabels[item.status]}</td><td>{item.submitted_at ?? '—'}</td></tr>)}
     </tbody></table></div>}
   </> : <p role="status">{state === 'loading' ? 'Consultando solicitudes…' : state === 'forbidden' ? 'Tu cuenta no tiene permiso para consultar aprobaciones TAC. Es necesario asignar un rol autorizado.' : 'La bandeja aún no está disponible. La migración 002 debe revisarse y aplicarse en la base de prueba antes de consultar solicitudes.'}</p>}
  </section>
  <section className="panel tac-module-notice"><div><ShieldAlert size={21}/><strong>Operaciones bloqueadas</strong></div>
   <p><LockKeyhole size={15}/> Solo está habilitada la creación de borradores. Los permisos se verifican en el servidor y el listado no devuelve snapshots comerciales.</p>
  </section>
 </div>;
}
