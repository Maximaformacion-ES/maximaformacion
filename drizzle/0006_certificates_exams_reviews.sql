-- Reconciliar tablas que están en el schema pero NO tenían migración: certificates,
-- exam_results y course_reviews. `certificates` ya existe en prod (la creó el sistema
-- de validación de certificados con QR), pero el panel añadió columnas (`instructor`,
-- `revoked_at`) que ese sistema no tenía → cualquier SELECT petaba con 500.
-- Todo idempotente y seguro de re-ejecutar.

-- ── certificates ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "campus"."certificates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" text NOT NULL REFERENCES "campus"."users"("clerk_id"),
	"course_id" text NOT NULL,
	"course_title" text NOT NULL,
	"student_name" text NOT NULL,
	"instructor" text,
	"issued_at" timestamptz DEFAULT now() NOT NULL,
	"completed_at" timestamptz NOT NULL,
	"revoked_at" timestamptz
);
-- Por si la tabla ya existía SIN estas columnas (sistema de certificados original):
ALTER TABLE "campus"."certificates" ADD COLUMN IF NOT EXISTS "instructor" text;
ALTER TABLE "campus"."certificates" ADD COLUMN IF NOT EXISTS "revoked_at" timestamptz;
CREATE UNIQUE INDEX IF NOT EXISTS "idx_certificates_unique" ON "campus"."certificates" ("clerk_id","course_id");
CREATE INDEX IF NOT EXISTS "idx_certificates_course" ON "campus"."certificates" ("course_id");

-- ── exam_results ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "campus"."exam_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" text NOT NULL REFERENCES "campus"."users"("clerk_id"),
	"course_id" text NOT NULL,
	"block_id" text NOT NULL,
	"exam_id" text NOT NULL,
	"score" integer NOT NULL,
	"passed" boolean NOT NULL,
	"answers" jsonb,
	"completed_at" timestamptz DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "idx_exam_results_unique" ON "campus"."exam_results" ("clerk_id","exam_id");
CREATE INDEX IF NOT EXISTS "idx_exam_results_course" ON "campus"."exam_results" ("clerk_id","course_id");

-- ── course_reviews ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "campus"."course_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" text NOT NULL REFERENCES "campus"."users"("clerk_id"),
	"course_id" text NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"created_at" timestamptz DEFAULT now() NOT NULL,
	"updated_at" timestamptz DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "idx_course_reviews_unique" ON "campus"."course_reviews" ("clerk_id","course_id");
CREATE INDEX IF NOT EXISTS "idx_course_reviews_course" ON "campus"."course_reviews" ("course_id");
