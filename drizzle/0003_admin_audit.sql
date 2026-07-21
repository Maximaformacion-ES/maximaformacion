-- Fase 1 del panel admin: registro de auditoría de las mutaciones del panel.
-- Aplicar en prod ANTES de desplegar el código que lo usa (la BD va por detrás).
CREATE TABLE IF NOT EXISTS "campus"."admin_audit" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id_actor" text NOT NULL,
	"action" text NOT NULL,
	"entity_type" text,
	"entity_id" text,
	"target_clerk_id" text,
	"diff" jsonb,
	"source" text DEFAULT 'panel' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_admin_audit_target" ON "campus"."admin_audit" ("target_clerk_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_admin_audit_created" ON "campus"."admin_audit" ("created_at");
