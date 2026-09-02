-- Baja de comunicaciones comerciales (RGPD/LSSI). Fecha en la que el alumno se
-- dio de baja del marketing: NULL = acepta comunicaciones. La ponen el enlace
-- "No quiero recibir más comunicaciones" de los emails del panel y el
-- interruptor del perfil. Los segmentos comerciales del composer la respetan;
-- "Matriculados en curso(s)" (comunicación formativa) no filtra por ella.
ALTER TABLE "campus"."users" ADD COLUMN IF NOT EXISTS "marketing_opt_out_at" timestamptz;
