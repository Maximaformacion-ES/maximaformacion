-- Marca de reembolso en las compras (panel /admin/compras). Fecha en la que se
-- reembolsó la compra: NULL = no reembolsada. La pone el propio flujo de
-- reembolso de Stripe del panel, y también puede marcarse/desmarcarse a mano
-- (reembolsos hechos directamente en el dashboard de Stripe).
ALTER TABLE "campus"."enrollments" ADD COLUMN IF NOT EXISTS "refunded_at" timestamptz;
