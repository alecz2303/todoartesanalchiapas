export type RobotCapabilities = {
 schemaVersion: 1;
 mode: 'preparation';
 operational: false;
 capabilities: {
  robotControl: false;
  conversationHandoff: false;
  quotes: false;
  whatsappMessaging: false;
 };
 integrations: {
  ordersDatabase: 'not_checked';
  n8n: 'not_configured' | 'reachable' | 'unavailable';
  whatsapp: 'not_connected';
  robotWorkflow: 'not_configured' | 'unverified' | 'not_found' | 'active' | 'inactive';
 };
};

export async function getRobotCapabilities(signal?: AbortSignal): Promise<RobotCapabilities> {
 const response = await fetch('/api/robot-status.php', {
  method: 'GET', credentials: 'same-origin', cache: 'no-store', signal,
 });
 if (!response.ok) throw new Error(response.status === 401 ? 'SESSION_EXPIRED' : 'STATUS_UNAVAILABLE');
 const value: unknown = await response.json();
 if (!value || typeof value !== 'object') throw new Error('INVALID_STATUS');
 const status = value as Record<string, unknown>;
 if (status.schemaVersion !== 1 || status.mode !== 'preparation' || status.operational !== false)
  throw new Error('INVALID_STATUS');
 const caps = status.capabilities as Record<string, unknown> | undefined;
 const integrations = status.integrations as Record<string, unknown> | undefined;
 if (!caps || !integrations ||
     caps.robotControl !== false || caps.conversationHandoff !== false ||
     caps.quotes !== false || caps.whatsappMessaging !== false ||
     integrations.ordersDatabase !== 'not_checked' ||
     !['not_configured', 'reachable', 'unavailable'].includes(String(integrations.n8n)) ||
     integrations.whatsapp !== 'not_connected' ||
     !['not_configured', 'unverified', 'not_found', 'active', 'inactive'].includes(String(integrations.robotWorkflow))) throw new Error('INVALID_STATUS');
 return value as RobotCapabilities;
}
