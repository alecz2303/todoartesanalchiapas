# Todo Artesanal Chiapas — Sitio público + Sistema TAC

Proyecto web en **React 19, TypeScript y Vite**. Alojamiento previsto: **Neubox con cPanel**, backend **PHP** y base de datos **MySQL** (todavía por implementar).

## Rutas
- `/`: sitio público de Todo Artesanal Chiapas, con información de servicios y contacto.
- `/sistema_tac`: pantalla visual de inicio de sesión del sistema administrativo.

**Importante:** el login todavía NO autentica; el panel de gestión (`src/App.tsx`) existe, pero no está conectado a una sesión segura ni accesible desde el login. Los pedidos que maneja el prototipo siguen en **localStorage**, sin sincronización ni respaldo remoto. **No usar datos reales de clientes en producción.**

## Desarrollo local
Requiere Node.js compatible con Vite 7.

```bash
npm install
npm run dev
npm run build
```

`dist/` es la salida de compilación y no debe subirse a Git. `node_modules/` tampoco.

## Archivos principales
- `src/Website.tsx`, `src/website.css`: página comercial y login visual.
- `src/App.tsx`, `src/model.ts`: panel de pedidos y modelo de datos.
- `src/OrdersView.tsx`, `src/orders.css`: pedidos, estados, filtros y abonos.
- `src/Dashboard.tsx`, `src/dashboard.css`: indicadores y gráficos.
- `src/PrintNote.tsx`, `src/print.css`: nota imprimible.
- `src/main.tsx`: selección de página según ruta.
- `vite.config.ts`: PWA con inicio y alcance en `/sistema_tac`.

## Recursos pendientes de verificar
El código hace referencia a los siguientes archivos, pero **no están registrados en la rama de GitHub al momento de esta revisión**:
- `public/logo-todo-artesanal.png`
- `public/header.png`
- `public/nota-footer.png`

Si existen localmente, agregarlos con Git antes de desplegar. No sustituirlos sin revisar el diseño.

## Antes de producción
1. Implementar backend PHP, sesiones seguras y autenticación con contraseñas hasheadas.
2. Crear esquema MySQL, permisos, copias de seguridad y API protegida.
3. Conectar panel y migrar pedidos desde localStorage cuando corresponda.
4. Configurar HTTPS, reglas de Apache para rutas SPA y aislamiento del servicio PWA.
5. Revisar impresión, iconos, imágenes, compilación y pruebas en dispositivos.

## Respaldos
- `backup/flutter-v0.1-before-pwa`: versión antigua Flutter.
- `backup/pwa-before-cleanup-2026-10-17`: instantánea de la PWA antes de la revisión y limpieza.
- `feat/pwa-react-rebuild`: rama de trabajo actual.

No subir contraseñas, credenciales MySQL, secretos PHP ni archivos `.env` al repositorio.
