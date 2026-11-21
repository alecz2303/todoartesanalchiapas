# Bandeja de aprobaciones TAC (solo lectura)

- `GET /api/tac-approvals.php`: requiere sesión y rol `karo` o `alec` comprobado en `tac_user_roles`.
- Cualquier petición POST recibe 405. No se exponen endpoints de escritura.
- Solo devuelve metadatos mínimos: ID, pedido vinculado, versión, estado y fechas; no incluye snapshots.
- La migración 002 es necesaria para consultar filas. **No se ha ejecutado desde GitHub**.
- Si no hay rol, responde 403; si falta la tabla, responde 503. Ambos estados se muestran sin datos ficticios.
- Los contadores corresponden únicamente a las filas devueltas (máximo 100), no a totales globales.
- No habilitar aprobaciones hasta tener asignación de roles auditada, controles de concurrencia, reglas de versión y validaciones.
