-- Unificar los leads de consultoría en Neon (antes solo en Strapi). El endpoint
-- hace guardado dual (Strapi + Neon) y el panel lee de Neon. strapi_document_id
-- permite deduplicar y backfillear el histórico de Strapi de forma idempotente.
-- En Postgres un UNIQUE index permite múltiples NULL, así que los leads sin id
-- de Strapi no colisionan. Idempotente y seguro de re-ejecutar.

CREATE TABLE IF NOT EXISTS "campus"."consulting_leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"strapi_document_id" text,
	"full_name" text NOT NULL,
	"organization" text,
	"email" text NOT NULL,
	"sector" text,
	"question_goal" text,
	"project_phase" text,
	"deadline" text,
	"payload" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "idx_consulting_leads_strapi" ON "campus"."consulting_leads" ("strapi_document_id");
CREATE INDEX IF NOT EXISTS "idx_consulting_leads_created" ON "campus"."consulting_leads" ("created_at");
CREATE INDEX IF NOT EXISTS "idx_consulting_leads_email" ON "campus"."consulting_leads" ("email");
