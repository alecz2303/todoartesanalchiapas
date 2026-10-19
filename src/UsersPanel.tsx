import { useEffect, useState, type FormEvent } from 'react';
import { CheckCircle2, CircleUserRound, Plus, RefreshCw, ShieldCheck, UserRoundCheck, UserRoundX } from 'lucide-react';
import './users-panel.css';

type User={id:number;username:string;display_name:string;is_active:number|string|boolean;created_at:string;last_login_at:string|null};
type Props={csrf:string;onSessionExpired:()=>void};
export default function UsersPanel({csrf,onSessionExpired}:Props){
 const [users,setUsers]=useState<User[]>([]);
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [success,setSuccess]=useState('');
 const [showForm,setShowForm]=useState(false);
 const [username,setUsername]=useState('');
 const [name,setName]=useState('');
 const [password,setPassword]=useState('');
 async function request(payload?:unknown){
  const res=await fetch('/api/users.php',{method:payload?'POST':'GET',credentials:'same-origin',cache:'no-store',headers:payload?{'Content-Type':'application/json','X-CSRF-Token':csrf}:{},body:payload?JSON.stringify(payload):undefined});
  if(res.status===401){onSessionExpired();throw new Error('Tu sesión terminó. Inicia sesión nuevamente.')}
  const data=await res.json().catch(()=>({error:'Respuesta inválida del servidor'}));
  if(!res.ok)throw new Error(data.error||'No fue posible completar la operación');
  return data;
 }
 async function load(){setLoading(true);try{const data=await request();setUsers(data.users||[]);setError('')}catch(e){setError(e instanceof Error?e.message:'Error de conexión')}finally{setLoading(false)}}
 useEffect(()=>{void load()},[csrf]);
 async function create(e:FormEvent){e.preventDefault();if(password.length<12){setError('La contraseña debe tener al menos 12 caracteres.');return}setBusy(true);setError('');setSuccess('');try{await request({action:'create',username:username.trim(),display_name:name.trim(),password});setUsername('');setName('');setPassword('');setShowForm(false);setSuccess('¡Usuario creado! Ya puede iniciar sesión.');await load()}catch(e){setError(e instanceof Error?e.message:'No se pudo crear el usuario')}finally{setBusy(false)}}
 async function toggle(u:User){const active=String(u.is_active)==='1'||u.is_active===true;const action=active?'desactivar':'activar';if(!window.confirm('¿Deseas '+action+' la cuenta de '+u.display_name+'?'))return;setBusy(true);setError('');setSuccess('');try{await request({action:'set_active',id:u.id,is_active:!active});setSuccess('Cuenta actualizada correctamente.');await load()}catch(e){setError(e instanceof Error?e.message:'No se pudo actualizar la cuenta')}finally{setBusy(false)}}
 const activeCount=users.filter(u=>String(u.is_active)==='1'||u.is_active===true).length;
 return <div className="tac-users">
  <section className="tac-users-hero"><div className="tac-users-hero-icon"><ShieldCheck size={29}/></div><div><span className="tac-users-eyebrow">EQUIPO DEL TALLER</span><h2>Las personas detrás de la magia ✨</h2><p>Administra quién puede entrar al Sistema TAC y trabajar con los pedidos de Karo.</p></div><button className="primary" onClick={()=>{setShowForm(v=>!v);setError('');setSuccess('')}}><Plus size={17}/>{showForm?'Cerrar formulario':'Nuevo usuario'}</button></section>
  <div className="tac-users-stats"><div><CircleUserRound size={20}/><span>Usuarios registrados</span><strong>{users.length}</strong></div><div><UserRoundCheck size={20}/><span>Accesos activos</span><strong>{activeCount}</strong></div><div><ShieldCheck size={20}/><span>Acceso protegido</span><strong>Con contraseña</strong></div></div>
  {error&&<p className="tac-users-alert" role="alert">{error}</p>}{success&&<p className="tac-users-success" role="status"><CheckCircle2 size={18}/>{success}</p>}
  {showForm&&<section className="tac-users-form-card"><div><span className="tac-users-eyebrow">NUEVA CUENTA</span><h3>Invita a alguien al taller</h3><p>Podrá acceder con su propio usuario y contraseña.</p></div><form onSubmit={create} className="tac-users-form"><label>Nombre de la persona<input required minLength={2} maxLength={120} autoComplete="off" placeholder="Ej. Karolina" value={name} onChange={e=>setName(e.target.value)}/></label><label>Usuario para iniciar sesión<input required minLength={3} maxLength={80} pattern="[a-zA-Z0-9_.-]+" autoCapitalize="none" autoComplete="off" placeholder="Ej. karo" value={username} onChange={e=>setUsername(e.target.value)}/></label><label>Contraseña inicial (mínimo 12 caracteres)<input required type="password" minLength={12} maxLength={4096} autoComplete="new-password" placeholder="Escribe una contraseña segura" value={password} onChange={e=>setPassword(e.target.value)}/></label><div className="tac-users-form-actions"><button type="button" className="outline" onClick={()=>setShowForm(false)}>Cancelar</button><button className="primary" disabled={busy} type="submit">{busy?'Creando…':'Crear usuario'}</button></div></form></section>}
  <section className="tac-users-list"><div className="tac-users-list-head"><div><h3>Mi equipo</h3><p>Usuarios con acceso al sistema</p></div><button className="outline" onClick={()=>void load()} disabled={loading||busy}><RefreshCw size={16}/> Actualizar</button></div>{loading?<p className="tac-users-empty">Cargando usuarios…</p>:users.length===0?<p className="tac-users-empty">Todavía no hay usuarios registrados.</p>:<div className="tac-users-rows">{users.map(u=>{const active=String(u.is_active)==='1'||u.is_active===true;return <article className="tac-user-row" key={u.id}><div className="tac-user-avatar" aria-hidden="true">{u.display_name.trim().slice(0,1).toLocaleUpperCase('es-MX')}</div><div className="tac-user-details"><strong>{u.display_name}</strong><span>@{u.username}</span><small>Último acceso: {u.last_login_at||'Aún no registrado'}</small></div><span className={'tac-user-status '+(active?'on':'off')}>{active?'Activo':'Inactivo'}</span><button className="outline tac-user-toggle" disabled={busy} onClick={()=>void toggle(u)}>{active?<UserRoundX size={16}/>:<UserRoundCheck size={16}/>} {active?'Desactivar':'Activar'}</button></article>})}</div>}</section>
  <p className="tac-users-footnote"><ShieldCheck size={16}/> Todos los usuarios activos tienen actualmente los mismos permisos. No compartas contraseñas; crea una cuenta para cada persona.</p>
 </div>;
}
