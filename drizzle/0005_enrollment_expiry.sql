-- Acceso temporal: fecha de fin opcional en las matrículas.
-- Si `expires_at` es NULL, el acceso es indefinido (el admin lo revoca a mano).
-- Si tiene fecha, el gate de servidor (getCourseAccess) niega el acceso a partir
-- de ese momento; no hay cron, la revocación de la fila sigue siendo manual.
ALTER TABLE campus.enrollments ADD COLUMN IF NOT EXISTS expires_at timestamptz;
