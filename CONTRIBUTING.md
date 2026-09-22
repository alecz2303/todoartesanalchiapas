# Contribución y flujo Git

Este repositorio usa `TODO.md` como fuente canónica de trabajo.

## Antes de desarrollar

1. Revisar el estado real de `main`.
2. Revisar `TODO.md`.
3. Confirmar el ID `TA-###` de la tarea.
4. Si la tarea no existe, agregarla al TODO antes de programar.

## Ramas

Formato:

```text
<tipo>/ta-###-descripcion-corta
```

Tipos permitidos:

- `feat/` — funcionalidad nueva.
- `fix/` — corrección.
- `chore/` — infraestructura, configuración o mantenimiento.
- `docs/` — documentación.
- `refactor/` — refactor sin cambio funcional.

Ejemplos:

```text
feat/ta-044-product-detail
fix/ta-068-phone-validation
chore/ta-020-bootstrap-flutter
```

## Commits

Formato recomendado:

```text
<tipo>: descripción breve [TA-###]
```

Ejemplo:

```text
feat: add product detail screen [TA-044]
```

Una rama debe contener únicamente cambios relacionados con su objetivo.

## Pull requests

Antes de integrar a `main`:

- el TODO debe reflejar el estado real;
- `flutter analyze` debe pasar;
- la compilación Android debe pasar;
- CI debe estar verde;
- no debe haber secretos, llaves o archivos locales;
- la descripción del PR debe indicar el/los IDs `TA-###` atendidos.

No se marca una tarea como ✅ únicamente porque exista código: debe haberse verificado según su criterio de cierre.

## Fuente de verdad

- **Código:** GitHub.
- **Orden y estado del trabajo:** `TODO.md`.
- **Decisiones técnicas importantes:** registrar en documentación del repo y, cuando afecten el roadmap, también en `TODO.md`.
