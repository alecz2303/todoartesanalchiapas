export type TacRoleStatus = {
 schemaVersion: 1;
 role: 'unassigned' | 'karo' | 'alec';
 operationalPermissionsEnabled: false;
};

export async function getTacRole(signal?: AbortSignal): Promise<TacRoleStatus> {
 const response = await fetch('/api/tac-role.php', {
  method: 'GET', credentials: 'same-origin', cache: 'no-store', signal,
 });
 if (!response.ok) throw new Error(response.status === 401 ? 'SESSION_EXPIRED' : 'ROLE_UNAVAILABLE');
 const value: unknown = await response.json();
 if (!value || typeof value !== 'object') throw new Error('INVALID_ROLE');
 const data = value as Record<string, unknown>;
 if (data.schemaVersion !== 1 || !['unassigned', 'karo', 'alec'].includes(String(data.role)) ||
     data.operationalPermissionsEnabled !== false) throw new Error('INVALID_ROLE');
 return value as TacRoleStatus;
}
