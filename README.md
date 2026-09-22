# Todo Artesanal Chiapas App

Aplicación móvil oficial de **Todo Artesanal Chiapas**, desarrollada en Flutter.

> 📌 **Plan de trabajo oficial:** consultar [TODO.md](TODO.md). Ese archivo es la fuente canónica para el orden, estado y alcance de las tareas del proyecto.

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

El repositorio ya contiene la estructura nativa Android/iOS y el lockfile de dependencias.

```bash
git clone https://github.com/alecz2303/todoartesanalchiapas.git
cd todoartesanalchiapas
flutter pub get
flutter analyze
flutter run
```

Consulta **[DEVELOPMENT.md](DEVELOPMENT.md)** para el procedimiento completo y **[CONTRIBUTING.md](CONTRIBUTING.md)** para el flujo de ramas, commits y PR.

## Dependencias principales

- `url_launcher`
- `image_picker`

## Próximos pasos

El orden oficial de trabajo se mantiene en **[TODO.md](TODO.md)**. No se deben utilizar listas paralelas que puedan contradecirlo.

---

Proyecto de Todo Artesanal Chiapas.
