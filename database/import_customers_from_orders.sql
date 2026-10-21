-- Ejecutar UNA VEZ en phpMyAdmin, sobre la BD ACTUAL del Sistema TAC.
-- Requiere que la tabla customers ya exista (customers_migration.sql).
-- Lee orders.payload (JSON) y NO cambia ningún pedido.
-- Evita repetir nombre + teléfono, incluso al ejecutar de nuevo.
INSERT INTO customers (name,phone,address)
SELECT MAX(extracted.name),MAX(extracted.phone),MAX(extracted.address)
FROM (
 SELECT TRIM(JSON_UNQUOTE(JSON_EXTRACT(payload,'$.customer'))) AS name,
        TRIM(COALESCE(JSON_UNQUOTE(JSON_EXTRACT(payload,'$.phone')),'')) AS phone,
        TRIM(COALESCE(JSON_UNQUOTE(JSON_EXTRACT(payload,'$.address')),'')) AS address
 FROM orders
 WHERE JSON_VALID(payload)=1
) AS extracted
WHERE extracted.name IS NOT NULL AND extracted.name<>''
  AND CHAR_LENGTH(extracted.name) BETWEEN 2 AND 120
  AND CHAR_LENGTH(extracted.phone)<=40 AND CHAR_LENGTH(extracted.address)<=2000
  AND NOT EXISTS (
    SELECT 1 FROM customers c
    WHERE LOWER(TRIM(c.name))=LOWER(extracted.name)
      AND REPLACE(REPLACE(REPLACE(REPLACE(c.phone,' ',''),'-',''),'(',''),')','')=
          REPLACE(REPLACE(REPLACE(REPLACE(extracted.phone,' ',''),'-',''),'(',''),')','')
  )
GROUP BY LOWER(extracted.name), REPLACE(REPLACE(REPLACE(REPLACE(extracted.phone,' ',''),'-',''),'(',''),')','');

-- Revisa cuántos clientes hay después:
SELECT COUNT(*) AS total_clientes FROM customers;
