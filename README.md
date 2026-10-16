# Todo Artesanal Chiapas — PWA

Nueva aplicación web progresiva **React + TypeScript + Vite**, reconstruida desde cero. El proyecto Flutter anterior se conserva en la rama `backup/flutter-v0.1-before-pwa`.

## Estado

**Prototipo funcional local, NO apto para producción.** Permite crear, editar y listar pedidos; productos ilimitados; IVA opcional del 16 % aplicado solo al subtotal de productos; envío editable (predeterminado $85); anticipo de referencia del 60 %; registro de pagos; impresión/guardar PDF mediante el navegador. Los datos se guardan **únicamente en localStorage de ese navegador**: no hay usuarios, backend, sincronización, respaldo ni folios globalmente únicos. El icono es provisional. No se deben introducir datos reales de clientes.

## Desarrollo

Requiere Node.js compatible con Vite 7.

```bash
npm install
npm run dev
npm run build
```

## PWA

El manifiesto y el service worker se generan con `vite-plugin-pwa` al compilar. Para probar la instalación usar HTTPS o localhost, ejecutar `npm run build && npm run preview` y revisar en Chrome. **La interfaz puede abrirse sin red tras almacenarse en caché; guardar pedidos sin conexión entre dispositivos NO está implementado.**

## Próximas fases (obligatorias antes de producción)

1. Supabase PostgreSQL + Auth con RLS, roles administrativos y políticas de acceso.
2. Folios transaccionales generados por backend, pagos y auditoría.
3. Almacenamiento seguro de imágenes, backups y migraciones.
4. PDF definitivo con recursos visuales oficiales y pruebas de paginación.
5. Validación de política de 25 días, seguridad, accesibilidad y pruebas automatizadas.
6. Despliegue de pruebas, dominio personalizado y HTTPS.

**Seguridad:** jamás subir claves privadas o `service_role` al repositorio. No publicar este prototipo como sistema operativo real.
