# Conexión TAC con el sistema de pedidos existente

## Decisión de arquitectura

El módulo `Operación TAC` consume directamente el arreglo de pedidos que `App.tsx` ya obtiene de `GET /api/orders.php`, que lee `orders.payload` en MySQL. No crea tablas, no copia pedidos, no genera solicitudes de aprobación y no cambia las APIs existentes de pedidos.

El panel muestra pedidos en proceso, entregas de hoy, entregas vencidas, cotizaciones, anticipos pendientes y saldo de pedidos activos. Los elementos de atención prioritaria permiten abrir el pedido original en el editor actual, donde se mantienen las operaciones comerciales existentes.

El módulo `Aprobaciones` se conserva como funcionalidad auxiliar de revisión, no como requisito previo para operar pedidos. El sistema de pedidos sigue siendo la fuente de verdad.

## Estado de integración

- Pedidos/MySQL: conectado por la ruta existente de la aplicación.
- Panel TAC/Operación: conectado a pedidos ya cargados.
- n8n/Robot: consulta de capacidades separada; no hay autorización para modificar el workflow.
- WhatsApp: todavía no existe una fuente de conversaciones conectada al panel.
- No se ha ejecutado validación de interfaz ni de compilación en el Laragon del usuario.

## Siguiente integración real

Conectar una fuente de conversaciones de WhatsApp a una API PHP autenticada y de solo lectura. Antes de implementar acciones de envío o transferencias, definir origen de mensajes, identificador de conversación, permisos de acceso, secretos de servidor y registro de auditoría. Nunca enviar tokens al frontend ni reutilizar las tablas de pedidos como si fueran mensajes de WhatsApp.

El sistema actual de pedidos no debe reemplazarse ni duplicarse.
