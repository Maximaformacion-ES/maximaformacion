import crypto from 'crypto';
import { clerkClient } from '@clerk/nextjs/server';
import { upsertUser } from '@/lib/db/queries';
import { grantAccess } from './access';
import { writeAudit } from './audit';
import { sendWelcomeSetPasswordEmail } from '@/lib/email/welcome-import';

/** Curso al que matricular (ya mapeado a su documentId de Strapi). */
export interface ImportCourse {
  documentId: string;
  title: string;
}

export interface ImportStudentInput {
  email: string;
  firstName?: string;
  lastName?: string;
  /** Cursos en los que matricular al alumno. */
  courses: ImportCourse[];
}

export interface ImportStudentResult {
  email: string;
  ok: boolean;
  /** true si se creó una cuenta Clerk nueva (false = ya existía). */
  created?: boolean;
  clerkId?: string;
  /** nº de matrículas NUEVAS creadas (las ya existentes no cuentan). */
  enrolled: number;
  /** true si se le envió el email de "crea tu contraseña" (solo a cuentas nuevas). */
  emailed?: boolean;
  error?: string;
}

// Contraseña aleatoria fuerte: el alumno no la conoce; entra creando la suya
// propia con el flujo de reset de Clerk (email ya verificado por la Backend API).
function randomPassword(): string {
  return crypto.randomBytes(24).toString('base64url') + 'Aa1!';
}

interface ClerkUserLite {
  id: string;
}

async function findClerkUserByEmail(
  cc: Awaited<ReturnType<typeof clerkClient>>,
  email: string,
): Promise<ClerkUserLite | null> {
  const res = await cc.users.getUserList({ emailAddress: [email], limit: 1 });
  // El SDK devuelve { data, totalCount } en versiones recientes y un array en
  // versiones antiguas: soportamos ambas.
  const list = (Array.isArray(res) ? res : res?.data ?? []) as ClerkUserLite[];
  return list[0] ?? null;
}

/**
 * Da de alta (o reutiliza) un alumno y lo matricula en los cursos indicados.
 * Idempotente: si el email ya tiene cuenta Clerk se reutiliza, y las matrículas
 * duplicadas se ignoran (onConflictDoNothing). Solo envía el email de contraseña
 * cuando la cuenta se crea por primera vez. Nunca lanza: devuelve `{ error }`.
 *
 * Sirve tanto para el alta manual de un alumno como para la importación masiva
 * (el endpoint de importación llama a esta función una vez por fila).
 */
export async function importStudent(
  input: ImportStudentInput,
  opts: { actor: string },
): Promise<ImportStudentResult> {
  const email = input.email?.trim().toLowerCase();
  if (!email || !email.includes('@')) {
    return { email: input.email ?? '', ok: false, enrolled: 0, error: 'Email inválido' };
  }

  try {
    const cc = await clerkClient();

    let user = await findClerkUserByEmail(cc, email);
    let created = false;
    if (!user) {
      user = (await cc.users.createUser({
        emailAddress: [email],
        firstName: input.firstName?.trim() || undefined,
        lastName: input.lastName?.trim() || undefined,
        password: randomPassword(),
        skipPasswordChecks: true,
      })) as ClerkUserLite;
      created = true;
    }
    const clerkId = user.id;

    await upsertUser(clerkId, email);

    // Matriculamos vía grantAccess (el mismo camino canónico del panel): matrícula
    // idempotente + espejo en Clerk + provisión de Moodle para programas (que envía
    // sus credenciales). notify:false para NO mandar el email genérico de curso —
    // al alumno importado ya le mandamos abajo el de "crea tu contraseña".
    let enrolled = 0;
    for (const c of input.courses) {
      if (!c?.documentId) continue;
      const r = await grantAccess({
        actor: opts.actor,
        targetClerkId: clerkId,
        documentId: c.documentId,
        notify: false,
      });
      const created = (r.steps.find((s) => s.step === 'enrollment')?.detail as { created?: boolean } | undefined)?.created;
      if (r.ok && created) enrolled++;
    }

    let emailed = false;
    if (created) {
      try {
        await sendWelcomeSetPasswordEmail({ to: email, firstName: input.firstName });
        emailed = true;
      } catch {
        // El fallo del email no debe tumbar el alta: la cuenta y matrículas ya
        // están. Se puede reenviar después.
      }
    }

    await writeAudit({
      actor: opts.actor,
      action: created ? 'import_student_create' : 'import_student_enroll',
      entityType: 'user',
      entityId: clerkId,
      targetClerkId: clerkId,
      diff: { email, created, enrolledCourses: input.courses.map((c) => c.title) },
    });

    return { email, ok: true, created, clerkId, enrolled, emailed };
  } catch (e) {
    return { email, ok: false, enrolled: 0, error: e instanceof Error ? e.message : String(e) };
  }
}
