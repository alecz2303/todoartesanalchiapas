# Panel TAC — permisos y auditoría (diseño previo a migración)

## Estado actual y límites
- La tabla `users` actual contiene `id`, `username`, `display_name` e `is_active`, **sin rol**.
- `requireUser()` valida sesión y usuario activo, pero **no autoriza por función**.
- `audit_log` registra `user_id`, `action`, `subject` y `created_at`; no contiene diffs, resultados, versión ni motivo.
- Por ello no se puede inferir que una cuenta sea Karo o Alec a partir de su nombre, ID o posición. **No se han asignado roles reales.**
- El panel y la API de diagnóstico son de solo lectura. No hay permisos operativos implementados.

## Matriz de permisos propuesta (pendiente de aprobación y migración)

| Operación | Karo | Alec | Otros usuarios |
| --- | --- | --- | --- |
| Ver diagnósticos de integración | Sí | Sí | Por definir |
| Ver conversaciones autorizadas | Sí | Sí | No por defecto |
| Cambiar modo robot/Karo de una conversación | Sí | Sí | No |
| Corregir solicitud antes de revisión | Sí | Sí | No |
| Enviar a revisión / devolver a edición | Sí | Sí | No |
| Aprobar o rechazar cambio comercial | **Sí** | **No** | No |
| Cambiar reglas comerciales | Propuesta: requiere aprobación de Karo | Puede proponer | No |
| Activar robot o publicar workflow | Bloqueado hasta pruebas y autorización explícita | Bloqueado | Bloqueado |

Los permisos deben validarse **en PHP en cada petición**, no mediante botones ocultos en React.

## Modelo propuesto para la migración (no ejecutado)
1. Tabla de asignación de roles a `users.id`, con rol `karo` / `alec`, asignado manualmente tras verificar las cuentas; no depender de `username`.
2. Tabla de solicitudes de aprobación con `id`, `order_id` opcional, `version`, `status`, `submitted_by`, `reviewed_by`, `reason_code`, `reason_text`, fechas y snapshots versionados antes/después.
3. Auditoría TAC append-only con actor, acción, entidad, versión, resultado, fecha, y metadatos mínimos; nunca guardar secretos, tokens ni contenido sensible innecesario.
4. Migración SQL versionada, respaldo previo, prueba de rollback y verificación de integridad referencial antes de ejecutar en producción.

## Reglas de flujo
- Solicitud enviada a revisión: bloqueada para editar hasta devolución.
- Karo aprueba/rechaza; rechazo exige motivo de catálogo y texto cuando sea «Otro motivo».
- Cambios comerciales materiales generan nueva versión y requieren aprobación de nuevo.
- Karo y Alec pueden corregir y reenviar; correcciones administrativas sin efecto comercial pueden registrarse sin reaprobar según reglas explícitas.
- Ordenar pendientes por antigüedad y señalar urgencia de entrega dentro de tres días.
- Transferencia robot/Karo exige validar el estado de la conversación al momento de la acción y antes de cualquier mensaje; auditoría e idempotencia.
- CSRF para toda mutación autenticada, permisos verificados en servidor, transacciones y control de concurrencia por versión.

## Antes de programar escrituras
- Confirmar qué cuentas corresponden a Karo y Alec mediante sesión autenticada; nunca por texto de usuario.
- Respaldar MySQL y probar migración/restauración en Laragon.
- Definir pruebas de denegación: Alec no aprueba, usuario sin rol no muta, versión obsoleta no sobrescribe, CSRF ausente falla, rechazo sin motivo falla.
- Conservar todas las acciones operativas deshabilitadas hasta completar las pruebas.
