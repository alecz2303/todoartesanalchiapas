# Flujo de solicitudes y revisiones TAC (base local de prueba)

## Estado implementado en la rama feature/panel-tac-unificado

La cuenta local `admin` (Alec) y la cuenta `kramirez` (Karo) tienen roles TAC separados. La migración 002 ya está instalada en la base local de prueba según el preflight confirmado por el usuario; **no volver a ejecutar CREATE TABLE**.

Las siguientes acciones requieren sesión activa, CSRF para escrituras y comprobación de rol en el servidor:

| Endpoint | Rol | Efecto |
| --- | --- | --- |
| GET /api/tac-approvals.php | Alec, Karo | Lista hasta 100 solicitudes, sin snapshots |
| GET /api/tac-approval-detail.php?id=N | Karo o autor | Muestra título, descripción, motivo y versión |
| GET /api/tac-approval-history.php?id=N | Karo o autor | Lista las versiones de la misma solicitud |
| POST /api/tac-approval-drafts.php | Alec, Karo | Crea borrador versión 1 |
| POST /api/tac-approval-submit.php | Autor | Cambia borrador a submitted |
| POST /api/tac-approval-review.php | Solo Karo, no autor | Cambia submitted a approved/rejected/returned |
| POST /api/tac-approval-revise.php | Autor | Crea versión N+1 en draft desde returned |

La revisión de Karo no actualiza pedidos: solo decide sobre la solicitud. Ninguna de estas APIs envía WhatsApp, altera n8n ni activa el Robot Cotizador.

## Correcciones versionadas

`POST /api/tac-approval-revise.php` acepta `{"id":1,"version":1,"title":"Título corregido","description":"Explicación corregida"}`. Exige estado `returned`, autor original y versión coincidente. En transacción bloquea la fila anterior, comprueba que no exista versión posterior, inserta un nuevo registro `draft` con el mismo `request_key`, versión incrementada, `before_snapshot` igual al snapshot previo y `after_snapshot` con los datos corregidos. Registra auditoría en la misma transacción. No edita ni borra versiones anteriores. El índice único `(request_key,version)` impide duplicados concurrentes.

La nueva versión debe enviarse nuevamente a revisión. El formulario permite seleccionar opcionalmente un pedido existente de la lista ya cargada en la sesión; el servidor verifica que exista y aplica la restricción única por pedido y versión. Las versiones `approved` y `rejected` son terminales en esta fase.

## Revisión de Karo

`POST /api/tac-approval-review.php` acepta `id`, `version`, `decision` (approved/rejected/returned). Para rechazar o devolver se exige `reason_code` entre `price`, `quantity`, `delivery_date`, `design`, `missing_info`, `other`; `other` exige `reason_text` de 10 a 1000 caracteres. No se permite revisar solicitudes propias. El servidor valida estado y versión en transacción.

## Pendientes y límites

- Validar sintaxis y flujo real en Laragon antes de considerar operativa esta fase. No se han ejecutado pruebas sobre el MySQL del usuario.
- Los snapshots actuales contienen solo título y descripción; **no** representan un diff comercial validado contra `orders`.
- No aplicar automáticamente aprobaciones a pedidos hasta definir el modelo de cambios comerciales, reglas de precio, firmas de snapshot y pruebas.
- Mantener n8n/WhatsApp y robot separados y deshabilitados hasta autorización explícita.
- Futuro: historial agrupado por `request_key`, alertas de urgencia, catálogo visual de motivos y pruebas de concurrencia.

## Bandeja de versiones vigentes

El listado devuelve solo la versión más reciente por `request_key` mediante JOIN a `MAX(version)`, **antes** de aplicar el límite de 100 solicitudes. Las versiones anteriores siguen disponibles mediante `GET /api/tac-approval-history.php?id=N` y el detalle individual. Esto evita contar devoluciones históricas como pendientes actuales.

## Diagnóstico local de integridad (sin escrituras)

Con el proyecto actualizado, ejecutar opcionalmente `php scripts/tac-approvals-integrity.php`. Este script usa exclusivamente la configuración de base local y consultas SELECT: revisa duplicados, continuidad de versiones, revisiones por el propio autor, fechas de transición, motivos obligatorios y autoría. Devuelve código 0 si no detecta anomalías, 1 si hay registros por revisar y 2 si no puede consultar la base. No modifica pedidos ni aprobaciones.

## Refuerzos de revisión (fase actual)

El envío a revisión valida que el snapshot incluya título y descripción suficientes y que se esté enviando la versión vigente. La decisión de Karo rechaza solicitudes sin autor y versiones obsoletas. La comparación del detalle es **textual** entre título y descripción de dos versiones, no un diff comercial del pedido.

El diagnóstico local ahora incluye 14 comprobaciones (antes 9), con continuidad de versiones, snapshots previos, revisión de estados y coherencia de las transiciones. Para volver a ejecutarlo, sin escrituras:

```cmd
php scripts/tac-approvals-integrity.php
```

**Prueba funcional pendiente:** crear → enviar → devolver → corregir → reenviar → decidir. Debe hacerse con cuentas separadas `admin` y `kramirez` y pedidos de prueba; no hay evidencia de ejecución completa en Laragon.
