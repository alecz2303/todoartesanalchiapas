export type ApprovalSummary = {
 id: number;
 request_key: string;
 order_id: string | null;
 version: number;
 status: 'draft' | 'submitted' | 'returned' | 'approved' | 'rejected';
 submitted_by: number | null;
 submitted_at: string | null;
 created_at: string;
};
export async function getTacApprovals(signal?: AbortSignal): Promise<{items: ApprovalSummary[]; currentUserId: number}> {
 const response = await fetch('/api/tac-approvals.php', {
  method: 'GET', credentials: 'same-origin', cache: 'no-store', signal,
 });
 if (!response.ok) {
  if (response.status === 403) throw new Error('FORBIDDEN');
  if (response.status === 401) throw new Error('SESSION_EXPIRED');
  throw new Error('NOT_READY');
 }
 const data: unknown = await response.json();
 if (!data || typeof data !== 'object') throw new Error('INVALID_DATA');
 const v = data as Record<string, unknown>;
 if (v.schemaVersion !== 1 || v.readOnly !== true || !Number.isInteger(v.currentUserId) || !Array.isArray(v.items)) throw new Error('INVALID_DATA');
 const allowed = ['draft', 'submitted', 'returned', 'approved', 'rejected'];
 if (!v.items.every((i: unknown) => {
  if (!i || typeof i !== 'object') return false;
  const x = i as Record<string, unknown>;
  return Number.isInteger(x.id) && typeof x.request_key === 'string' && /^[0-9a-fA-F-]{36}$/.test(x.request_key) && Number.isInteger(x.version) && x.version >= 1 &&
   allowed.includes(String(x.status)) &&
   (x.order_id === null || typeof x.order_id === 'string') &&
   (x.submitted_by === null || Number.isInteger(x.submitted_by)) &&
   (x.submitted_at === null || typeof x.submitted_at === 'string') &&
   typeof x.created_at === 'string';
 })) throw new Error('INVALID_DATA');
 return {items: v.items as ApprovalSummary[], currentUserId: v.currentUserId as number};
}

export async function createTacApprovalDraft(
 csrf: string,
 input: {title: string; description: string},
): Promise<{id: number; request_key: string}> {
 const response = await fetch('/api/tac-approval-drafts.php', {
  method: 'POST', credentials: 'same-origin', cache: 'no-store',
  headers: {'Content-Type':'application/json','X-CSRF-Token':csrf},
  body: JSON.stringify(input),
 });
 const data: unknown = await response.json().catch(() => null);
 if (response.status === 401) throw new Error('SESSION_EXPIRED');
 if (response.status === 403) throw new Error('FORBIDDEN');
 if (!response.ok) {
  const message = data && typeof data === 'object' && 'error' in data && typeof data.error === 'string' ? data.error : 'No se pudo guardar el borrador';
  throw new Error(message);
 }
 if (!data || typeof data !== 'object' || !('id' in data) || !Number.isInteger(data.id) ||
     !('request_key' in data) || typeof data.request_key !== 'string') throw new Error('Respuesta inválida del servidor');
 return data as {id:number; request_key:string};
}

export async function submitTacApproval(csrf: string, id: number, version: number): Promise<void> {
 const response = await fetch('/api/tac-approval-submit.php', {
  method: 'POST', credentials: 'same-origin', cache: 'no-store',
  headers: {'Content-Type':'application/json','X-CSRF-Token':csrf},
  body: JSON.stringify({id,version}),
 });
 const data: unknown = await response.json().catch(() => null);
 if (response.status === 401) throw new Error('SESSION_EXPIRED');
 if (!response.ok) {
  const error = data && typeof data === 'object' && 'error' in data && typeof data.error === 'string' ? data.error : 'No se pudo enviar a revisión';
  throw new Error(error);
 }
}

export type TacApprovalDetail = {
 id: number; version: number; status: ApprovalSummary['status']; submitted_by: number;
 order_id: string | null; after: {title?: string; description?: string};
 before: unknown; reason_code: string | null; reason_text: string | null;
};
export async function getTacApprovalDetail(id: number): Promise<TacApprovalDetail> {
 const response = await fetch('/api/tac-approval-detail.php?id='+encodeURIComponent(id), {credentials:'same-origin',cache:'no-store'});
 if (response.status === 401) throw new Error('SESSION_EXPIRED');
 const data = await response.json().catch(()=>null);
 if (!response.ok) throw new Error(data?.error || 'No se pudo abrir la solicitud');
 if (!data?.item || typeof data.item !== 'object') throw new Error('Detalle inválido');
 return data.item as TacApprovalDetail;
}
export async function reviewTacApproval(csrf: string, input: {
 id:number; version:number; decision:'approved'|'rejected'|'returned';
 reason_code?:string; reason_text?:string;
}): Promise<void> {
 const response=await fetch('/api/tac-approval-review.php',{
  method:'POST',credentials:'same-origin',cache:'no-store',
  headers:{'Content-Type':'application/json','X-CSRF-Token':csrf},body:JSON.stringify(input),
 });
 if (response.status===401) throw new Error('SESSION_EXPIRED');
 const data=await response.json().catch(()=>null);
 if (!response.ok) throw new Error(data?.error || 'No se pudo registrar la decisión');
}

export async function reviseTacApproval(csrf:string,input:{id:number;version:number;title:string;description:string}):Promise<{id:number;version:number}>{
 const response=await fetch('/api/tac-approval-revise.php',{
  method:'POST',credentials:'same-origin',cache:'no-store',
  headers:{'Content-Type':'application/json','X-CSRF-Token':csrf},
  body:JSON.stringify(input),
 });
 if(response.status===401)throw new Error('SESSION_EXPIRED');
 const data:unknown=await response.json().catch(()=>null);
 if(!response.ok){
  const error=data && typeof data==='object' && 'error' in data && typeof data.error==='string'?data.error:'No se pudo crear la nueva versión';
  throw new Error(error);
 }
 if(!data || typeof data!=='object' || !('id' in data) || !Number.isInteger(data.id) ||
    !('version' in data) || !Number.isInteger(data.version))throw new Error('Respuesta inválida');
 return data as {id:number;version:number};
}

export type TacApprovalHistoryItem={id:number;version:number;status:ApprovalSummary['status'];created_at:string;reason_code:string|null};
export async function getTacApprovalHistory(id:number):Promise<TacApprovalHistoryItem[]>{
 const response=await fetch('/api/tac-approval-history.php?id='+encodeURIComponent(id),{credentials:'same-origin',cache:'no-store'});
 if(response.status===401)throw new Error('SESSION_EXPIRED');
 const data:unknown=await response.json().catch(()=>null);
 if(!response.ok)throw new Error(data && typeof data==='object' && 'error' in data && typeof data.error==='string'?data.error:'No se pudo cargar el historial');
 if(!data || typeof data!=='object' || !('items' in data) || !Array.isArray(data.items))throw new Error('Historial inválido');
 return data.items as TacApprovalHistoryItem[];
}
