import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png', 'icon-maskable-512.png'],
      manifest: {
        name: 'Todo Artesanal Chiapas · Pedidos',
        short_name: 'Todo Artesanal',
        description: 'Gestión de pedidos artesanales',
        theme_color: '#2204CC',
        background_color: '#fff9f2',
        display: 'standalone',
        start_url: '/sistema_tac',
        scope: '/sistema_tac',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        globIgnores: ['**/og-image.png'],
      },
    }),
  ],
});
