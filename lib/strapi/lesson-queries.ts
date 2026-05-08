import { strapiRequest, getStrapiMediaUrl } from './client';
import type {
  StrapiResponse,
  StrapiSingleResponse,
  StrapiProgram,
  StrapiModule,
  StrapiLesson,
  Lesson,
  ModuleWithLessons,
  ProgramWithLessons,
  Program,
} from './types';

// Transform Strapi Lesson to frontend Lesson
function transformLesson(strapi: StrapiLesson): Lesson {
  return {
    id: strapi.id,
    documentId: strapi.documentId,
    title: strapi.title,
    slug: strapi.slug,
    description: strapi.description || '',
    cloudflareVideoId: strapi.cloudflareVideoId,
    duration: strapi.duration || 0,
    order: strapi.order,
    isFree: strapi.isFree,
    resources: (strapi.resources || []).map((r) => ({
      id: r.id,
      name: r.name,
      url: getStrapiMediaUrl(r),
      mime: r.mime,
    })),
    moduleId: strapi.module?.id || 0,
  };
}

// Transform Strapi Module with Lessons to frontend ModuleWithLessons
function transformModuleWithLessons(strapi: StrapiModule): ModuleWithLessons {
  const lessons = (strapi.lessons || [])
    .map(transformLesson)
    .sort((a, b) => a.order - b.order);

  const totalDuration = lessons.reduce((sum, l) => sum + (l.duration || 0), 0);

  return {
    id: strapi.id,
    documentId: strapi.documentId,
    title: strapi.title,
    description: strapi.description,
    order: strapi.order,
    lessons,
    totalDuration,
    lessonCount: lessons.length,
  };
}

// Default values for missing program data
const DEFAULT_PROGRAM_IMAGE = '/placeholder-course.svg';

// Transform Strapi Program with module relations to ProgramWithLessons
function transformProgramWithLessons(strapi: StrapiProgram): ProgramWithLessons {
  const imageUrl = strapi.image
    ? getStrapiMediaUrl(strapi.image)
    : strapi.imageUrl || DEFAULT_PROGRAM_IMAGE;

  const moduleRelations = (strapi.moduleRelations || [])
    .map(transformModuleWithLessons)
    .sort((a, b) => a.order - b.order);

  const totalLessons = moduleRelations.reduce((sum, m) => sum + m.lessonCount, 0);
  const totalDuration = moduleRelations.reduce((sum, m) => sum + m.totalDuration, 0);

  // Transform legacy modules for backward compatibility
  const legacyModules = (strapi.modules || []).map((m) => ({
    title: m.title,
    description: m.description,
    hours: m.hours,
    units: (m.units || []).map((u) => ({ title: u.title })),
  }));

  return {
    id: strapi.id,
    documentId: strapi.documentId,
    type: strapi.type,
    title: strapi.title,
    slug: strapi.slug,
    duration: strapi.duration,
    ects: strapi.ects,
    tags: strapi.tags || [],
    featured: strapi.featured,
    description: strapi.description,
    longDescription: strapi.longDescription || strapi.description,
    image: imageUrl,
    format: strapi.format || 'Online',
    language: strapi.language || 'Español',
    startDate: strapi.startDate || 'Próximamente',
    certification:
      strapi.certification ||
      (strapi.type === 'Master' ? 'Título Propio Universidad' : 'Certificado de Experto'),
    price: strapi.price || 0,
    originalPrice: strapi.originalPrice || undefined,
    modules: legacyModules.length > 0 ? legacyModules : [],
    audience: strapi.audiences || '',
    careers: strapi.careers || '',
    objectives: strapi.objectives || '',
    topics: (strapi.topics || []).map((t) => ({ id: t.id, documentId: t.documentId, name: t.name })),
    isPro: strapi.isPro,
    moodle: strapi.moodle ?? null,
    moodleCourseId: strapi.moodleCourseId ?? null,
    moduleRelations,
    totalLessons,
    totalDuration,
    stripeProductId: strapi.stripeProductId,
    stripePriceId: strapi.stripePriceId,
  };
}

/**
 * Get a program with all its modules and lessons
 */
export async function getProgramWithLessons(
  id: string,
  draft = false
): Promise<ProgramWithLessons | null> {
  try {
    // Deep populate using bracket notation (Strapi 5 format)
    const queryString = [
      'populate[image]=true',
      'populate[modules][populate][units]=true',
      'populate[topics][fields][0]=name',
      'populate[topics][fields][1]=documentId',
      'populate[moduleRelations][populate][lessons][populate][resources]=true',
    ].join('&');

    const response = await strapiRequest<StrapiSingleResponse<StrapiProgram>>(
      `/api/programs/${id}?${queryString}`,
      {
        revalidate: 60,
        tags: ['programs', `program-${id}`, 'lessons'],
        draft,
      }
    );

    if (!response.data) {
      return null;
    }

    return transformProgramWithLessons(response.data);
  } catch (error) {
    console.error(`Error fetching program with lessons ${id}:`, error);
    return null;
  }
}

/**
 * Get a single lesson by ID
 */
export async function getLessonById(
  id: string,
  draft = false
): Promise<Lesson | null> {
  try {
    const response = await strapiRequest<StrapiSingleResponse<StrapiLesson>>(
      `/api/lessons/${id}?populate=*`,
      {
        revalidate: 60,
        tags: ['lessons', `lesson-${id}`],
        draft,
      }
    );

    if (!response.data) {
      return null;
    }

    return transformLesson(response.data);
  } catch (error) {
    console.error(`Error fetching lesson ${id}:`, error);
    return null;
  }
}

/**
 * Get a lesson by slug
 */
async function getLessonBySlug(
  slug: string,
  draft = false
): Promise<Lesson | null> {
  try {
    const response = await strapiRequest<StrapiResponse<StrapiLesson[]>>(
      `/api/lessons?filters[slug][$eq]=${encodeURIComponent(slug)}&populate=*`,
      {
        revalidate: 60,
        tags: ['lessons', `lesson-slug-${slug}`],
        draft,
      }
    );

    if (!response.data || response.data.length === 0) {
      return null;
    }

    return transformLesson(response.data[0]);
  } catch (error) {
    console.error(`Error fetching lesson by slug ${slug}:`, error);
    return null;
  }
}

/**
 * Get all lessons for a module
 */
async function getLessonsByModule(
  moduleId: number | string,
  draft = false
): Promise<Lesson[]> {
  try {
    const response = await strapiRequest<StrapiResponse<StrapiLesson[]>>(
      `/api/lessons?filters[module][id][$eq]=${moduleId}&populate=*&sort=order:asc`,
      {
        revalidate: 60,
        tags: ['lessons', `module-${moduleId}-lessons`],
        draft,
      }
    );

    return response.data.map(transformLesson);
  } catch (error) {
    console.error(`Error fetching lessons for module ${moduleId}:`, error);
    return [];
  }
}

/**
 * Get the first lesson of a program (for "Start Course" button)
 */
export async function getFirstLessonOfProgram(
  programId: string
): Promise<Lesson | null> {
  try {
    const program = await getProgramWithLessons(programId);

    if (!program || program.moduleRelations.length === 0) {
      return null;
    }

    const firstModule = program.moduleRelations[0];
    if (firstModule.lessons.length === 0) {
      return null;
    }

    return firstModule.lessons[0];
  } catch (error) {
    console.error(`Error fetching first lesson for program ${programId}:`, error);
    return null;
  }
}

/**
 * Get lesson navigation (previous and next lessons)
 */
export interface LessonNavigation {
  previous: Lesson | null;
  next: Lesson | null;
  currentModule: ModuleWithLessons | null;
  currentIndex: number;
  totalLessons: number;
}

export async function getLessonNavigation(
  programId: string,
  lessonId: string
): Promise<LessonNavigation> {
  const program = await getProgramWithLessons(programId);

  if (!program) {
    return {
      previous: null,
      next: null,
      currentModule: null,
      currentIndex: -1,
      totalLessons: 0,
    };
  }

  // Flatten all lessons in order
  const allLessons: { lesson: Lesson; module: ModuleWithLessons }[] = [];
  for (const module of program.moduleRelations) {
    for (const lesson of module.lessons) {
      allLessons.push({ lesson, module });
    }
  }

  // Find current lesson index
  const currentIndex = allLessons.findIndex(
    (item) => item.lesson.documentId === lessonId || item.lesson.id.toString() === lessonId
  );

  if (currentIndex === -1) {
    return {
      previous: null,
      next: null,
      currentModule: null,
      currentIndex: -1,
      totalLessons: allLessons.length,
    };
  }

  return {
    previous: currentIndex > 0 ? allLessons[currentIndex - 1].lesson : null,
    next: currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1].lesson : null,
    currentModule: allLessons[currentIndex].module,
    currentIndex,
    totalLessons: allLessons.length,
  };
}
