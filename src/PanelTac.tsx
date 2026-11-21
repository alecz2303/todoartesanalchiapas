import { Bot, CheckCircle2, ClipboardCheck, Clock3, MessageCircle, Settings2, ShieldAlert } from 'lucide-react';
import './PanelTac.css';
import RobotAdmin from './RobotAdmin';
import TacApprovals from './TacApprovals';
import TacOperations from './TacOperations';
import TacContacts from './TacContacts';
import type { Order } from './model';

type Module = 'operations' | 'conversations' | 'robot' | 'approvals' | 'settings';
type Props = { module: Module; csrf: string; onSessionExpired: () => void; orders: Order[]; onOpenOrders:()=>void; onOpenOrder:(order:Order)=>void };
const definitions = {
 conversations: {
  icon: MessageCircle, title: 'Conversaciones de WhatsApp', description: 'Espacio previsto para consultar conversaciones y decidir si atiende el robot o Karo.',
  features: ['Bandeja de conversaciones', 'Modo de atención: robot o Karo', 'Solicitudes pendientes de atención'],
  next: 'Pendiente: integrar la fuente de conversaciones, permisos y cambios de modo auditados.'
 },
 robot: {
  icon: Bot, title: 'Robot Cotizador TAC', description: 'Espacio previsto para consultar el estado del robot y sus reglas de cotización.',
  features: ['Estado global del robot', 'Reglas de picado personalizado y prediseñado', 'Derivación a Karo para casos especiales'],
  next: 'Pendiente: conectar n8n mediante una API segura; esta pantalla no controla el workflow.'
 },
 approvals: {
  icon: ClipboardCheck, title: 'Aprobaciones de Karo', description: 'Espacio previsto para revisar solicitudes antes de convertirlas en pedidos autorizados.',
  features: ['Pendientes de aprobación', 'Pedidos por corregir', 'Historial de decisiones y cambios'],
  next: 'Pendiente: implementar permisos, validaciones, auditoría y persistencia antes de habilitar acciones.'
 },
 settings: {
  icon: Settings2, title: 'Configuración TAC', description: 'Espacio previsto para administrar parámetros comerciales y de atención.',
  features: ['Anticipación mínima por producto', 'Reglas de cotización', 'Tiempo de retorno de Karo al robot'],
  next: 'Pendiente: definir almacenamiento seguro, validación y permisos de administración.'
 }
} as const;

export default function PanelTac({ module, csrf, onSessionExpired, orders, onOpenOrders, onOpenOrder }: Props) {
 if (module === 'operations') return <TacOperations orders={orders} onOpenOrders={onOpenOrders} onOpenOrder={onOpenOrder}/>;
 if (module === 'conversations') return <TacContacts orders={orders} onOpenOrder={onOpenOrder}/>;
 if (module === 'robot') return <RobotAdmin/>;
 if (module === 'approvals') return <TacApprovals csrf={csrf} onSessionExpired={onSessionExpired} orders={orders.map(o=>({id:o.id,folio:o.folio}))}/>;
 const item = definitions[module];
 const Icon = item.icon;
 return <div className="tac-module">
  <div className="tac-module-intro">
   <div className="tac-module-icon"><Icon size={29} aria-hidden="true"/></div>
   <div><span className="tac-module-tag">Vista preliminar · sin conexión operativa</span><h2>{item.title}</h2><p>{item.description}</p></div>
  </div>
  <section className="panel tac-module-panel" aria-labelledby="tac-module-functions">
   <h3 id="tac-module-functions">Funciones previstas</h3>
   <ul>{item.features.map(feature=><li key={feature}><CheckCircle2 size={18} aria-hidden="true"/><span>{feature}</span></li>)}</ul>
  </section>
  <section className="panel tac-module-notice" aria-label="Estado de integración">
   <div><Clock3 size={21} aria-hidden="true"/><strong>Integración pendiente</strong></div>
   <p>{item.next}</p>
   <p className="tac-module-disclaimer"><ShieldAlert size={17} aria-hidden="true"/> No se han consultado ni modificado pedidos, conversaciones, bases de datos ni workflows desde esta pantalla.</p>
  </section>
 </div>;
}
