import { MAXYMIA_COURSES } from './courses';
import {
  getMaxymiaCoursesFromStrapi,
  getMaxymiaCourseBySlugFromStrapi,
} from '@/lib/strapi/maxymia-queries';
import type {
  MaxymiaCourse,
  MaxymiaTopic,
  MaxymiaCourseFilters,
  MaxymiaCategory,
  LessonNavigation,
  Locale,
} from '../types';

/** Minimal lesson shape needed for progress math (full lessons and the leaner
 *  sidebar/overview rows both satisfy it). `uid` falls back to `id` for the
 *  static demo data that predates the durable uids. */
type UnitLesson = { id: string; uid?: string; topics?: MaxymiaTopic[] | null };

// ============ Filter helper ============

function applyFilters(courses: MaxymiaCourse[], filters?: MaxymiaCourseFilters): MaxymiaCourse[] {
  let result = [...courses];

  if (filters?.category) {
    result = result.filter((c) => c.category === filters.category);
  }
  if (filters?.level) {
    result = result.filter((c) => c.level === filters.level);
  }
  if (filters?.language) {
    result = result.filter((c) => c.language === filters.language || c.language === 'bilingual');
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (c) =>
        c.title.es.toLowerCase().includes(q) ||
        c.title.en.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  return result;
}

// ============ Async fetch from Strapi ============

export async function fetchMaxymiaCourses(
  filters?: MaxymiaCourseFilters
): Promise<MaxymiaCourse[]> {
  const courses = await getMaxymiaCoursesFromStrapi();
  return filters ? applyFilters(courses, filters) : courses;
}

export async function fetchMaxymiaCourseBySlug(
  slug: string
): Promise<MaxymiaCourse | null> {
  return await getMaxymiaCourseBySlugFromStrapi(slug);
}

// ============ Sync helpers (operate on loaded data) ============

export function getMaxymiaCourses(filters?: MaxymiaCourseFilters): MaxymiaCourse[] {
  return applyFilters(MAXYMIA_COURSES, filters);
}

export function getMaxymiaCourseBySlug(slug: string): MaxymiaCourse | null {
  return MAXYMIA_COURSES.find((c) => c.slug === slug) ?? null;
}

export function getMaxymiaCourseById(id: string): MaxymiaCourse | null {
  return MAXYMIA_COURSES.find((c) => c.id === id) ?? null;
}

export function getMaxymiaLessonNavigation(
  courseSlug: string,
  lessonId: string
): LessonNavigation | null {
  const course = getMaxymiaCourseBySlug(courseSlug);
  if (!course) return null;

  const allLessons: { blockId: string; lessonId: string; title: typeof course.title; blockTitle: typeof course.title }[] = [];

  for (const block of course.blocks) {
    for (const lesson of block.lessons) {
      allLessons.push({
        blockId: block.id,
        lessonId: lesson.id,
        title: lesson.title,
        blockTitle: block.title,
      });
    }
  }

  const currentIndex = allLessons.findIndex((l) => l.lessonId === lessonId);
  if (currentIndex === -1) return null;

  const current = allLessons[currentIndex];
  const prev = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const next = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  return {
    current: { blockId: current.blockId, lessonId: current.lessonId, title: current.title },
    prev: prev ? { blockId: prev.blockId, lessonId: prev.lessonId, title: prev.title } : null,
    next: next ? { blockId: next.blockId, lessonId: next.lessonId, title: next.title } : null,
    blockTitle: current.blockTitle,
    courseSlug: course.slug,
    courseTitle: course.title,
    totalLessons: allLessons.length,
    currentIndex,
  };
}

export function getMaxymiaCategories(): { id: MaxymiaCategory; label: Record<Locale, string> }[] {
  return [
    { id: 'ia', label: { es: 'Inteligencia Artificial', en: 'Artificial Intelligence' } },
    { id: 'data-science', label: { es: 'Data Science', en: 'Data Science' } },
    { id: 'machine-learning', label: { es: 'Machine Learning', en: 'Machine Learning' } },
    { id: 'nlp', label: { es: 'Procesamiento del Lenguaje', en: 'Language Processing' } },
    { id: 'computer-vision', label: { es: 'Visión por Computador', en: 'Computer Vision' } },
  ];
}

/** Get featured courses in editorial (data) order */
export function getFeaturedCourses(courses: MaxymiaCourse[], limit = 6): MaxymiaCourse[] {
  return courses.slice(0, limit);
}

/** Get the most recently added course */
export function getLatestCourse(courses: MaxymiaCourse[]): MaxymiaCourse | null {
  if (courses.length === 0) return null;
  return [...courses].sort(
    (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
  )[0];
}

/** Get recommended courses based on enrolled course categories, excluding already started ones */
export function getRecommendedCourses(
  courses: MaxymiaCourse[],
  enrolledCourseIds: string[],
  limit = 6
): MaxymiaCourse[] {
  if (enrolledCourseIds.length === 0) {
    // Fallback: return featured courses in editorial order
    return courses.slice(0, limit);
  }

  const enrolledCategories = new Set(
    courses
      .filter((c) => enrolledCourseIds.includes(c.id))
      .map((c) => c.category)
  );

  const recommended = courses.filter(
    (c) => enrolledCategories.has(c.category) && !enrolledCourseIds.includes(c.id)
  );

  if (recommended.length === 0) {
    // Fallback: return courses not enrolled, in editorial order
    return courses
      .filter((c) => !enrolledCourseIds.includes(c.id))
      .slice(0, limit);
  }

  return recommended.slice(0, limit);
}

/** Get recently published courses, sorted newest first */
export function getRecentCourses(courses: MaxymiaCourse[], limit = 10): MaxymiaCourse[] {
  return [...courses]
    .filter((c) => c.createdAt)
    .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
    .slice(0, limit);
}

/**
 * The "units" a lesson is made of for progress: one per topic, or the lesson
 * itself when it has no topics. Progress is tracked per unit (by its durable
 * `uid`), so adding a unit to a lesson correctly re-opens it as incomplete.
 */
export function lessonUnitIds(lesson: UnitLesson): string[] {
  return lesson.topics && lesson.topics.length > 0
    ? lesson.topics.map((t) => t.uid ?? t.id)
    : [lesson.uid ?? lesson.id];
}

/** A lesson is complete only when ALL of its units are completed. */
export function isLessonComplete(
  lesson: UnitLesson,
  completed: Set<string>
): boolean {
  const units = lessonUnitIds(lesson);
  return units.length > 0 && units.every((u) => completed.has(u));
}

/**
 * Compute valid progress stats for a course at UNIT granularity, ignoring
 * orphan completed ids (units deleted or restructured in Strapi). Caps at 100.
 */
export function getCourseProgressStats(
  course: MaxymiaCourse,
  completedUnitIds: Iterable<string> | undefined
) {
  const validIds = new Set<string>();
  for (const block of course.blocks) {
    for (const lesson of block.lessons) {
      for (const u of lessonUnitIds(lesson)) validIds.add(u);
    }
  }
  const seen = new Set<string>();
  if (completedUnitIds) {
    for (const id of completedUnitIds) if (validIds.has(id)) seen.add(id);
  }
  const completed = seen.size;
  const total = validIds.size;
  const percent = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
  return { completed, total, percent, isCompleted: total > 0 && completed >= total };
}

/** Get total lessons and total duration for a course */
export function getCourseMeta(course: MaxymiaCourse) {
  let totalLessons = 0;
  let totalMinutes = 0;
  let totalExams = 0;

  for (const block of course.blocks) {
    totalExams += block.exams.length;
    for (const lesson of block.lessons) {
      totalLessons++;
      totalMinutes += lesson.estimatedMinutes;
    }
  }

  return { totalLessons, totalMinutes, totalExams };
}

/** Get a specific lesson from a course */
export function getLesson(courseSlug: string, lessonId: string) {
  const course = getMaxymiaCourseBySlug(courseSlug);
  if (!course) return null;

  for (const block of course.blocks) {
    const lesson = block.lessons.find((l) => l.id === lessonId);
    if (lesson) return { lesson, block, course };
  }

  return null;
}

/** Async version of getLesson that tries Strapi first */
export async function fetchLesson(courseSlug: string, lessonId: string) {
  const course = await fetchMaxymiaCourseBySlug(courseSlug);
  if (!course) return null;

  for (const block of course.blocks) {
    const lesson = block.lessons.find((l) => l.id === lessonId);
    if (lesson) return { lesson, block, course };
  }

  return null;
}

