-- Ejecutar una sola vez en la base de datos ACTUAL del Sistema TAC.
-- No modifica ni borra pedidos existentes.
CREATE TABLE IF NOT EXISTS products (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 description VARCHAR(255) NOT NULL,
 measures VARCHAR(120) NOT NULL DEFAULT '',
 unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 INDEX idx_product_description (description),
 INDEX idx_product_measures (measures)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
