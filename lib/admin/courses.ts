import { getPrograms } from '@/lib/strapi/queries';
import { getMaxymiaCoursesFromStrapi } from '@/lib/strapi/maxymia-queries';

export interface CourseOption {
  documentId: string;
  title: string;
  kind: 'program' | 'maxymia';
  /** Etiqueta secundaria: "Programa · Máster", "Programa · Curso", "Maxymia". */
  subtitle: string;
}

/**
 * Lista unificada de contenido matriculable para el buscador del panel:
 * **programas** (se sirven en Moodle) + **cursos Maxymia** (in-app). Devuelve el
 * `documentId` de Strapi (el que usa el acceso) y el título legible. El filtrado
 * por nombre lo hace el combobox en cliente sobre esta lista (son pocas decenas).
 */
export async function listCourses(): Promise<CourseOption[]> {
  const [programsRes, maxymia] = await Promise.all([
    getPrograms({ limit: 100 }).catch((e) => {
      console.warn('[admin:listCourses] getPrograms failed:', e);
      return { programs: [], total: 0, pageCount: 1 };
    }),
    getMaxymiaCoursesFromStrapi().catch((e) => {
      console.warn('[admin:listCourses] getMaxymiaCoursesFromStrapi failed:', e);
      return [];
    }),
  ]);

  const programOpts: CourseOption[] = programsRes.programs.map((p) => ({
    documentId: p.documentId,
    title: p.title,
    kind: 'program',
    subtitle: `Programa · ${p.type}`,
  }));

  const maxymiaOpts: CourseOption[] = maxymia.map((c) => ({
    documentId: c.id, // MaxymiaCourse.id === documentId de Strapi
    title: c.title.es,
    kind: 'maxymia',
    subtitle: 'Maxymia',
  }));

  return [...programOpts, ...maxymiaOpts].sort((a, b) => a.title.localeCompare(b.title, 'es'));
}
