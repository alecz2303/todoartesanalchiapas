-- Ejecutar UNA VEZ en phpMyAdmin, sobre la BD ACTUAL del Sistema TAC.
-- Requiere que la tabla products ya exista (products_migration.sql).
-- Lee los renglones (items) de orders.payload (JSON) y NO cambia ningún pedido.
-- Evita repetir descripción + medidas, incluso al ejecutar de nuevo.
-- Requiere MySQL 8 o MariaDB 10.6+ (JSON_TABLE). Si el servidor no lo
-- soporta, usar la acción import_orders de api/products.php en su lugar.
INSERT INTO products (description, measures, unit_price)
SELECT MAX(extracted.description), MAX(extracted.measures), MAX(extracted.unit_price)
FROM (
 SELECT TRIM(JSON_UNQUOTE(JSON_EXTRACT(item, '$.description'))) AS description,
        TRIM(COALESCE(JSON_UNQUOTE(JSON_EXTRACT(item, '$.dimensions')),'')) AS measures,
        COALESCE(CAST(JSON_EXTRACT(item, '$.unitPrice') AS DECIMAL(10,2)), 0.00) AS unit_price
 FROM orders
 JOIN JSON_TABLE(payload, '$.items[*]' COLUMNS (item JSON PATH '$')) AS jt
 WHERE JSON_VALID(payload)=1
) AS extracted
WHERE extracted.description IS NOT NULL AND extracted.description<>''
  AND CHAR_LENGTH(extracted.description) BETWEEN 2 AND 255
  AND CHAR_LENGTH(extracted.measures)<=120
  AND extracted.unit_price>=0 AND extracted.unit_price<1000000
  AND NOT EXISTS (
    SELECT 1 FROM products p
    WHERE LOWER(TRIM(p.description))=LOWER(extracted.description)
      AND LOWER(TRIM(p.measures))=LOWER(extracted.measures)
  )
GROUP BY LOWER(extracted.description), LOWER(extracted.measures);

-- Revisa cuántos productos hay después:
SELECT COUNT(*) AS total_productos FROM products;
