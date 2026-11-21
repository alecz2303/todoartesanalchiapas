import { useEffect, useState } from 'react';
import { getRobotCapabilities } from './robotApi';
import { AlertTriangle, Bot, CheckCircle2, CircleHelp, Clock3, Database, LockKeyhole, MessageCircle, Network, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import './RobotAdmin.css';

const rules = [
 { title: 'Picado personalizado', state: 'Lógica parcial existente en n8n', details: ['Mínimo 10 y máximo 100 tiras; múltiplos de 10', 'Cotización automática solo con 25 días o más', 'Anticipo general del 60 %', 'Longitud estándar: 5 metros; otras medidas pasan a Karo'] },
 { title: 'Picado prediseñado', state: 'Pendiente de implementar', details: ['1–9 tiras: $40 MXN por tira', '10–100 tiras: $38 MXN por tira', 'Pago del 100 %; existencias sujetas a confirmación de Karo'] },
 { title: 'Piñatas', state: 'Pendiente de implementar', details: ['Cotización y disponibilidad siempre por Karo', 'Anticipación habitual de 15 días', 'Sin precio automático ni promesa de existencia'] }
];

export default function RobotAdmin() {
 const [apiState, setApiState] = useState<'loading' | 'ready' | 'unavailable'>('loading');
 useEffect(() => {
  const controller = new AbortController();
  getRobotCapabilities(controller.signal)
   .then(() => { if (!controller.signal.aborted) setApiState('ready'); })
   .catch(() => { if (!controller.signal.aborted) setApiState('unavailable'); });
  return () => controller.abort();
 }, []);
 return <div className="robot-admin">
  <div className="robot-admin-heading">
   <div className="robot-admin-symbol"><Bot size={30} aria-hidden="true"/></div>
   <div><span className="tac-module-tag">Administración · interfaz de desarrollo</span><h2>Robot Cotizador TAC</h2><p>Vista preparada para administrar el robot. No consulta su estado real ni ejecuta operaciones.</p></div>
  </div>

  <section className="robot-admin-banner" role="status"><AlertTriangle size={21} aria-hidden="true"/><div><strong>Sin conexión operativa</strong><p>Los controles están deshabilitados hasta integrar una API autenticada y probar los permisos. No se ha activado ni detenido el robot.</p><p><strong>API de preparación:</strong> {apiState === 'loading' ? 'Comprobando…' : apiState === 'ready' ? 'Disponible (solo lectura; no verifica n8n)' : 'No disponible (sin conexión verificada)'}</p></div></section>

  <div className="robot-admin-grid">
   <section className="panel robot-admin-card">
    <div className="robot-admin-card-title"><SlidersHorizontal size={21} aria-hidden="true"/><h3>Control general</h3></div>
    <p>Encendido y apagado global del robot, sujeto a permisos y auditoría.</p>
    <div className="robot-admin-control"><div><strong>Estado del robot</strong><small>No disponible · sin conexión</small></div><label className="robot-admin-switch-label">Control inactivo <input type="checkbox" disabled aria-label="Activar robot, no disponible"/></label></div>
    <button type="button" disabled className="outline robot-admin-button"><LockKeyhole size={16}/> Guardar estado</button>
   </section>
   <section className="panel robot-admin-card">
    <div className="robot-admin-card-title"><Network size={21} aria-hidden="true"/><h3>Integraciones</h3></div>
    <div className="robot-admin-integration"><Database size={19} aria-hidden="true"/><div><strong>Base de datos unificada</strong><small>Conexión del módulo pendiente</small></div><span>No verificado</span></div>
    <div className="robot-admin-integration"><Network size={19} aria-hidden="true"/><div><strong>n8n</strong><small>Workflow TAC pendiente de enlazar</small></div><span>No verificado</span></div>
    <div className="robot-admin-integration"><MessageCircle size={19} aria-hidden="true"/><div><strong>WhatsApp / Meta</strong><small>Envío y recepción no conectados aquí</small></div><span>No verificado</span></div>
   </section>
  </div>

  <section className="panel robot-admin-card">
   <div className="robot-admin-card-title"><MessageCircle size={21} aria-hidden="true"/><h3>Atención por conversación</h3></div>
   <p>La bandeja permitirá consultar el modo <strong>robot</strong> o <strong>Karo</strong>, realizar transferencias y registrar cada cambio. Por ahora no hay conversaciones conectadas.</p>
   <div className="robot-admin-placeholder"><CircleHelp size={19} aria-hidden="true"/> Sin datos disponibles. No se muestran clientes ficticios como si fueran reales.</div>
   <button type="button" disabled className="outline robot-admin-button">Cambiar modo de atención</button>
  </section>

  <section className="panel robot-admin-card">
   <div className="robot-admin-card-title"><ShieldCheck size={21} aria-hidden="true"/><h3>Reglas comerciales previstas</h3></div>
   <p>Resumen de reglas acordadas; no implica que estén implementadas ni configuradas en el robot.</p>
   <div className="robot-admin-rules">{rules.map(rule=><article key={rule.title}><h4>{rule.title}</h4><span className="robot-admin-rule-status">{rule.state}</span><ul>{rule.details.map(detail=><li key={detail}><CheckCircle2 size={15} aria-hidden="true"/>{detail}</li>)}</ul></article>)}</div>
  </section>

  <section className="panel robot-admin-card robot-admin-next">
   <div className="robot-admin-card-title"><Clock3 size={21} aria-hidden="true"/><h3>Siguiente etapa técnica</h3></div>
   <p>Diseñar el contrato de API y los permisos, migrar o adaptar el estado de conversaciones, verificar n8n y habilitar controles solo después de pruebas y auditoría. No se requieren cambios en MySQL para visualizar esta pantalla.</p>
  </section>
 </div>;
}
