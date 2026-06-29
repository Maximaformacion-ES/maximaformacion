-- Changelog de cambios de curso + lecturas por usuario + snapshot de hashes por unidad.
CREATE TABLE IF NOT EXISTS "campus"."course_updates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "program_document_id" text NOT NULL,
  "program_title" text,
  "module_document_id" text,
  "lesson_document_id" text,
  "change_type" text NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "idx_course_updates_program" ON "campus"."course_updates" ("program_document_id");

CREATE TABLE IF NOT EXISTS "campus"."course_update_reads" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "clerk_id" text NOT NULL,
  "course_update_id" uuid NOT NULL,
  "read_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "idx_course_update_reads_unique" ON "campus"."course_update_reads" ("clerk_id","course_update_id");

CREATE TABLE IF NOT EXISTS "campus"."course_snapshots" (
  "program_document_id" text PRIMARY KEY NOT NULL,
  "course_stamp" text,
  "versions" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
