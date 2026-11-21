-- BORRADOR PARA BASE DE PRUEBAS. NO ejecutar automáticamente ni en producción.
-- Requiere migración 001. No modifica pedidos existentes.
-- orders.id real en Laragon: CHAR(36), utf8mb4, utf8mb4_general_ci.
-- La FK order_id debe conservar exactamente ese charset/collation.
CREATE TABLE tac_approval_requests (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL,
  request_key CHAR(36) NOT NULL COMMENT 'Identidad estable de la solicitud en todas sus versiones',
  version INT UNSIGNED NOT NULL DEFAULT 1,
  status VARCHAR(24) NOT NULL DEFAULT 'draft',
  submitted_by BIGINT UNSIGNED NULL,
  reviewed_by BIGINT UNSIGNED NULL,
  before_snapshot JSON NULL,
  after_snapshot JSON NOT NULL,
  reason_code VARCHAR(40) NULL,
  reason_text TEXT NULL,
  submitted_at DATETIME NULL,
  reviewed_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_tac_approval_request_version (request_key, version),
  UNIQUE KEY uq_tac_approval_order_version (order_id, version),
  INDEX idx_tac_approval_request_history (request_key, created_at),
  INDEX idx_tac_approval_queue (status, submitted_at),
  CONSTRAINT fk_tac_approval_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT,
  CONSTRAINT fk_tac_approval_submitter FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_tac_approval_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT chk_tac_approval_status CHECK (status IN ('draft','submitted','returned','approved','rejected')),
  CONSTRAINT chk_tac_approval_version CHECK (version >= 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- request_key debe conservarse entre versiones; lo generará el backend en una fase posterior.
-- Sin datos de ejemplo ni triggers; no habilita operaciones.
