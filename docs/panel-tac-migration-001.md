# Migración 001 — preparación local (NO ejecutada)

**Alcance:** dos tablas nuevas, `tac_user_roles` y `tac_audit_events`. No se alteran `users`, `orders` ni `audit_log`. No se insertan usuarios, no se asignan roles, no se habilitan permisos ni se conecta n8n.

## Precondiciones
1. Trabajar exclusivamente en Laragon con una **base de pruebas**, nunca en la base de producción.
2. Hacer un respaldo verificable de MySQL antes de ejecutar cualquier SQL. Guardarlo fuera del repositorio y confirmar que se puede restaurar en otra base de pruebas.
3. Comprobar la versión de MySQL/MariaDB: la migración usa `CHECK` y `JSON`; el soporte y la aplicación de restricciones dependen de la versión. Si no se cumplen, detenerse y adaptar la migración antes de aplicarla.
4. Confirmar que las tablas `users` y `orders` del esquema existente son las esperadas y que no existen `tac_user_roles` ni `tac_audit_events`.

## Archivo preparado
- `database/migrations/001_panel_tac_roles_audit.sql` — creación aditiva, **sin `IF NOT EXISTS`** para detectar instalaciones parciales.
- `database/migrations/001_panel_tac_roles_audit_rollback.sql` — comprobaciones y `DROP TABLE` comentados; nunca borrar datos sin revisión.

## Validaciones tras aplicar SOLO en base de pruebas
```sql
SHOW CREATE TABLE tac_user_roles;
SHOW CREATE TABLE tac_audit_events;
SELECT COUNT(*) AS roles_asignados FROM tac_user_roles;
SELECT COUNT(*) AS eventos_registrados FROM tac_audit_events;
```
Ambos conteos deben ser cero. La aplicación actual debe seguir iniciando sesión y mostrando pedidos sin cambios.

## Reversión local
1. Confirmar respaldo y conteos en cero.
2. Revisar el archivo de rollback, descomentar manualmente las dos instrucciones `DROP TABLE` **solo si las tablas no tienen datos útiles**.
3. Verificar que `users`, `orders` y `audit_log` siguen intactas.
4. Si hay datos, **no usar DROP**; restaurar la copia de prueba o planificar reversión conservadora.

## Seguridad y fases posteriores
- No ejecutar la migración automáticamente desde PHP ni desde `npm run build`.
- La asignación de Karo y Alec debe hacerse con identificación comprobada de cuentas, no por nombre ni ID supuesto.
- Toda autorización real deberá validarse en PHP con denegación por defecto, protección CSRF y pruebas negativas.
- `tac_audit_events` es una tabla preparada para registros de eventos; aún no hay lógica de inserción ni garantía de inmutabilidad por permisos de BD. Limitar los privilegios de UPDATE/DELETE al implementar auditoría.
- Las solicitudes de aprobación versionadas requieren una **migración posterior**, tras revisar sus reglas y el respaldo.
