-- Add the durable `has_been_pro` flag to campus.users.
--
-- Replaces the old "does the user have any subscription row?" heuristic for
-- deciding whether to offer the 1€ trial. That heuristic wrongly tripped on the
-- placeholder subscription rows created on single-course purchases, hiding the
-- promo from users who were never Pro (MF-30).
--
-- Apply this incremental migration MANUALLY against the campus DB (same as
-- 0000). It is idempotent — safe to run more than once.

-- 1) Column. Defaults false so every existing row starts as "never been Pro".
ALTER TABLE "campus"."users"
  ADD COLUMN IF NOT EXISTS "has_been_pro" boolean NOT NULL DEFAULT false;

-- 2) Backfill so current/past Pro users are NOT re-offered the 1€ trial:
--    a) anyone currently on the Pro plan, and
--    b) anyone who has a REAL subscription row (status <> 'none' — a trial or
--       paid subscription, NOT a single-course-purchase placeholder).
UPDATE "campus"."users"
  SET "has_been_pro" = true
  WHERE "plan" = 'pro' AND "has_been_pro" = false;

UPDATE "campus"."users" u
  SET "has_been_pro" = true
  FROM "campus"."subscriptions" s
  WHERE s."clerk_id" = u."clerk_id"
    AND s."status" <> 'none'
    AND u."has_been_pro" = false;
