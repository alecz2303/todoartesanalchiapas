import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { Website, SystemLogin } from './Website';
import './style.css';
const path=window.location.pathname.replace(/\/+$/,'')||'/';
const page=path==='/sistema_tac'?<SystemLogin/>:path==='/'?<Website/>:<Website/>;
createRoot(document.getElementById('root')!).render(<React.StrictMode>{page}</React.StrictMode>);
