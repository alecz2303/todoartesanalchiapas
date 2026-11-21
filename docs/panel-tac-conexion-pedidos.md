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

## Recuperación de la API del escritorio anterior

El código original del escritorio usa `GET /api/conversaciones` y `GET /api/robot/estado`, con una sesión distinta de la sesión PHP. Se agregó `GET /api/tac-legacy-read.php`, protegido por sesión PHP y permiso `diagnostics.read`. El puente no modifica el robot ni las conversaciones. Para impedir solicitudes arbitrarias solo acepta `TAC_LEGACY_READ_BASE=http://127.0.0.1:PUERTO` (puerto local explícito mayor que 1023) y `TAC_LEGACY_READ_TOKEN` configurados en el proceso PHP. La autenticación Bearer debe estar **soportada explícitamente por el backend legado**; el JavaScript original solo demuestra autenticación por cookie, por lo que configurar esas variables sin adaptar o verificar el servidor **no garantiza la conexión**. No reutilizar cookies de usuarios ni introducir credenciales en React.

Cuando no se configura, responde `connected:false` y la interfaz indica que falta conexión; no presenta contactos de pedidos como conversaciones. Cuando responde, expone exclusivamente `telefono`, `modo_atencion` y `actualizado_en` de hasta 200 conversaciones, además del estado de robot si está disponible. No recupera contenido de mensajes, porque el contrato inspeccionado no lo ofrece.

**Pendiente antes de habilitar acciones:** inspeccionar código del servidor Node anterior, identificar puerto real, autenticar de manera segura y confirmar que la lectura se realiza contra la instancia correcta. Los POST de control del robot y transferencias Robot/Karo siguen intencionadamente sin implementar en este puente, hasta verificar permisos, protección CSRF y auditoría en el servicio real.

## Contrato verificado del backend Node original (21-11-2026)

Inspección de `server/index.js` y los módulos `sesiones.mjs`, `auth.mjs`, `seguridad.mjs`, `csrf.mjs`, `conversaciones.mjs`, `control-conversaciones.mjs`, `robot.mjs` y `control-robot.mjs` suministrados por el operador:

- Instancia local: Docker `panel-tac`, bind mount `C:\\Users\\7400\\panel-tac:/app`, puerto publicado `127.0.0.1:3001`.
- PostgreSQL: contenedor `postgres-tac`, base `tac_cotizador`, usuario `tac_robot`. Los datos de conversación están en `public.conversaciones_whatsapp`; estado en `public.configuracion_robot`.
- Sesiones: `express-session` + `connect-pg-simple`, cookie HTTP-only `tac.sid`, `sameSite:lax`, expiración 8 horas, persistida en `sesiones_panel`. Login con Argon2 y rol `administrador`; `GET /api/auth/sesion` devuelve 401 sin cookie válida.
- Escrituras: `protegerOrigen` exige `Origin: http://localhost:3001` y JSON; `exigirCsrf` exige token de sesión obtenido por `GET /api/csrf/token`. No está demostrado soporte para tokens Bearer ni autenticación servicio-a-servicio.
- `GET /api/conversaciones`: `{totalMostradas, conversaciones:[{telefono,modo_atencion,actualizado_en}]}`, máximo 100; `GET /api/conversaciones/telefono/:telefono`: `{conversacion}`; `GET /api/robot/estado`: `{estado,actualizadoEn}`.
- `POST /api/conversaciones/control/modo`: `{telefono,modo:'robot'|'karo'}`, llama `public.cambiar_modo_conversacion`. `POST /api/robot/control/estado`: `{estado:'activo'|'pausado'}`, llama `public.cambiar_estado_general`. Ambas son operaciones reales que pueden afectar n8n; no ejecutar sin autorización, revisión de las funciones SQL y prueba controlada.

**Consecuencia:** el adaptador actual `api/tac-legacy-read.php` usa Bearer y **no es operativo contra el Node original sin un cambio de autenticación**. No establecer `TAC_LEGACY_READ_TOKEN` como si fuera un token válido del servidor. No trasladar `SESSION_SECRET`, contraseñas, cookies ni tokens CSRF al frontend o a variables compartidas. Para una integración segura, evaluar un endpoint interno de solo lectura autenticado por servicio, con permisos mínimos, antes de habilitar escrituras; revisar la definición SQL de las funciones almacenadas y su auditoría. No se ha cambiado el backend original ni los workflows de n8n.
