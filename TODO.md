# TODO — Todo Artesanal Chiapas App

> **Documento canónico de trabajo del proyecto.**
>
> Este archivo es la fuente de verdad para saber qué está hecho, qué sigue y qué falta.  
> **No se inicia una funcionalidad nueva sin registrarla aquí primero.**

Última actualización: 2026-09-21  
Versión actual: `0.1.0+1`

---

## 1. Reglas de trabajo

Estas reglas se deben respetar durante todo el desarrollo:

1. **TODO primero.** Toda tarea nueva debe agregarse a este archivo antes de desarrollarse.
2. **ID permanente.** Cada tarea usa un identificador `TA-###`. El ID no se reutiliza ni se renumera.
3. **No borrar historial.** Una tarea terminada se marca como completada; no se elimina.
4. **Un objetivo claro por tarea.** Si una tarea crece demasiado, se divide antes de programarla.
5. **Verificar antes de cerrar.** Una tarea solo pasa a `✅ Hecho` cuando su implementación fue revisada y, cuando aplique, probada.
6. **GitHub es la fuente oficial del código.** No se considera implementado algo que solo exista en un ZIP, equipo local o conversación.
7. **No introducir secretos al repositorio.** Tokens, contraseñas, llaves, keystores y archivos `.env` nunca se versionan.
8. **No rehacer trabajo existente.** Antes de implementar una tarea se revisa el estado real del repositorio.
9. **Cambios funcionales por rama.** Una vez terminada la preparación inicial del proyecto, las funcionalidades se desarrollarán en ramas y se integrarán mediante PR.
10. **Actualizar este TODO en el mismo ciclo de trabajo.** Si una tarea cambia de alcance, se bloquea o termina, se refleja aquí.
11. **No saltar fases por comodidad.** Se pueden adelantar tareas independientes, pero no se construirá una capa que dependa de otra todavía inexistente.
12. **Prioridad del negocio.** La app debe resolver primero catálogo, pedidos, agenda, anticipos y seguimiento antes de agregar funciones secundarias.

### Estados

- ⬜ **Pendiente**
- 🟡 **En progreso**
- 🟠 **Bloqueado**
- ✅ **Hecho**
- 🧊 **Más adelante**

---

## 2. Objetivo del producto

Crear la aplicación oficial de **Todo Artesanal Chiapas** para facilitar:

- descubrimiento de productos;
- solicitudes de pedidos personalizados;
- agenda y fechas de entrega;
- aplicación de políticas comerciales;
- anticipos y saldos;
- seguimiento de pedidos;
- comunicación con clientes;
- catálogo e inventario;
- operación administrativa del negocio.

La experiencia debe conservar la identidad artesanal y chiapaneca de la marca, con una presentación moderna, limpia y reconocible.

---

## 3. Estado actual — v0.1

### ✅ Base ya implementada

- ✅ **TA-001** Crear repositorio oficial `alecz2303/todoartesanalchiapas`.
- ✅ **TA-002** Crear base Flutter modular.
- ✅ **TA-003** Crear navegación principal: Inicio, Catálogo, Pedido y Contacto.
- ✅ **TA-004** Crear pantalla inicial de catálogo por categorías.
- ✅ **TA-005** Crear formulario inicial de pedido personalizado.
- ✅ **TA-006** Aplicar mínimo de 20 días de anticipación en el selector de fecha.
- ✅ **TA-007** Mostrar política de 50% de anticipo para agendar.
- ✅ **TA-008** Permitir elegir una imagen de referencia.
- ✅ **TA-009** Preparar solicitud de cotización para WhatsApp.
- ✅ **TA-010** Agregar datos básicos de tienda, ubicación y redes.
- ✅ **TA-011** Crear tema visual provisional de Todo Artesanal.
- ✅ **TA-012** Crear `.gitignore` para Flutter, Android, iOS, IDEs y secretos.
- ✅ **TA-013** Crear este TODO canónico del proyecto.

> La v0.1 es una **base funcional de interfaz y flujo**. Todavía no existe backend, persistencia de pedidos, cuentas, panel administrativo ni pagos reales.

---

# 4. FASE 0 — Proyecto Flutter ejecutable

**Objetivo:** convertir la base actual en un proyecto Flutter completo que pueda clonarse, compilarse y probarse de forma reproducible.

- ✅ **TA-020** Generar estructura nativa Flutter completa (`android/`, `ios/` y archivos generados necesarios).
- ✅ **TA-021** Confirmar identificador de aplicación Android: `com.todoartesanalchiapas.app`.
- ✅ **TA-022** Configurar nombre visible: **Todo Artesanal Chiapas**.
- ✅ **TA-023** Ejecutar `flutter pub get` y resolver advertencias/dependencias.
- ✅ **TA-024** Ejecutar `flutter analyze` sin errores.
- ✅ **TA-025** Compilar primera APK de desarrollo.
- ✅ **TA-026** Probar navegación completa en dispositivo/emulador Android.
- ✅ **TA-027** Crear GitHub Actions para análisis y pruebas básicas.
- ✅ **TA-028** Definir convención de ramas, commits y PR del proyecto.
- ✅ **TA-029** Documentar procedimiento reproducible de instalación/desarrollo en `DEVELOPMENT.md`.

**Criterio para cerrar Fase 0:** cualquier desarrollador puede clonar el repo, instalar dependencias, ejecutar la app y obtener una compilación Android sin modificar código.

---

# 5. FASE 1 — Identidad visual oficial y catálogo

**Objetivo:** que la app deje de sentirse como una maqueta y se reconozca inmediatamente como Todo Artesanal Chiapas.

## Marca

- ✅ **TA-030** Integrar logo oficial de Todo Artesanal Chiapas.
- ⬜ **TA-031** Crear icono oficial de la app.
- ⬜ **TA-032** Crear splash screen.
- ⬜ **TA-033** Definir paleta final y sistema visual.
- ⬜ **TA-034** Definir tipografías y jerarquías.
- ⬜ **TA-035** Crear componentes reutilizables de marca.
- ⬜ **TA-036** Revisar contraste, tamaños de texto y accesibilidad básica.

## Catálogo

- 🟡 **TA-040** Definir categorías oficiales de productos.
- 🟡 **TA-041** Definir modelo completo de producto.
- ⬜ **TA-042** Integrar fotografías reales de productos.
- 🟡 **TA-043** Crear tarjeta definitiva de producto.
- 🟡 **TA-044** Crear pantalla de detalle de producto.
- 🟡 **TA-045** Mostrar medidas, variantes y opciones cuando correspondan.
- 🟡 **TA-046** Diferenciar productos personalizados de productos disponibles en tienda.
- 🟡 **TA-047** Mostrar precios fijos únicamente cuando aplique.
- 🟡 **TA-048** Mostrar “Solicitar cotización” cuando el precio dependa del diseño.
- 🟡 **TA-049** Agregar búsqueda y filtros cuando el catálogo lo justifique.

**Criterio para cerrar Fase 1:** la app tiene identidad oficial y el cliente puede entender claramente qué vende Todo Artesanal y cómo solicitar cada producto.

---

# 6. FASE 2 — Pedido personalizado MVP

**Objetivo:** convertir el formulario actual en un flujo de pedido claro, validado y alineado a la operación real del negocio.

- ⬜ **TA-060** Revisar campos requeridos por cada categoría.
- ⬜ **TA-061** Hacer formulario dinámico según tipo de producto.
- ⬜ **TA-062** Solicitar tamaño/medidas cuando aplique.
- ⬜ **TA-063** Solicitar colores cuando aplique.
- ⬜ **TA-064** Solicitar cantidad cuando aplique.
- ⬜ **TA-065** Solicitar nombre/texto personalizado cuando aplique.
- ⬜ **TA-066** Mejorar adjunto de imágenes de referencia.
- ⬜ **TA-067** Permitir varias referencias cuando sea necesario.
- ⬜ **TA-068** Validar teléfono y campos obligatorios.
- ⬜ **TA-069** Convertir regla de 20 días en configuración central, no valor disperso en código.
- ⬜ **TA-070** Convertir porcentaje de anticipo en configuración central.
- ⬜ **TA-071** Crear resumen del pedido antes de enviarlo.
- ⬜ **TA-072** Mostrar aceptación de políticas antes de continuar.
- ⬜ **TA-073** Mejorar mensaje estructurado enviado por WhatsApp.
- ⬜ **TA-074** Definir tratamiento para pedidos urgentes o fechas fuera de política.

**Criterio para cerrar Fase 2:** un cliente puede describir correctamente lo que necesita sin que Todo Artesanal tenga que volver a pedir por chat la información básica.

---

# 7. FASE 3 — Backend y pedidos reales

**Objetivo:** dejar de depender de WhatsApp como único registro y guardar los pedidos de forma estructurada.

- ⬜ **TA-080** Elegir y documentar arquitectura de backend.
- ⬜ **TA-081** Diseñar modelo de datos.
- ⬜ **TA-082** Crear entidades de cliente.
- ⬜ **TA-083** Crear entidades de producto.
- ⬜ **TA-084** Crear entidades de pedido.
- ⬜ **TA-085** Crear entidades de detalle de pedido.
- ⬜ **TA-086** Crear entidades de pago/anticipo.
- ⬜ **TA-087** Crear almacenamiento de imágenes/referencias.
- ⬜ **TA-088** Crear API para registrar pedidos.
- ⬜ **TA-089** Generar folio único de pedido, por ejemplo `TA-000123`.
- ⬜ **TA-090** Guardar fecha del evento y fecha comprometida de entrega.
- ⬜ **TA-091** Definir estados oficiales del pedido.
- ⬜ **TA-092** Registrar historial de cambios de estado.
- ⬜ **TA-093** Manejar errores, reintentos y conexión sin internet de forma segura.
- ⬜ **TA-094** Proteger API y datos sensibles.

### Estados iniciales propuestos del pedido

1. Solicitud recibida
2. En cotización
3. Esperando anticipo
4. Agendado
5. En elaboración
6. Detalles finales
7. Listo para recoger
8. Entregado
9. Cancelado

> Estos estados se validarán con la operación real antes de implementarlos definitivamente.

**Criterio para cerrar Fase 3:** una solicitud enviada desde la app queda almacenada y puede consultarse sin depender del historial de WhatsApp.

---

# 8. FASE 4 — Cuenta y seguimiento del cliente

**Objetivo:** que el cliente pueda consultar sus pedidos sin preguntar constantemente por WhatsApp.

- ⬜ **TA-100** Definir sistema de identificación/autenticación.
- ⬜ **TA-101** Crear perfil básico del cliente.
- ⬜ **TA-102** Crear sección **Mis pedidos**.
- ⬜ **TA-103** Crear detalle de pedido.
- ⬜ **TA-104** Mostrar estado actual.
- ⬜ **TA-105** Mostrar anticipo registrado.
- ⬜ **TA-106** Mostrar saldo pendiente.
- ⬜ **TA-107** Mostrar fecha de entrega.
- ⬜ **TA-108** Mostrar historial del pedido.
- ⬜ **TA-109** Crear notificación de “pedido listo”.
- ⬜ **TA-110** Definir otras notificaciones útiles sin saturar al cliente.
- ⬜ **TA-111** Crear favoritos.
- ⬜ **TA-112** Permitir reutilizar datos de un pedido anterior cuando tenga sentido.

**Criterio para cerrar Fase 4:** el cliente puede saber qué pidió, cuánto ha pagado, cuánto debe y en qué estado está.

---

# 9. FASE 5 — Panel administrativo

**Objetivo:** que Todo Artesanal gestione la operación desde un panel propio.

- ⬜ **TA-120** Elegir arquitectura del panel administrativo.
- ⬜ **TA-121** Crear autenticación administrativa.
- ⬜ **TA-122** Crear dashboard general.
- ⬜ **TA-123** Listar solicitudes nuevas.
- ⬜ **TA-124** Crear cotización desde una solicitud.
- ⬜ **TA-125** Aprobar/agendar pedido.
- ⬜ **TA-126** Registrar anticipo.
- ⬜ **TA-127** Registrar pagos adicionales.
- ⬜ **TA-128** Cambiar estado del pedido.
- ⬜ **TA-129** Registrar fecha de entrega.
- ⬜ **TA-130** Crear agenda/calendario de entregas.
- ⬜ **TA-131** Crear CRUD de categorías.
- ⬜ **TA-132** Crear CRUD de productos.
- ⬜ **TA-133** Gestionar fotografías.
- ⬜ **TA-134** Administrar políticas: días mínimos y porcentaje de anticipo.
- ⬜ **TA-135** Crear ficha/historial de cliente.
- ⬜ **TA-136** Agregar búsqueda y filtros de pedidos.
- ⬜ **TA-137** Crear indicadores básicos de operación.

### Indicadores iniciales

- pedidos activos;
- solicitudes pendientes de cotización;
- pedidos pendientes de anticipo;
- entregas de la semana;
- ventas del mes;
- anticipos cobrados;
- saldos pendientes;
- productos/categorías más solicitados.

**Criterio para cerrar Fase 5:** la operación básica de pedidos puede administrarse sin editar directamente base de datos ni depender de hojas externas.

---

# 10. FASE 6 — Inventario y venta inmediata

**Objetivo:** soportar artículos que sí pueden venderse directamente desde existencia.

- ⬜ **TA-140** Crear inventario de productos listos para entrega.
- ⬜ **TA-141** Manejar existencia por producto/variante.
- ⬜ **TA-142** Mostrar disponibilidad en tiempo real.
- ⬜ **TA-143** Permitir apartar producto.
- ⬜ **TA-144** Definir vigencia de apartados.
- ⬜ **TA-145** Descontar existencia al confirmar venta.
- ⬜ **TA-146** Crear alertas de bajo inventario cuando aplique.
- ⬜ **TA-147** Registrar movimientos de inventario.

**Criterio para cerrar Fase 6:** las piezas disponibles físicamente pueden publicarse y controlarse sin vender dos veces la misma existencia.

---

# 11. FASE 7 — Pagos

**Objetivo:** registrar y posteriormente permitir anticipos/pagos desde la app.

- ⬜ **TA-150** Definir flujo contable de anticipo, saldo y liquidación.
- ⬜ **TA-151** Calcular anticipo automáticamente desde el total cotizado.
- ⬜ **TA-152** Registrar pagos manuales desde administración.
- ⬜ **TA-153** Evaluar pasarela de pago en línea.
- ⬜ **TA-154** Integrar pago de anticipo cuando sea aprobado.
- ⬜ **TA-155** Registrar referencia/identificador de transacción.
- ⬜ **TA-156** Actualizar saldo después de cada pago.
- ⬜ **TA-157** Generar comprobante/recibo.
- ⬜ **TA-158** Manejar pagos fallidos, cancelados y duplicados.
- ⬜ **TA-159** No marcar un pedido como pagado únicamente por respuesta del cliente; verificar estado real del pago.

**Criterio para cerrar Fase 7:** anticipo, pagos y saldo tienen un registro confiable y auditable.

---

# 12. FASE 8 — Calidad, seguridad y publicación

**Objetivo:** llevar el producto de desarrollo a una versión apta para clientes reales.

## Calidad

- ⬜ **TA-170** Crear pruebas unitarias de reglas de negocio.
- ⬜ **TA-171** Crear pruebas de widgets/flujos críticos.
- ⬜ **TA-172** Probar dispositivos y tamaños de pantalla Android.
- ⬜ **TA-173** Probar funcionamiento con conexión lenta/intermitente.
- ⬜ **TA-174** Revisar rendimiento y tamaño de imágenes.
- ⬜ **TA-175** Revisar accesibilidad básica.
- ⬜ **TA-176** Eliminar warnings de compilación.
- ⬜ **TA-177** Mantener CI verde antes de integrar cambios.

## Seguridad y privacidad

- ⬜ **TA-180** Definir datos personales realmente necesarios.
- ⬜ **TA-181** Crear aviso de privacidad.
- ⬜ **TA-182** Crear términos/políticas aplicables.
- ⬜ **TA-183** Revisar permisos solicitados por la app.
- ⬜ **TA-184** Proteger credenciales y secretos mediante configuración segura.
- ⬜ **TA-185** Revisar almacenamiento de imágenes y datos personales.

## Publicación

- ⬜ **TA-190** Definir package/application ID definitivo.
- ⬜ **TA-191** Configurar firma de release Android.
- ⬜ **TA-192** Crear ficha de Play Store.
- ⬜ **TA-193** Crear capturas y materiales gráficos.
- ⬜ **TA-194** Crear política de privacidad pública.
- ⬜ **TA-195** Generar primera versión para prueba interna.
- ⬜ **TA-196** Realizar ronda de prueba interna.
- ⬜ **TA-197** Resolver incidencias encontradas.
- ⬜ **TA-198** Publicar versión 1.0 en Android.
- 🧊 **TA-199** Preparar publicación para iOS cuando se decida.

---

# 13. Versionado objetivo

La numeración puede ajustarse si el alcance cambia, pero la intención inicial es:

| Versión | Objetivo |
|---|---|
| **0.1** | Base visual y flujo inicial — actual |
| **0.2** | Proyecto ejecutable + identidad oficial + catálogo mejorado |
| **0.3** | Pedido personalizado completo |
| **0.4** | Backend y pedidos persistentes |
| **0.5** | Seguimiento para clientes |
| **0.6** | Panel administrativo |
| **0.7** | Inventario y venta inmediata |
| **0.8** | Pagos |
| **0.9** | Pruebas, seguridad y preparación de publicación |
| **1.0** | Primera versión pública estable |

---

# 14. Fuera de alcance inmediato / Backlog

Estas ideas no se descartan, pero **no deben desplazar el MVP**:

- 🧊 **TA-210** Programa de clientes frecuentes.
- 🧊 **TA-211** Cupones/promociones.
- 🧊 **TA-212** Notificaciones segmentadas de campañas.
- 🧊 **TA-213** Recomendaciones basadas en compras anteriores.
- 🧊 **TA-214** Galería de trabajos realizados.
- 🧊 **TA-215** Reseñas/testimonios.
- 🧊 **TA-216** Compartir productos en redes.
- 🧊 **TA-217** Invitaciones digitales como producto configurable.
- 🧊 **TA-218** Métricas avanzadas de ventas y clientes.
- 🧊 **TA-219** Múltiples sucursales, si algún día se requieren.

---

# 15. Próximo bloque de trabajo

El siguiente bloque oficial es:

### **FASE 1 — Identidad visual oficial y catálogo**

La **FASE 0 quedó completada** con estructura nativa Android/iOS, dependencias reproducibles, análisis en verde, APK debug compilada, prueba de navegación Android, CI y documentación.

Orden recomendado del siguiente bloque:

1. **TA-030 / TA-031 / TA-032** Logo, icono y splash oficiales.
2. **TA-033 / TA-034 / TA-035 / TA-036** Sistema visual y accesibilidad básica.
3. **TA-040 / TA-041** Categorías y modelo definitivo de producto.
4. **TA-042 / TA-043 / TA-044** Fotografías, tarjetas y detalle de producto.
5. **TA-045 / TA-046 / TA-047 / TA-048 / TA-049** Variantes, disponibilidad, precios, cotización, búsqueda y filtros.

**No se iniciará Fase 2 como bloque principal hasta que el catálogo y la identidad oficial de Fase 1 estén consolidados.**

---

## Registro de decisiones importantes

| Fecha | Decisión |
|---|---|
| 2026-09-21 | Flutter será la base de la aplicación móvil. |
| 2026-09-21 | GitHub será la fuente oficial del código. |
| 2026-09-21 | Los pedidos personalizados requieren inicialmente 20 días de anticipación. |
| 2026-09-21 | Se solicita inicialmente 50% de anticipo para agendar. |
| 2026-09-21 | El primer flujo prioriza catálogo, solicitud de pedido y WhatsApp. |
| 2026-09-21 | Este archivo `TODO.md` se adopta como fuente canónica del plan de trabajo. |
| 2026-09-21 | Identificador técnico Android/iOS definido: `com.todoartesanalchiapas.app`. |
| 2026-09-21 | Convención Git definida en `CONTRIBUTING.md`; el trabajo de TA-020 se realiza en `chore/ta-020-bootstrap-flutter`. |
| 2026-09-21 | Base verificada con Flutter 3.47.5 / Dart 3.13.4: `flutter pub get`, `flutter analyze` y build APK debug exitosos en GitHub Actions. |
| 2026-09-21 | Navegación principal validada en emulador Android mediante GitHub Actions; el test de emulador queda disponible como workflow manual de regresión. |
| 2026-09-21 | FASE 0 completada; el siguiente bloque canónico es FASE 1 — identidad visual oficial y catálogo. |\n| 2026-09-22 | Logo oficial integrado y nombre de marca normalizado como `Todo Artesanal Chiapas` en la interfaz. |

---

**Regla final:** si una idea nueva aparece durante el desarrollo, primero se registra y prioriza aquí. Que una idea sea buena no significa que deba interrumpir el bloque actual.
