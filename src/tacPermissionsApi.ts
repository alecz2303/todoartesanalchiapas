export type TacPermissionsStatus = {
 schemaVersion: 1;
 role: 'unassigned' | 'karo' | 'alec';
 permissions: {
  diagnosticsRead: boolean;
  approvalsRead: boolean;
  approvalsApprove: false;
  conversationsHandoff: false;
  robotControl: false;
 };
 operationalPermissionsEnabled: false;
};

export async function getTacPermissions(signal?: AbortSignal): Promise<TacPermissionsStatus> {
 const response = await fetch('/api/tac-permissions-check.php', {
  method: 'GET', credentials: 'same-origin', cache: 'no-store', signal,
 });
 if (!response.ok) throw new Error('PERMISSIONS_UNAVAILABLE');
 const data: unknown = await response.json();
 if (!data || typeof data !== 'object') throw new Error('INVALID_PERMISSIONS');
 const v = data as Record<string, unknown>;
 const p = v.permissions as Record<string, unknown> | undefined;
 if (v.schemaVersion !== 1 || !['unassigned','karo','alec'].includes(String(v.role)) ||
     v.operationalPermissionsEnabled !== false || !p ||
     p.approvalsApprove !== false || p.conversationsHandoff !== false || p.robotControl !== false ||
     p.diagnosticsRead !== (v.role !== 'unassigned') ||
     p.approvalsRead !== (v.role !== 'unassigned')) throw new Error('INVALID_PERMISSIONS');
 return data as TacPermissionsStatus;
}
