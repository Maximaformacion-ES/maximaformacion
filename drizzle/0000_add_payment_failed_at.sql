-- Add payment_failed_at timestamp to support the 3-day grace period before
-- downgrading a subscriber's plan after a failed Stripe payment.
--
-- Apply this incremental migration manually against the existing campus DB.
-- Drizzle generated the full schema baseline (because there was no prior
-- migration snapshot), but the only change we need to ship right now is the
-- single column below.

ALTER TABLE "campus"."subscriptions"
  ADD COLUMN IF NOT EXISTS "payment_failed_at" timestamp with time zone;
