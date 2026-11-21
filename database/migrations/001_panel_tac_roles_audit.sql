-- PROPUESTA: NO EJECUTAR EN PRODUCCIÓN.
-- Aplicar una sola vez sobre una COPIA respaldada de MySQL en Laragon.
-- No altera users, orders ni audit_log existentes; no asigna roles.
CREATE TABLE tac_user_roles (
  user_id BIGINT UNSIGNED NOT NULL,
  role_code VARCHAR(20) NOT NULL,
  assigned_by BIGINT UNSIGNED NULL,
  assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  CONSTRAINT fk_tac_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_tac_roles_actor FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT chk_tac_roles_code CHECK (role_code IN ('karo', 'alec'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE tac_audit_events (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  actor_user_id BIGINT UNSIGNED NULL,
  action_code VARCHAR(80) NOT NULL,
  entity_type VARCHAR(40) NOT NULL,
  entity_id VARCHAR(100) NULL,
  entity_version INT UNSIGNED NULL,
  outcome VARCHAR(20) NOT NULL,
  metadata JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_tac_audit_entity (entity_type, entity_id, created_at),
  INDEX idx_tac_audit_actor (actor_user_id, created_at),
  CONSTRAINT fk_tac_audit_actor FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT chk_tac_audit_outcome CHECK (outcome IN ('success', 'denied', 'failed'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Los roles quedan vacíos. Ningún permiso operativo se activa con este DDL.
