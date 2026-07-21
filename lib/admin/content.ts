import { strapiRequest } from '@/lib/strapi/client';
import type { StrapiSingleResponse, StrapiProgram } from '@/lib/strapi/types';
import type { MoodleInstance } from '@/lib/moodle/client';

export type AdminContentType = 'program' | 'maxymia-course';

export interface ResolvedContent {
  type: AdminContentType;
  documentId: string;
  title: string;
  slug?: string | null;
  /** Solo programas. */
  programType?: 'Master' | 'Curso';
  moodle?: MoodleInstance | null;
  moodleCourseId?: number | null;
}

interface MaxymiaCourseRest {
  documentId?: string;
  title?: string;
  title_es?: string;
  slug?: string | null;
}

/**
 * Resuelve un `documentId` de Strapi a **programa** (se sirve en Moodle) o a
 * **curso Maxymia** (in-app). Prueba primero `program`; si no existe, prueba
 * `maxymia-course`. Devuelve `null` si el id no existe en ninguno.
 *
 * Es la pieza que le dice a `grantAccess`/`revokeAccess`/`reprovision` si tienen
 * que tocar Moodle (programa) o no (Maxymia).
 */
export async function resolveContent(documentId: string): Promise<ResolvedContent | null> {
  // 1) ¿Programa?
  try {
    const res = await strapiRequest<StrapiSingleResponse<StrapiProgram>>(
      `/api/programs/${documentId}?populate=*`,
      { revalidate: 0 }
    );
    if (res?.data) {
      const p = res.data;
      return {
        type: 'program',
        documentId,
        title: p.title,
        slug: p.slug,
        programType: p.type,
        moodle: p.moodle,
        moodleCourseId: p.moodleCourseId,
      };
    }
  } catch {
    // Strapi devuelve 404 → no es un programa; probamos Maxymia.
  }

  // 2) ¿Curso Maxymia?
  try {
    const res = await strapiRequest<StrapiSingleResponse<MaxymiaCourseRest>>(
      `/api/maxymia-courses/${documentId}`,
      { revalidate: 0 }
    );
    if (res?.data) {
      const c = res.data;
      return {
        type: 'maxymia-course',
        documentId,
        title: c.title || c.title_es || documentId,
        slug: c.slug ?? null,
      };
    }
  } catch {
    // No existe en ninguno.
  }

  return null;
}
