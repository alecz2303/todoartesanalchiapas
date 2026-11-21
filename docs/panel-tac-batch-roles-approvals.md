# Bloque de avance — roles, permisos y aprobaciones

## Incluido en la rama de desarrollo
- `api/tac-permissions.php`: consulta el rol real de `tac_user_roles` y deniega por defecto permisos desconocidos y toda escritura.
- `GET /api/tac-permissions-check.php`: contrato de diagnóstico de permisos de la sesión, requiere autenticación y solo GET.
- `database/migrations/002_panel_tac_approvals.sql`: **borrador no aplicado** para solicitudes versionadas, sin modificaciones a `orders`.
- Interfaz de lectura de permisos efectivos en Robot Cotizador.

## Identificar cuentas reales (solo Laragon)
Ejecutar en HeidiSQL sobre la base de pruebas:
```sql
SELECT id, username, display_name, is_active FROM users ORDER BY id;
```
Identificar las cuentas correctas de Karo y Alec con sus titulares. **No compartir contraseñas ni asignar por suposición**. La asignación será una operación posterior, explícita y auditada; no se creó una ruta de administración de roles que pueda usarse accidentalmente.

## Pruebas de permisos
1. Con rol no asignado, la API debe responder `role: unassigned`, todos los permisos `false`.
2. Con rol `karo` o `alec` verificado, solo `diagnosticsRead` y `approvalsRead` deben ser `true`; los demás continúan `false`.
3. Una petición POST al endpoint de diagnóstico debe responder 405.
4. No hay endpoints de aprobación/rechazo ni de activación de robot.

## Migración 002 (pendiente)
No ejecutar todavía. Antes revisar flujo de versiones, consistencia de snapshots, concurrencia y compatibilidad de JSON/CHECK con la versión MySQL/MariaDB local. Respaldos de prueba ya confirmados por el usuario. El DDL de MySQL puede implicar autocommit, por lo que la reversión necesita plan separado.
