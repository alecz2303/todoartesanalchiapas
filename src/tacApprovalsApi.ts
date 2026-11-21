export type ApprovalSummary = {
 id: number;
 request_key: string;
 order_id: string | null;
 version: number;
 status: 'draft' | 'submitted' | 'returned' | 'approved' | 'rejected';
 submitted_at: string | null;
 created_at: string;
};
export async function getTacApprovals(signal?: AbortSignal): Promise<ApprovalSummary[]> {
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
 if (v.schemaVersion !== 1 || v.readOnly !== true || !Array.isArray(v.items)) throw new Error('INVALID_DATA');
 const allowed = ['draft', 'submitted', 'returned', 'approved', 'rejected'];
 if (!v.items.every((i: unknown) => {
  if (!i || typeof i !== 'object') return false;
  const x = i as Record<string, unknown>;
  return Number.isInteger(x.id) && typeof x.request_key === 'string' && /^[0-9a-fA-F-]{36}$/.test(x.request_key) && Number.isInteger(x.version) && x.version >= 1 &&
   allowed.includes(String(x.status)) &&
   (x.order_id === null || typeof x.order_id === 'string') &&
   (x.submitted_at === null || typeof x.submitted_at === 'string') &&
   typeof x.created_at === 'string';
 })) throw new Error('INVALID_DATA');
 return v.items as ApprovalSummary[];
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
