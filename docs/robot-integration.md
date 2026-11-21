# Robot Cotizador TAC — contrato de integración (fase segura)

**Rama de desarrollo:** `feature/panel-tac-unificado`.

## Implementado

- `GET /api/robot-status.php`: requiere sesión TAC existente mediante `requireUser()`.
- Devuelve `schemaVersion: 1`, `mode: preparation`, `operational: false`.
- Todas las capacidades operativas están explícitamente deshabilitadas.
- Los estados `not_connected` / `not_checked` **no** son pruebas de salud ni comprobaciones de conectividad.
- El frontend consume el contrato mediante `src/robotApi.ts`, sin llamar directamente a n8n.
- No se leen ni escriben tablas, workflows, secretos o conversaciones desde el endpoint. La autenticación existente sí valida la sesión con la tabla `users`.

## Límites de seguridad

- No se implementan rutas de activación, envío de WhatsApp, cotización, cambios de modo ni creación de pedidos.
- No exponer tokens Meta, secretos n8n ni URL internas al navegador.
- El acceso actual exige **sesión autenticada**, no implementa todavía permisos separados para Karo y Alec.
- Antes de habilitar escrituras: definir permisos por operación, protección CSRF, registro de auditoría, validación de payloads, idempotencia, verificación del modo inmediatamente antes de enviar y manejo seguro de errores.
- La API PHP debe comunicarse con n8n **desde el servidor**, con autenticación y HTTPS donde corresponda. No asumir que `127.0.0.1:5678` de Laragon será accesible desde producción.
- Asegurar folios únicos generados de forma atómica en backend antes de crear pedidos desde robot; actualmente el sistema manual genera folios en el cliente.
- Diseñar migración respaldada de estados de conversaciones antes de conectarlos a la base de pedidos.

## Fase siguiente (requiere pruebas y aprobación)

1. Definir mecanismo de conexión de servidor PHP a n8n y almacenamiento seguro de credenciales.
2. Incorporar comprobación de salud de solo lectura con timeout y sin divulgar información sensible.
3. Diseñar tablas y migración con respaldo y rollback, **sin ejecutarla en producción**.
4. Implementar controles con permisos y auditoría; activar únicamente después de pruebas de extremo a extremo.
