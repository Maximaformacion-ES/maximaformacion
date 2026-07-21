import { clerkClient } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { enrollments } from '@/lib/db/schema';
import { upsertUser, createEnrollment, hasEnrollment, setEnrollmentExpiry } from '@/lib/db/queries';
import { provisionMoodleAccess, unprovisionMoodleAccess } from '@/lib/moodle/provision';
import { sendEmail } from '@/lib/email/client';
import { getSiteUrl } from '@/lib/site-url';
import { resolveContent, type ResolvedContent } from './content';
import { writeAudit } from './audit';

function msg(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

export interface Step {
  step: string;
  ok: boolean;
  detail?: unknown;
}

// ─── Email de bienvenida genérico (Maxymia / programa sin Moodle) ──────────
// Los programas con Moodle ya envían su email de credenciales/confirmación desde
// `provisionMoodleAccess`. Para lo demás (cursos Maxymia in-app, o programas sin
// Moodle configurado) mandamos este, porque conceder acceso manual SIEMPRE avisa
// al alumno (decisión del cliente, 2026-07-10).
function welcomeEmail(firstname: string, content: ResolvedContent) {
  const base = getSiteUrl('https://www.maximaformacion.es');
  const url =
    content.type === 'maxymia-course' && content.slug
      ? `${base}/maxymia/campus/${content.slug}`
      : base;
  const subject = `Ya tienes acceso a ${content.title} | Máxima Formación`;
  const html = `
    <p>Hola ${firstname},</p>
    <p>Te hemos dado acceso a <strong>${content.title}</strong>.</p>
    <p>Puedes empezar cuando quieras desde tu campus:
      <a href="${url}">${url}</a>.
    </p>
    <p>— Máxima Formación</p>
  `;
  const text = `Hola ${firstname},\n\nTe hemos dado acceso a ${content.title}. Puedes empezar desde tu campus: ${url}\n\n— Máxima Formación`;
  return { subject, html, text };
}

export interface GrantAccessParams {
  /** clerkId del admin. */
  actor: string;
  /** clerkId del alumno. */
  targetClerkId: string;
  documentId: string;
  /** Enviar email de bienvenida (por defecto sí). */
  notify?: boolean;
  /**
   * Acceso temporal: fecha de fin en ISO. `undefined` = no tocar (indefinido en
   * altas nuevas); una fecha ISO fija la caducidad; `null` la vuelve indefinida.
   */
  expiresAt?: string | null;
}

export interface GrantAccessResult {
  ok: boolean;
  content: ResolvedContent | null;
  steps: Step[];
}

/**
 * Concede acceso a un curso/programa a un alumno, de forma equivalente a lo que
 * hace el webhook de Stripe tras una compra: matrícula en `campus.enrollments`,
 * espejo en Clerk (`purchasedCourses`), y —para programas con Moodle— alta en
 * Moodle (que además envía el email de credenciales). Para Maxymia (in-app)
 * envía un email de bienvenida genérico. Todo queda en `admin_audit`.
 */
export async function grantAccess(params: GrantAccessParams): Promise<GrantAccessResult> {
  const { actor, targetClerkId, documentId, notify = true } = params;
  // `expiresAt`: undefined = no se toca; string ISO = caduca; null = indefinido.
  const expiry =
    params.expiresAt === undefined ? undefined : params.expiresAt === null ? null : new Date(params.expiresAt);
  const steps: Step[] = [];
  const rec = (step: string, ok: boolean, detail?: unknown) => steps.push({ step, ok, detail });

  const cc = await clerkClient();
  const student = await cc.users.getUser(targetClerkId);
  const email =
    student.primaryEmailAddress?.emailAddress ??
    student.emailAddresses?.[0]?.emailAddress ??
    null;
  const firstname = student.firstName || 'Alumno';
  const lastname = student.lastName || 'Máxima';

  const content = await resolveContent(documentId);
  if (!content) {
    rec('resolve-content', false, `documentId "${documentId}" no encontrado en Strapi (ni programa ni curso Maxymia)`);
    await writeAudit({ actor, action: 'grant_access', entityId: documentId, targetClerkId, diff: { steps }, source: 'panel' });
    return { ok: false, content: null, steps };
  }
  rec('resolve-content', true, { type: content.type, title: content.title });

  // 1) Matrícula (idempotente por uq(clerkId, programDocumentId)).
  await upsertUser(targetClerkId, email ?? undefined);
  const enrollment = await createEnrollment({
    clerkId: targetClerkId,
    programDocumentId: documentId,
    accessType: 'admin_granted',
    title: content.title,
    expiresAt: expiry ?? null,
  });
  // `createEnrollment` no toca filas ya existentes (onConflictDoNothing). Si se
  // pidió una caducidad concreta, la fijamos también sobre la matrícula previa.
  if (!enrollment && expiry !== undefined) {
    await setEnrollmentExpiry(targetClerkId, documentId, expiry);
  }
  rec('enrollment', true, { created: !!enrollment, expiresAt: expiry ? expiry.toISOString() : null });

  // 2) Espejo en Clerk (`purchasedCourses` — fallback que lee la web).
  try {
    const meta = (student.publicMetadata as Record<string, unknown>) || {};
    const existing = (meta.purchasedCourses as { documentId: string; expiresAt?: string | null }[]) || [];
    const expiresIso = expiry ? expiry.toISOString() : null;
    const prev = existing.find((p) => p.documentId === documentId);
    // Si se pasó una caducidad (undefined = no tocar), reflejamos también el
    // `expiresAt` en el espejo de Clerk para que el fallback del gate lo respete.
    const needsUpdate = !prev || (expiry !== undefined && (prev.expiresAt ?? null) !== expiresIso);
    if (needsUpdate) {
      const entry = prev
        ? { ...prev, ...(expiry !== undefined ? { expiresAt: expiresIso } : {}) }
        : {
            programId: null,
            documentId,
            purchasedAt: new Date().toISOString(),
            stripePaymentId: 'admin_granted',
            price: 0,
            title: content.title,
            expiresAt: expiresIso,
          };
      await cc.users.updateUserMetadata(targetClerkId, {
        publicMetadata: {
          ...meta,
          purchasedCourses: [...existing.filter((p) => p.documentId !== documentId), entry],
        },
      });
    }
    rec('clerk-metadata', true);
  } catch (e) {
    rec('clerk-metadata', false, msg(e));
  }

  // 3) Moodle (solo programas con config) — provisionMoodleAccess YA envía el
  //    email de bienvenida/credenciales al alumno.
  if (content.type === 'program' && content.moodle && content.moodleCourseId) {
    if (!email) {
      rec('provision', false, 'el alumno no tiene email en Clerk');
    } else {
      try {
        const r = await provisionMoodleAccess({
          email,
          firstname,
          lastname,
          programTitle: content.title,
          programType: content.programType ?? 'Curso',
          moodleInstance: content.moodle,
          moodleCourseId: content.moodleCourseId,
        });
        rec('provision', true, r);
      } catch (e) {
        rec('provision', false, msg(e));
      }
    }
  } else if (notify) {
    // Maxymia (in-app) o programa sin Moodle → email de bienvenida genérico.
    if (!email) {
      rec('welcome-email', false, 'el alumno no tiene email en Clerk');
    } else {
      try {
        const w = welcomeEmail(firstname, content);
        await sendEmail({ to: email, subject: w.subject, html: w.html, text: w.text });
        rec('welcome-email', true);
      } catch (e) {
        rec('welcome-email', false, msg(e));
      }
    }
  }

  // "ok" = la matrícula y la resolución fueron bien; el email es best-effort y no
  // bloquea el acceso (Moodle/email pueden reintentarse desde el panel).
  const ok = steps.find((s) => s.step === 'resolve-content')!.ok && steps.find((s) => s.step === 'enrollment')!.ok;
  await writeAudit({
    actor,
    action: 'grant_access',
    entityType: content.type,
    entityId: documentId,
    targetClerkId,
    diff: { title: content.title, expiresAt: expiry ? expiry.toISOString() : null, steps },
    source: 'panel',
  });
  return { ok, content, steps };
}

export interface RevokeAccessParams {
  actor: string;
  targetClerkId: string;
  documentId: string;
  /** Sin `confirm: true` corre en dry-run (no borra nada, informa qué haría). */
  confirm?: boolean;
}

export interface RevokeAccessResult {
  dryRun: boolean;
  content: ResolvedContent | null;
  /** Qué hay / qué se hizo. */
  enrollmentPresent: boolean;
  steps: Step[];
}

/**
 * Revoca el acceso: borra la matrícula, quita el curso de `purchasedCourses` en
 * Clerk y —para programas con Moodle— da de baja al alumno del curso en Moodle
 * (`enrol_manual_unenrol_users`; si el token no lo permite, queda registrado el
 * fallo para hacerlo a mano). Dry-run por defecto.
 */
export async function revokeAccess(params: RevokeAccessParams): Promise<RevokeAccessResult> {
  const { actor, targetClerkId, documentId, confirm = false } = params;
  const steps: Step[] = [];
  const rec = (step: string, ok: boolean, detail?: unknown) => steps.push({ step, ok, detail });

  const content = await resolveContent(documentId);
  const enrollmentPresent = await hasEnrollment(targetClerkId, documentId);

  if (!confirm) {
    rec('dry-run', true, {
      wouldDeleteEnrollment: enrollmentPresent,
      wouldUnenrolMoodle: content?.type === 'program' && !!content.moodle && !!content.moodleCourseId,
      content: content ? { type: content.type, title: content.title } : null,
      hint: 'Repite con confirm=true para ejecutar.',
    });
    return { dryRun: true, content, enrollmentPresent, steps };
  }

  // ── DESTRUCTIVO ──
  // 1) Borrar matrícula.
  try {
    await db
      .delete(enrollments)
      .where(and(eq(enrollments.clerkId, targetClerkId), eq(enrollments.programDocumentId, documentId)));
    rec('enrollment-deleted', true);
  } catch (e) {
    rec('enrollment-deleted', false, msg(e));
  }

  // 2) Quitar de `purchasedCourses` en Clerk.
  try {
    const cc = await clerkClient();
    const student = await cc.users.getUser(targetClerkId);
    const meta = (student.publicMetadata as Record<string, unknown>) || {};
    const existing = (meta.purchasedCourses as { documentId: string }[]) || [];
    const next = existing.filter((p) => p.documentId !== documentId);
    if (next.length !== existing.length) {
      await cc.users.updateUserMetadata(targetClerkId, {
        publicMetadata: { ...meta, purchasedCourses: next },
      });
    }
    rec('clerk-metadata', true);
  } catch (e) {
    rec('clerk-metadata', false, msg(e));
  }

  // 3) Baja en Moodle (solo programas con config).
  if (content?.type === 'program' && content.moodle && content.moodleCourseId) {
    try {
      const cc = await clerkClient();
      const student = await cc.users.getUser(targetClerkId);
      const email =
        student.primaryEmailAddress?.emailAddress ?? student.emailAddresses?.[0]?.emailAddress ?? null;
      if (!email) {
        rec('moodle-unenrol', false, 'el alumno no tiene email en Clerk');
      } else {
        const r = await unprovisionMoodleAccess({
          email,
          moodleInstance: content.moodle,
          moodleCourseId: content.moodleCourseId,
        });
        rec('moodle-unenrol', true, r);
      }
    } catch (e) {
      // El token puede no tener habilitada la función de unenrol → dar de baja a mano.
      rec('moodle-unenrol', false, { error: msg(e), hint: 'Dar de baja al alumno en el admin de Moodle.' });
    }
  }

  await writeAudit({
    actor,
    action: 'revoke_access',
    entityType: content?.type,
    entityId: documentId,
    targetClerkId,
    diff: { title: content?.title, steps },
    source: 'panel',
  });
  return { dryRun: false, content, enrollmentPresent, steps };
}
