import type { Program } from '@/lib/strapi/types';

/**
 * Build the campus link for a course card or "Continuar" button.
 *
 * Regular Strapi programs are served from `/cursos/[documentId]`. Maxymia
 * courses live in a separate collection served from `/maxymia/campus/[slug]`;
 * `maxymiaCourseAsProgram` tags them with an `href` pointing there. Routing a
 * Maxymia course through `/cursos/` 404s because that route only resolves
 * regular programs — so a Maxymia-backed card must follow its `href`.
 */
export function buildCourseLink(
  program: Pick<Program, 'documentId' | 'href'>,
  currentLessonId?: string | null
): string {
  const base = program.href ?? `/cursos/${program.documentId}`;
  return currentLessonId ? `${base}/lesson/${currentLessonId}` : base;
}
