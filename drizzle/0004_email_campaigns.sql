-- Fase 2 del panel admin: campañas de email a alumnos.
-- Aplicar en prod ANTES de desplegar el código que lo usa (la BD va por detrás).
CREATE TABLE IF NOT EXISTS "campus"."email_campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id_actor" text,
	"subject" text NOT NULL,
	"body_html" text NOT NULL,
	"segment" jsonb,
	"from_addr" text,
	"reply_to" text,
	"total" integer DEFAULT 0 NOT NULL,
	"sent" integer DEFAULT 0 NOT NULL,
	"failed" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sent_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "campus"."email_campaign_recipients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL REFERENCES "campus"."email_campaigns"("id"),
	"clerk_id" text,
	"email" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"resend_id" text,
	"error" text,
	"sent_at" timestamp with time zone
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_email_campaign_recipients_campaign" ON "campus"."email_campaign_recipients" ("campaign_id");
