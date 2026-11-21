# Flujo de solicitudes y revisiones TAC (base local de prueba)

## Estado implementado en la rama feature/panel-tac-unificado

La cuenta local `admin` (Alec) y la cuenta `kramirez` (Karo) tienen roles TAC separados. La migración 002 ya está instalada en la base local de prueba según el preflight confirmado por el usuario; **no volver a ejecutar CREATE TABLE**.

Las siguientes acciones requieren sesión activa, CSRF para escrituras y comprobación de rol en el servidor:

| Endpoint | Rol | Efecto |
| --- | --- | --- |
| GET /api/tac-approvals.php | Alec, Karo | Lista hasta 100 solicitudes, sin snapshots |
| GET /api/tac-approval-detail.php?id=N | Karo o autor | Muestra título, descripción, motivo y versión |
| POST /api/tac-approval-drafts.php | Alec, Karo | Crea borrador versión 1 |
| POST /api/tac-approval-submit.php | Autor | Cambia borrador a submitted |
| POST /api/tac-approval-review.php | Solo Karo, no autor | Cambia submitted a approved/rejected/returned |
| POST /api/tac-approval-revise.php | Autor | Crea versión N+1 en draft desde returned |

La revisión de Karo no actualiza pedidos: solo decide sobre la solicitud. Ninguna de estas APIs envía WhatsApp, altera n8n ni activa el Robot Cotizador.

## Correcciones versionadas

`POST /api/tac-approval-revise.php` acepta `{"id":1,"version":1,"title":"Título corregido","description":"Explicación corregida"}`. Exige estado `returned`, autor original y versión coincidente. En transacción bloquea la fila anterior, comprueba que no exista versión posterior, inserta un nuevo registro `draft` con el mismo `request_key`, versión incrementada, `before_snapshot` igual al snapshot previo y `after_snapshot` con los datos corregidos. Registra auditoría en la misma transacción. No edita ni borra versiones anteriores. El índice único `(request_key,version)` impide duplicados concurrentes.

La nueva versión debe enviarse nuevamente a revisión. Las versiones `approved` y `rejected` son terminales en esta fase.

## Revisión de Karo

`POST /api/tac-approval-review.php` acepta `id`, `version`, `decision` (approved/rejected/returned). Para rechazar o devolver se exige `reason_code` entre `price`, `quantity`, `delivery_date`, `design`, `missing_info`, `other`; `other` exige `reason_text` de 10 a 1000 caracteres. No se permite revisar solicitudes propias. El servidor valida estado y versión en transacción.

## Pendientes y límites

- Validar sintaxis y flujo real en Laragon antes de considerar operativa esta fase. No se han ejecutado pruebas sobre el MySQL del usuario.
- Los snapshots actuales contienen solo título y descripción; **no** representan un diff comercial validado contra `orders`.
- No aplicar automáticamente aprobaciones a pedidos hasta definir el modelo de cambios comerciales, reglas de precio, firmas de snapshot y pruebas.
- Mantener n8n/WhatsApp y robot separados y deshabilitados hasta autorización explícita.
- Futuro: historial agrupado por `request_key`, alertas de urgencia, catálogo visual de motivos y pruebas de concurrencia.
