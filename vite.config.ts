import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({plugins:[react(),VitePWA({registerType:'autoUpdate',includeAssets:['icon.svg'],manifest:{name:'Todo Artesanal Chiapas · Pedidos',short_name:'Todo Artesanal',description:'Gestión de pedidos artesanales',theme_color:'#2204CC',background_color:'#fff9f2',display:'standalone',start_url:'/sistema_tac',scope:'/sistema_tac',icons:[{src:'/icon.svg',sizes:'any',type:'image/svg+xml',purpose:'any'}]},workbox:{navigateFallback:'/index.html',globPatterns:['**/*.{js,css,html,svg,png,ico}']}})]});
