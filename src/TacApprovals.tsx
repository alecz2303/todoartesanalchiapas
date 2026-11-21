import { useEffect, useState } from 'react';
import { ClipboardCheck, LockKeyhole, RefreshCw, ShieldAlert } from 'lucide-react';
import { getTacApprovals, createTacApprovalDraft, submitTacApproval, getTacApprovalDetail, reviewTacApproval, type TacApprovalDetail, type ApprovalSummary } from './tacApprovalsApi';
import './PanelTac.css';

type ViewState = 'loading' | 'forbidden' | 'not-ready' | 'ready';
const statusLabels: Record<ApprovalSummary['status'], string> = {
 draft: 'Borrador', submitted: 'Pendiente de aprobación',
 returned: 'Por corregir', approved: 'Aprobado', rejected: 'Rechazado',
};
export default function TacApprovals({csrf, onSessionExpired}: {csrf: string; onSessionExpired: () => void}) {
 const [state, setState] = useState<ViewState>('loading');
 const [items, setItems] = useState<ApprovalSummary[]>([]);
 const [currentUserId, setCurrentUserId] = useState<number | null>(null);
 const [submittingId, setSubmittingId] = useState<number | null>(null);
 const [canReview, setCanReview] = useState(false);
 const [detail, setDetail] = useState<TacApprovalDetail | null>(null);
 const [reasonCode, setReasonCode] = useState('');
 const [reasonText, setReasonText] = useState('');
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
  fetch('/api/tac-permissions-check.php',{credentials:'same-origin',cache:'no-store',signal:controller.signal}).then(r=>r.ok?r.json():null).then(p=>{if(!controller.signal.aborted)setCanReview(p?.permissions?.approvalsReview===true)}).catch(()=>{if(!controller.signal.aborted)setCanReview(false)});
  getTacApprovals(controller.signal)
   .then(data => { if (!controller.signal.aborted) { setItems(data.items); setCurrentUserId(data.currentUserId); setState('ready'); } })
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
 async function sendForReview(item: ApprovalSummary) {
  if (submittingId !== null || item.status !== 'draft' || item.submitted_by !== currentUserId) return;
  if (!window.confirm('¿Enviar la solicitud #' + item.id + ' a revisión? No modificará ningún pedido.')) return;
  setSubmittingId(item.id); setSaveError(''); setSaveMessage('');
  try {
   await submitTacApproval(csrf, item.id, item.version);
   setSaveMessage('Solicitud #' + item.id + ' enviada a revisión. La aprobación comercial sigue bloqueada.');
   setReload(n => n + 1);
  } catch (error) {
   if (error instanceof Error && error.message === 'SESSION_EXPIRED') onSessionExpired();
   else setSaveError(error instanceof Error ? error.message : 'No se pudo enviar');
  } finally { setSubmittingId(null); }
 }
 async function openDetail(id: number) {
  setSaveError(''); setSaveMessage(''); setDetail(null); setReasonCode(''); setReasonText('');
  try { setDetail(await getTacApprovalDetail(id)); }
  catch (error) {
   if (error instanceof Error && error.message==='SESSION_EXPIRED') onSessionExpired();
   else setSaveError(error instanceof Error ? error.message : 'No se pudo abrir');
  }
 }
 async function decide(decision: 'approved'|'rejected'|'returned') {
  if (!detail || submittingId !== null || !canReview) return;
  if (decision !== 'approved' && (!reasonCode || (reasonCode === 'other' && reasonText.trim().length < 10))) {
   setSaveError('Selecciona un motivo y explica Otro cuando corresponda.'); return;
  }
  if (!window.confirm('¿Confirmar ' + (decision==='approved'?'aprobación':decision==='returned'?'devolución':'rechazo') + ' de la solicitud #' + detail.id + '? No se modificará el pedido.')) return;
  setSubmittingId(detail.id); setSaveError('');
  try {
   await reviewTacApproval(csrf,{id:detail.id,version:detail.version,decision,...(decision==='approved'?{}:{reason_code:reasonCode,reason_text:reasonText.trim()||undefined})});
   setDetail(null); setSaveMessage('Decisión registrada en la solicitud. El pedido no fue modificado.');
   setReload(n=>n+1);
  } catch (error) {
   if (error instanceof Error && error.message==='SESSION_EXPIRED') onSessionExpired();
   else setSaveError(error instanceof Error ? error.message : 'No se pudo registrar');
  } finally { setSubmittingId(null); }
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
    {saveMessage && <p role="status" className="tac-draft-success">{saveMessage}</p>}
    {saveError && <p role="alert" className="tac-draft-error">{saveError}</p>}
    {items.length === 0 ? <p>No hay solicitudes registradas en la base de prueba.</p> : visibleItems.length === 0 ? <p>No hay solicitudes con ese estado.</p> :
     <div className="tac-approval-scroll"><table className="tac-approval-table"><thead><tr><th>Solicitud</th><th>Identidad</th><th>Pedido</th><th>Versión</th><th>Estado</th><th>Enviada</th><th>Acción</th></tr></thead><tbody>
      {visibleItems.map(item => <tr key={item.id}><td>#{item.id}</td><td><code title={item.request_key}>{item.request_key.slice(0, 8)}…</code></td><td>{item.order_id ?? 'Sin pedido vinculado'}</td><td>{item.version}</td><td>{statusLabels[item.status]}</td><td>{item.submitted_at ?? '—'}</td><td><button type="button" className="outline" onClick={() => void openDetail(item.id)}>Ver detalle</button> {item.status === 'draft' && item.submitted_by === currentUserId ? <button type="button" className="outline" disabled={submittingId !== null} onClick={() => void sendForReview(item)}>{submittingId === item.id ? 'Enviando…' : 'Enviar a revisión'}</button> : null}</td></tr>)}
     </tbody></table></div>}
   </> : <p role="status">{state === 'loading' ? 'Consultando solicitudes…' : state === 'forbidden' ? 'Tu cuenta no tiene permiso para consultar aprobaciones TAC. Es necesario asignar un rol autorizado.' : 'La bandeja aún no está disponible. La migración 002 debe revisarse y aplicarse en la base de prueba antes de consultar solicitudes.'}</p>}
  </section>
  {detail && <section className="panel tac-module-panel" aria-labelledby="tac-review-heading">
   <div className="tac-approval-toolbar"><h3 id="tac-review-heading">Solicitud #{detail.id} · v{detail.version}</h3><button className="outline" type="button" onClick={()=>setDetail(null)}>Cerrar detalle</button></div>
   <p><strong>Estado:</strong> {statusLabels[detail.status]} · <strong>Pedido:</strong> {detail.order_id ?? 'Sin pedido vinculado'}</p>
   <p><strong>Título:</strong> {typeof detail.after.title==='string' ? detail.after.title : '—'}</p>
   <p className="tac-detail-description"><strong>Descripción:</strong> {typeof detail.after.description==='string' ? detail.after.description : '—'}</p>
   {detail.reason_code && <p><strong>Motivo:</strong> {detail.reason_code} {detail.reason_text ?? ''}</p>}
   {canReview && detail.status==='submitted' && detail.submitted_by !== currentUserId && <>
    <h3>Decisión de Karo</h3>
    <label className="tac-review-field">Motivo para rechazar o devolver
     <select value={reasonCode} onChange={e=>setReasonCode(e.target.value)}>
      <option value="">Seleccionar motivo</option>
      <option value="price">Precio</option><option value="quantity">Cantidad</option>
      <option value="delivery_date">Fecha de entrega</option><option value="design">Diseño</option>
      <option value="missing_info">Información incompleta</option><option value="other">Otro</option>
     </select>
    </label>
    <label className="tac-review-field">Observaciones
     <textarea rows={3} maxLength={1000} value={reasonText} onChange={e=>setReasonText(e.target.value)} placeholder="Explica la decisión cuando sea necesario"/>
    </label>
    <div className="tac-review-actions">
     <button type="button" className="outline" disabled={submittingId!==null} onClick={()=>void decide('approved')}>Aprobar solicitud</button>
     <button type="button" className="outline" disabled={submittingId!==null || !reasonCode} onClick={()=>void decide('returned')}>Devolver</button>
     <button type="button" className="outline" disabled={submittingId!==null || !reasonCode} onClick={()=>void decide('rejected')}>Rechazar</button>
    </div>
    <p>La decisión solo cambia el estado de la solicitud; no actualiza pedidos ni envía mensajes.</p>
   </>}
  </section>}
  <section className="panel tac-module-notice"><div><ShieldAlert size={21}/><strong>Operaciones bloqueadas</strong></div>
   <p><LockKeyhole size={15}/> Las decisiones de Karo solo cambian el estado de la solicitud; modificar pedidos y enviar mensajes permanece bloqueado. Los permisos se verifican en el servidor y el listado no devuelve snapshots comerciales.</p>
  </section>
 </div>;
}
