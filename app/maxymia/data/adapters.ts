import type { MaxymiaCourse } from '../types';
import type { Program } from '@/lib/strapi/types';
import { getCourseMeta } from './queries';

/**
 * Convert a MaxymiaCourse into a Program-shaped record so generic UIs that
 * expect Program (the /programas catalog, "Mis Cursos" list, etc.) can render
 * Maxymia rows without each consumer duplicating the mapping.
 *
 * Fields that don't apply (ects, modules, format-specific flags) get neutral
 * defaults; `href` is set to the canonical Maxymia detail page so cards link
 * to /maxymia/campus/[slug] rather than /programas/[slug] which doesn't know
 * about these rows.
 */
export function maxymiaCourseAsProgram(c: MaxymiaCourse): Program {
  const meta = getCourseMeta(c);
  const totalHours = Math.max(1, Math.round(meta.totalMinutes / 60));
  const subjectArea: Program['subjectArea'] =
    c.category === 'data-science' ? 'Ciencia de Datos' : 'Inteligencia Artificial';
  return {
    id: 0,
    documentId: c.id,
    type: 'Curso',
    title: c.title.es,
    slug: c.slug,
    duration: totalHours,
    ects: 0,
    tags: c.tags ?? [],
    topics: [],
    featured: false,
    description: c.description?.es ?? '',
    longDescription: c.description?.es ?? '',
    image: c.image,
    format: 'Online',
    language: c.language === 'en' ? 'Inglés' : c.language === 'bilingual' ? 'Bilingüe' : 'Español',
    startDate: c.createdAt ?? '',
    certification: '',
    price: c.price,
    originalPrice: c.originalPrice,
    faqs: [],
    subjectArea,
    modules: [],
    audience: c.audiences ?? '',
    careers: c.careers ?? '',
    objectives: c.objectives ?? '',
    isPro: c.isPro,
    // Maxymia courses are not part of the Program `haveDiscount` toggle (separate
    // content type). Kept `true` to preserve their existing 20% Pro discount.
    haveDiscount: true,
    moodleCourseId: null,
    moodle: null,
    href: `/maxymia/campus/${c.slug}`,
  };
}
