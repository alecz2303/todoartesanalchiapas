# Desarrollo local

Este documento describe cómo levantar y validar **Todo Artesanal Chiapas App** desde un clon limpio.

## Entorno verificado

La base actual fue validada en CI con:

- Flutter **3.47.5** (stable)
- Dart **3.13.4**
- Android con Java/JVM **17**
- Package / Bundle ID: `com.todoartesanalchiapas.app`
- Nombre visible: **Todo Artesanal Chiapas**

El proyecto usa `pubspec.lock`, por lo que las versiones resueltas de dependencias quedan fijadas.

## Clonar

```bash
git clone https://github.com/alecz2303/todoartesanalchiapas.git
cd todoartesanalchiapas
```

Para desarrollo de una tarea, crea una rama siguiendo `CONTRIBUTING.md`.

## Instalar dependencias

```bash
flutter pub get
```

## Verificar el código

```bash
flutter analyze
```

El análisis debe terminar sin errores antes de abrir o actualizar un PR.

## Ejecutar

Con un emulador o dispositivo Android disponible:

```bash
flutter devices
flutter run
```

## Compilar APK de desarrollo

```bash
flutter build apk --debug
```

El APK queda normalmente en:

```text
build/app/outputs/flutter-apk/app-debug.apk
```

## iOS

La estructura iOS está versionada. La compilación iOS requiere macOS con Xcode y la configuración de firma correspondiente.

## CI

El repositorio contiene:

- `.github/workflows/flutter-ci.yml`: valida PRs y `main` con instalación de dependencias, análisis y build Android.
- `.github/workflows/bootstrap-flutter.yml`: workflow de bootstrap/manual usado para generar y verificar la estructura nativa inicial.
- `.github/workflows/android-navigation-test.yml`: prueba manual de regresión que levanta un emulador Android y recorre las cuatro secciones principales.

## Flujo de trabajo

1. Consultar `TODO.md`.
2. Tomar una tarea `TA-###`.
3. Crear rama según `CONTRIBUTING.md`.
4. Implementar y verificar localmente.
5. Actualizar `TODO.md` con el estado real.
6. Abrir PR hacia `main`.
7. Integrar únicamente con CI verde.

## Archivos que nunca deben versionarse

Entre otros:

- `.env`
- contraseñas o tokens
- `android/key.properties`
- archivos `.jks` / `.keystore`
- certificados o llaves privadas

Consulta `.gitignore` antes de agregar archivos sensibles.


## Navegación Android verificada

La navegación principal fue validada en un emulador Android mediante GitHub Actions. El flujo recorre:

- Inicio
- Catálogo
- Pedido
- Contacto
- regreso a Inicio

Por su costo de ejecución, esta prueba de emulador no corre en cada PR; se mantiene como workflow manual de regresión. El CI normal de cada PR continúa ejecutando análisis, tests rápidos y compilación APK debug.
