import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { Website, SystemLogin } from './Website';
import './style.css';
function System(){const [state,setState]=useState<'loading'|'guest'|'authenticated'>('loading');useEffect(()=>{fetch('/api/auth.php?action=session',{credentials:'same-origin',cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject()).then(d=>setState(d.authenticated?'authenticated':'guest')).catch(()=>setState('guest'))},[]);if(state==='loading')return <p style={{padding:32}}>Verificando acceso al Sistema TAC…</p>;if(state==='guest')return <SystemLogin onLogin={()=>setState('authenticated')}/>;return <><div style={{padding:'10px 20px',background:'#fff3cf',color:'#5d4200',fontSize:13}}>Versión de transición: los pedidos todavía se guardan en este navegador. No ingresar datos reales hasta conectar MySQL.</div><App/></>}
const path=window.location.pathname.replace(/\/+$/,'')||'/';
createRoot(document.getElementById('root')!).render(<React.StrictMode>{path==='/sistema_tac'?<System/>:<Website/>}</React.StrictMode>);
