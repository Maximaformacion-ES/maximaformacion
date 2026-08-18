-- Mensajes del formulario público de /contacto. El formulario solo hacía
-- alert() sin enviar nada, así que estos mensajes se perdían. Ahora se guardan
-- aquí (fuente de verdad para el panel admin) además de notificarse por email.
-- Idempotente y seguro de re-ejecutar.

CREATE TABLE IF NOT EXISTS "campus"."contact_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"subject" text,
	"message" text NOT NULL,
	"ip_prefix" text,
	"user_agent" text,
	"referer" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_contact_messages_created" ON "campus"."contact_messages" ("created_at");
CREATE INDEX IF NOT EXISTS "idx_contact_messages_email" ON "campus"."contact_messages" ("email");
