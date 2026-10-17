import React, { useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { Website, SystemLogin } from './Website';
import './style.css';
type Session={authenticated:boolean;csrf?:string;user?:{id:number;username:string;display_name:string}};
function System(){
 const [session,setSession]=useState<Session|null>(null);
 const [error,setError]=useState('');
 const sessionExpired=useCallback(()=>setSession({authenticated:false}),[]);
 async function refresh(){
  try{const r=await fetch('/api/auth.php?action=session',{credentials:'same-origin',cache:'no-store'});if(!r.ok)throw new Error('No se pudo comprobar la sesión');const data=await r.json() as Session;setSession(data);setError('')}
  catch(e){setSession({authenticated:false});setError(e instanceof Error?e.message:'Error de conexión')}
 }
 useEffect(()=>{void refresh()},[]);
 async function logout(){
  if(!session?.csrf)return;
  try{const r=await fetch('/api/auth.php?action=logout',{method:'POST',credentials:'same-origin',headers:{'X-CSRF-Token':session.csrf}});if(!r.ok)throw new Error('No se pudo cerrar la sesión');setSession({authenticated:false})}
  catch(e){setError(e instanceof Error?e.message:'Error al cerrar sesión')}
 }
 if(session===null)return <p style={{padding:32}}>Verificando acceso al Sistema TAC…</p>;
 if(!session.authenticated)return <><SystemLogin onLogin={()=>void refresh()}/>{error&&<p role="alert" style={{padding:12}}>{error}</p>}</>;
 return <><div style={{display:'flex',justifyContent:'flex-end',alignItems:'center',gap:14,padding:'9px 20px',background:'#fff3cf',color:'#5d4200',fontSize:13}}><span>Sesión: {session.user?.display_name||session.user?.username}</span><button onClick={()=>void logout()}>Cerrar sesión</button></div>{error&&<p role="alert">{error}</p>}<App csrf={session.csrf||''} onSessionExpired={sessionExpired}/></>;
}
const path=window.location.pathname.replace(/\/+$/,'')||'/';
createRoot(document.getElementById('root')!).render(<React.StrictMode>{path==='/sistema_tac'?<System/>:<Website/>}</React.StrictMode>);
