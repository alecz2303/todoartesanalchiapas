-- SOLO para revertir una PRUEBA LOCAL de la migración 001.
-- Antes de ejecutar, confirmar que ambas tablas no tienen datos que conservar.
-- ATENCIÓN: DROP TABLE borra los datos de estas tablas.
SELECT COUNT(*) AS roles_asignados FROM tac_user_roles;
SELECT COUNT(*) AS eventos_registrados FROM tac_audit_events;
-- Ejecutar las dos instrucciones siguientes MANUALMENTE solo si ambos conteos son 0.
-- DROP TABLE tac_audit_events;
-- DROP TABLE tac_user_roles;
