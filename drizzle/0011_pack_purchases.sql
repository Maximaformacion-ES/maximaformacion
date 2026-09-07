-- Compras del pack de cursos universitarios (pago sin cuenta; los cursos aún
-- no existen en la plataforma, el acceso se asigna después desde el admin).
-- Aplicar a mano en console.neon.tech (las creds de prod no están en local).
CREATE TABLE IF NOT EXISTS campus.pack_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  name text,
  item text NOT NULL,
  item_title text,
  amount numeric(10, 2),
  dni text,
  stripe_session_id text UNIQUE,
  stripe_payment_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pack_purchases_email
  ON campus.pack_purchases (email);
