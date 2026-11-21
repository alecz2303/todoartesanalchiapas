# Conexión TAC con el sistema de pedidos existente

## Decisión de arquitectura

El módulo `Operación TAC` consume directamente el arreglo de pedidos que `App.tsx` ya obtiene de `GET /api/orders.php`, que lee `orders.payload` en MySQL. No crea tablas, no copia pedidos, no genera solicitudes de aprobación y no cambia las APIs existentes de pedidos.

El panel muestra pedidos en proceso, entregas de hoy, entregas vencidas, cotizaciones, anticipos pendientes y saldo de pedidos activos. Los elementos de atención prioritaria permiten abrir el pedido original en el editor actual, donde se mantienen las operaciones comerciales existentes.

El módulo `Aprobaciones` se conserva como funcionalidad auxiliar de revisión, no como requisito previo para operar pedidos. El sistema de pedidos sigue siendo la fuente de verdad.

## Estado de integración

- Pedidos/MySQL: conectado por la ruta existente de la aplicación.
- Panel TAC/Operación: conectado a pedidos ya cargados.
- n8n/Robot: consulta de capacidades separada; no hay autorización para modificar el workflow.
- WhatsApp: acceso directo al chat externo desde pedidos prioritarios con número válido, **sin envío automático ni lectura de mensajes**. Todavía no existe una fuente de conversaciones conectada al panel.
- No se ha ejecutado validación de interfaz ni de compilación en el Laragon del usuario.

## Siguiente integración real

Conectar una fuente de conversaciones de WhatsApp a una API PHP autenticada y de solo lectura. Antes de implementar acciones de envío o transferencias, definir origen de mensajes, identificador de conversación, permisos de acceso, secretos de servidor y registro de auditoría. Nunca enviar tokens al frontend ni reutilizar las tablas de pedidos como si fueran mensajes de WhatsApp.

El sistema actual de pedidos no debe reemplazarse ni duplicarse.

## Acceso manual a WhatsApp

El botón **WhatsApp** en la atención prioritaria abre `wa.me` con el número guardado en el pedido. Para números mexicanos de diez dígitos se agrega el prefijo `52`; para números internacionales de 11 a 15 dígitos se conserva el número completo. No se transmite ningún texto ni dato del pedido en la URL. El botón no se muestra si el número no tiene una longitud utilizable. Abrir el enlace no cambia el modo de atención de n8n ni permite leer el historial de mensajes.

## Diagnóstico de conversaciones (sin escrituras)

`GET /api/tac-conversations-diagnostics.php` requiere sesión activa y permiso TAC `diagnostics.read`. Consulta exclusivamente los nombres de tablas de la base MySQL actualmente configurada que parezcan relacionadas con chats, mensajes o WhatsApp. Devuelve `connected:false` deliberadamente: encontrar una tabla no equivale a haber conectado el proveedor. No lee filas de clientes, mensajes ni secretos. La sección Conversaciones muestra las tablas candidatas o un error de conexión, sin activar ninguna transferencia ni robot.

Las rutas `/api/conversaciones`, `/api/robot/estado` y `/api/conversaciones/control/modo` identificadas en el escritorio TAC legado no se consideran compatibles automáticamente con el PHP actual; antes de implementar un adaptador operativo deben identificarse el servidor, esquema y autenticación de esas rutas.

## Reutilización de diagnóstico n8n existente

La sección Conversaciones ahora llama también a `getRobotCapabilities()`, que consulta `GET /api/robot-status.php` mediante la sesión PHP. La API ya existente comprueba opcionalmente `http://127.0.0.1:5678/healthz` y, si se configura la clave API del proceso PHP, consulta el estado `active` del workflow conocido. La comprobación local requiere `TAC_N8N_LOCAL_HEALTHCHECK=1` y un host localhost/127.0.0.1. El estado `not_configured` no significa que el servicio esté apagado, solo que no se realizó esa comprobación. No se crean nuevos endpoints de n8n ni se transmiten secretos al navegador.

No se infiere que los mensajes de WhatsApp estén almacenados en MySQL. Para conectar conversaciones reales se debe localizar el proveedor o almacenamiento utilizado por el workflow; no es correcto derivar una bandeja a partir de pedidos.
