-- Migración 001 — Estado del menú del Robot Cotizador
-- Base de datos: Postgres del robot (tac_cotizador, contenedor postgres-tac).
-- NO es el MySQL de TAC: este archivo no se corre en el sistema TAC.
-- Se corre ANTES de importar y activar los flujos nuevos en n8n.
-- Crea la tabla donde el bot guarda en qué paso del menú va cada cliente.

-- 1) El teléfono debe ser único en conversaciones_whatsapp.
--    Lo necesita el upsert del Receptor y la llave foránea de abajo.
--    Si ya hay teléfonos repetidos, esto falla: hay que limpiarlos a mano primero.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_index i
    JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY (i.indkey)
    WHERE i.indrelid = 'public.conversaciones_whatsapp'::regclass
      AND i.indisunique
      AND a.attname = 'telefono'
  ) THEN
    ALTER TABLE public.conversaciones_whatsapp
      ADD CONSTRAINT conversaciones_whatsapp_telefono_key UNIQUE (telefono);
  END IF;
END $$;

-- 2) Tabla de estado del menú: un renglón por cliente.
--    paso: en qué paso del menú va el cliente ('menu', 'picado_tipo', ...).
--    datos: las respuestas ya dadas (cantidad, material, diseños, ...).
CREATE TABLE IF NOT EXISTS public.estado_menu_whatsapp (
  telefono TEXT PRIMARY KEY REFERENCES public.conversaciones_whatsapp (telefono) ON DELETE CASCADE,
  paso VARCHAR(50) NOT NULL DEFAULT 'menu',
  datos JSONB NOT NULL DEFAULT '{}'::jsonb,
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3) Permisos para el usuario que usa n8n (el mismo de panel-tac.env: panel_tac).
--    Si en n8n usas otro usuario (por ejemplo tac_robot), cambia panel_tac
--    por ese nombre en estas tres líneas.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.estado_menu_whatsapp TO panel_tac;
GRANT SELECT, INSERT, UPDATE ON public.conversaciones_whatsapp TO panel_tac;
GRANT SELECT ON public.configuracion_robot TO panel_tac;
