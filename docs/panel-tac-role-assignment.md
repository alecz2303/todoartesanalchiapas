> **Escenario actual de Laragon:** solo existe la cuenta activa `id=1, username=arueda`. El usuario autorizó asignarle temporalmente el rol `alec`. Karo queda sin asignar. No crear usuarios ficticios.

## Comandos exactos para esta base de prueba
Primero actualizar la rama. Simulación:
```cmd
php scripts/tac-assign-roles.php --alec-id=1 --actor-id=1 --expect-alec-username=arueda
```
Para aplicar después de revisar que la simulación muestra `arueda` y el nombre exacto de la base local:
```cmd
php scripts/tac-assign-roles.php --alec-id=1 --actor-id=1 --expect-alec-username=arueda --apply --confirm-db=NOMBRE_EXACTO_BD_PRUEBA
```
Solo se inserta **un rol Alec y un evento de auditoría**. Karo no se asigna. El script no admite sobrescribir roles existentes.

# Bloque TAC — asignación auditada de roles en Laragon

El script `scripts/tac-assign-roles.php` **no se ejecuta desde la web**. Requiere PHP CLI, MySQL local y `api/config.local.php`. **No modifica producción ni ejecuta la migración 002**.

## 1. Identificar las cuentas existentes
En HeidiSQL, dentro de la base de prueba:
```sql
SELECT id, username, display_name, is_active FROM users ORDER BY id;
```
Cuando existan ambas cuentas, confirmar con las personas titulares las identidades reales; no asignar basándose solo en nombres similares. El actor es una cuenta activa que realiza la asignación (puede coincidir con una de ellas).

## 2. Simulación obligatoria (sin cambios)
En CMD, desde la raíz del proyecto, reemplazar los tres números por IDs **verificados**:
```cmd
php scripts/tac-assign-roles.php --karo-id=ID_KARO --alec-id=ID_ALEC --actor-id=ID_ACTOR
```
El programa muestra base de datos, nombres y roles. `--karo-id` es opcional para permitir probar solo Alec. Si hay roles previos, cuentas inactivas o faltantes, aborta.

## 3. Aplicación explícita solo en la base de prueba
Únicamente después de revisar la simulación:
```cmd
php scripts/tac-assign-roles.php --karo-id=ID_KARO --alec-id=ID_ALEC --actor-id=ID_ACTOR --apply --confirm-db=NOMBRE_EXACTO_BD_PRUEBA
```
El script requiere que la configuración apunte a MySQL local y que `--confirm-db` coincida con el nombre exacto. Inserta un evento de auditoría por cada rol asignado en **una transacción**. No reasigna roles existentes.

## 4. Verificación
```sql
SELECT u.id, u.username, r.role_code, r.assigned_at
FROM tac_user_roles r JOIN users u ON u.id = r.user_id
ORDER BY r.role_code;
SELECT actor_user_id, action_code, entity_type, entity_id, outcome, created_at
FROM tac_audit_events WHERE action_code = 'tac.role.assign' ORDER BY id DESC LIMIT 10;
```
Después, al iniciar sesión con cada cuenta, Robot Cotizador muestra el rol de su sesión. Solo las cuentas autorizadas podrán **consultar** la bandeja, nunca aprobar ni rechazar.

## Límites
- No enviar contraseñas ni archivos `config.local.php` al chat ni a GitHub.
- El script no es un panel de administración y no admite asignación desde HTTP.
- Para corregir una asignación errónea, detenerse y revisar los eventos; no ejecutar `UPDATE` a ciegas.
- La migración 002 sigue sin ejecutarse. La bandeja puede mostrar temporalmente que la tabla no está disponible.
- No se ha ejecutado este script desde GitHub ni probado contra la base de Laragon.
