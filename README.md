# Todo Artesanal Chiapas App

Aplicación móvil oficial de **Todo Artesanal Chiapas**, desarrollada en Flutter.

## Estado actual

Versión inicial `0.1.0+1` enfocada en validar el flujo principal de clientes:

- Inicio con identidad de marca.
- Catálogo por categorías.
- Solicitud de pedido personalizado.
- Regla de mínimo 20 días de anticipación.
- Aviso de 50% de anticipo para agendar.
- Selección de imagen de referencia.
- Solicitud prellenada por WhatsApp al 961 213 9040.
- Datos de contacto y ubicación de tienda.

## Estructura

```text
lib/
├── data/
├── models/
├── screens/
├── theme/
└── widgets/
assets/
└── branding/
```

## Requisitos

- Flutter compatible con Dart `>=3.10.0 <4.0.0`.
- Android Studio o VS Code con soporte Flutter.

## Preparar el proyecto localmente

Esta primera base contiene el código de aplicación y todavía no incluye las carpetas nativas generadas por Flutter (`android/`, `ios/`, etc.). Para completar el proyecto en una computadora con Flutter instalado:

```bash
flutter create .
flutter pub get
flutter run
```

Antes de ejecutar `flutter create .`, confirma que estás en la raíz clonada de este repositorio.

## Dependencias principales

- `url_launcher`
- `image_picker`

## Próximos pasos

- Integrar logo y fotografías reales de Todo Artesanal Chiapas.
- Crear ficha de detalle de producto.
- Guardar solicitudes y pedidos en backend.
- Agregar estados de pedido y seguimiento para clientes.
- Incorporar panel administrativo, inventario y pagos en etapas posteriores.

---

Proyecto de Todo Artesanal Chiapas.
