# Menú del Robot Cotizador — cómo ponerlo en marcha

Todo esto es para el bot de WhatsApp de Todo Artesanal (número 961 106 1857).
Nada de esto está prendido todavía: los archivos solo están guardados en la
rama TACAPP-31. Para que el bot conteste hay que seguir estos pasos en tu
máquina.

## Qué hay en esta carpeta

- `workflows/tac-receptor-meta-whatsapp.json` — el Receptor nuevo: recibe los
  mensajes de WhatsApp, comprueba que de verdad vengan de Meta, revisa los
  dos interruptores (general y por chat) y pasa el mensaje al menú.
- `workflows/tac-menu-robot-cotizador.json` — el menú nuevo: las 6 opciones,
  los submenús, la conexión con el motor de cotización, el envío de respuestas
  y el pase a Karo.
- `workflows/tac-entrada-pedidos-whatsapp.json` — el motor de siempre, con dos
  cambios pequeños: la ruta del webhook ahora es `tac-cotizador` (antes era
  `tac-cotizador-prueba`) y las tazas prediseñadas ya cotizan a $38 fijas.
- `sql/001_estado_menu_whatsapp.sql` — la tabla nueva donde el bot guarda en
  qué paso del menú va cada cliente. Se corre en el Postgres del robot.
- Este archivo, con los pasos.

## Lo que hace el menú

1. Dirección — responde con la dirección del negocio.
2. Horarios — responde con los horarios.
3. Piñatas — siempre pasan a Karo; el bot cambia ese chat a manual con Karo.
4. Papel / Plástico picado — pide los datos y cotiza con el motor.
5. Tazas — pide los datos y cotiza con el motor.
6. Otros productos — pasan a Karo.

El robot contesta por defecto. Antes de contestar revisa primero el
interruptor general de todo el WhatsApp y luego el de ese chat. Si el
general está pausado, no contesta nada. Si el chat está en Karo, no contesta
ese chat.

Precios que usa el motor (los que confirmaste): picado prediseñado $40
(menos de 10 tiras) y $38 (10 o más); picado personalizado $85 (10–29),
$55 (30–99), $45 (100); tazas personalizadas $70 y $38 a partir de 12 con
el mismo diseño; tazas prediseñadas $38. Anticipo siempre 60%.

## Paso 1 — Corre el SQL en el Postgres del robot

En tu máquina, desde la carpeta donde guardaste estos archivos:

    docker exec -i postgres-tac psql -U postgres -d tac_cotizador < n8n/sql/001_estado_menu_whatsapp.sql

Esto crea la tabla `estado_menu_whatsapp`. Si algo falla con los permisos
(GRANT), cambia `panel_tac` por el usuario que usa n8n (mira el paso 3).

## Paso 2 — Agrega dos variables al n8n

En el archivo `n8n-tac-compose.yml`, dentro de `environment`, agrega:

    TAC_META_WHATSAPP_TOKEN=<el token permanente de WhatsApp>
    TAC_META_PHONE_NUMBER_ID=<el ID del número 961 106 1857>

Los dos valores están en Meta Developers, en tu app, en WhatsApp → API Setup.
No los pegues en el chat. Después vuelve a levantar el contenedor:

    docker compose -f n8n-tac-compose.yml up -d

## Paso 3 — Crea la credencial de Postgres en n8n

En n8n, abre cualquier nodo de Postgres de los flujos nuevos y crea la
credencial (llámala "Postgres TAC"):

- Host: postgres-tac
- Puerto: 5432
- Base de datos: tac_cotizador
- Usuario: panel_tac (el mismo de panel-tac.env)
- Contraseña: la de panel-tac.env

Si la conexión falla con ese usuario, prueba con tac_robot.

## Paso 4 — Importa los 3 flujos

En n8n: Workflows → ⋯ → Import from File, y elige los 3 archivos JSON de
`n8n/workflows/`. Después borra o archiva los 3 flujos viejos con el mismo
nombre (Receptor y Entrada), para no confundirlos. El flujo viejo
"Robot Cotizador WhatsApp" es solo de pruebas: no lo actives.

En los nodos de Postgres que te pidan credencial, elige "Postgres TAC".

## Paso 5 — Activa los 3 flujos

En cada flujo nuevo, prende el interruptor Active. Los 3 tienen que estar
activos: Receptor, Menú y Entrada.

## Paso 6 — Revisa que el túnel esté arriba

El bot recibe los mensajes por el túnel de Cloudflare. Revisa que esté
corriendo:

    cloudflared tunnel --url http://localhost:5678

Si la dirección del túnel cambió desde la última vez, actualízala en
Meta Developers (la ruta del webhook es la misma: `tac-meta-verificacion`).
También revisa en el panel que el interruptor general esté en Activo.

## Paso 7 — Prueba desde otro teléfono

Escribe "hola" al 961 106 1857 desde un teléfono que no sea el del negocio.
Debe llegar el menú con las 6 opciones. Prueba también una cotización
(de picado y de tazas) y la opción de piñatas (debe pasar el chat a Karo).

## Si algo no contesta

1. Mira la pestaña Executions en n8n: ahí se ve en qué nodo se atoró.
2. Revisa que el SQL del paso 1 se haya corrido.
3. Revisa que las dos variables del paso 2 estén en el contenedor.
4. Revisa que los 3 flujos estén activos y que el túnel esté arriba.
5. Revisa en el panel que el chat no esté en Karo y que el general esté activo.

## Notas

- Los flujos se armaron con el respaldo de n8n del 19 de noviembre. Si el
  n8n en vivo cambió desde entonces, dime y lo revisamos antes de importar.
- Versiones de nodo usadas: Webhook 2.2, Code 2, IF 2.2, Merge 3,
  HTTP Request 4.2, Postgres 2.4, Respond to Webhook 1.5 (las de tu
  n8n 2.48.5). Si al importar n8n dice que un nodo no existe, dime.
- La ruta del webhook en Meta no cambia: sigue siendo
  `tac-meta-verificacion`. No hay que tocar nada en Meta Developers,
  salvo la dirección del túnel si cambió.
