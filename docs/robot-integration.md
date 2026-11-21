# Robot Cotizador TAC — contrato de integración (fase segura)

**Rama de desarrollo:** `feature/panel-tac-unificado`.

## Implementado

- `GET /api/robot-status.php`: requiere sesión TAC existente mediante `requireUser()`.
- Devuelve `schemaVersion: 1`, `mode: preparation`, `operational: false`.
- Todas las capacidades operativas están explícitamente deshabilitadas.
- `n8n: not_configured` indica comprobación desactivada; `reachable` indica HTTP 200 desde `/healthz`; `unavailable` indica que no se obtuvo respuesta HTTP 200. Ninguno certifica que los workflows funcionen.
- La prueba está desactivada por defecto. Para habilitarla **solo en Laragon**, iniciar el servidor PHP con la variable de entorno `TAC_N8N_LOCAL_HEALTHCHECK=1` y PHP con extensión cURL habilitada. Usa exclusivamente `http://127.0.0.1:5678/healthz`, sin redirecciones y con timeout de 1.5 s.
- No activar la prueba local en producción: el `localhost` de producción sería otra máquina. La integración remota requerirá otro diseño seguro.
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
2. Validar en Laragon la comprobación local opt-in de solo lectura con timeout, sin divulgar información sensible.
3. Diseñar tablas y migración con respaldo y rollback, **sin ejecutarla en producción**.
4. Implementar controles con permisos y auditoría; activar únicamente después de pruebas de extremo a extremo.
