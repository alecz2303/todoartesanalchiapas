# Flujo de aprobaciones TAC — contrato previo a habilitar escrituras

## Estado actual
- Alec (`arueda`, id 1) fue asignado en Laragon según la ejecución confirmada por el usuario.
- Karo no tiene cuenta asignada. Ninguna aprobación comercial está habilitada.
- Migración 002: archivo SQL preparado, no aplicado por el asistente.
- La API `GET /api/tac-approvals.php` es solo lectura, con permiso `approvals.read`.

## Estados y transiciones previstas (NO implementadas)
- `draft` → `submitted`: Alec o Karo envía a revisión; validación del snapshot comercial.
- `submitted` → `returned`: Karo devuelve para corrección, con motivo.
- `submitted` → `approved` o `rejected`: **solo Karo**, con razón para rechazo.
- `returned` → nueva versión `draft` / `submitted`: conservar historial, nunca sobrescribir una versión aprobada.
- Cualquier cambio comercial tras aprobación requiere una nueva versión y nueva aprobación.
- Las acciones se diseñarán con comprobación de rol en servidor, CSRF, transacción y bloqueo optimista de versión. Ningún botón de frontend sustituye estas comprobaciones.

## Integridad y concurrencia
- Para pedidos existentes, `UNIQUE(order_id, version)` impide versiones duplicadas.
- Cada solicitud tiene `request_key CHAR(36)` estable entre versiones, con `UNIQUE(request_key, version)`. Esto impide repetir una versión aunque `order_id` sea `NULL`.
- Para pedidos existentes también se conserva `UNIQUE(order_id, version)`. El backend futuro deberá definir y validar la correspondencia entre solicitud y pedido; los índices no sustituyen esa regla.
- El backend futuro deberá generar `request_key` y comprobar la transición de estado en transacción; **todavía no existen escrituras**.
- La versión y el estado se comprobarán dentro de transacciones; no se aprobará si la solicitud cambió desde su lectura.
- Auditoría con actor, entidad, versión, resultado y metadatos sin datos personales innecesarios.
- La tabla 002 por sí sola no impone exclusividad de aprobación por Karo; esa restricción será obligatoria en backend.

## Reglas comerciales por validar antes de operar
- Picado personalizado: 10–100 tiras en decenas; número máximo de diseños y precios según reglas aprobadas.
- Picado prediseñado: verificar existencias con Karo; pedidos superiores a 100 requieren intervención.
- Piñatas personalizadas: revisión manual de Karo, sin cotización automática del robot.
- Solicitudes urgentes (entrega en 3 días o menos): prioridad visible, sin saltarse aprobaciones.
- Catálogo de motivos de devolución/rechazo, con texto obligatorio para «Otro».

## Preflight en Laragon
```cmd
php scripts/tac-approvals-preflight.php
```
Este comando es **solo lectura**: informa nombre de base, dependencias, rol asignado y existencia de la tabla 002.

La migración 002 ya incorpora la identidad estable `request_key`. Se puede evaluar para la **base de prueba**, pero crear la tabla no habilita escrituras ni decisiones comerciales. Antes de ejecutarla, revisar el SQL actualizado y confirmar que el preflight indica `tac_approval_requests: FALTA`.

## Criterios de aceptación de una futura fase operativa
1. Sin sesión → 401; sin rol → 403; Alec nunca puede aprobar/rechazar.
2. Dos revisiones simultáneas no pueden aprobar versiones diferentes accidentalmente.
3. Un cambio comercial genera nueva versión y conserva historial.
4. Rechazo/devolución exige motivo válido; «Otro» exige explicación.
5. Todo cambio se audita en la misma transacción.
6. Robot, WhatsApp y producción permanecen independientes.
