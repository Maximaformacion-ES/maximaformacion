import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getProgramWithLessons, getLessonById, getLessonNavigation, LessonNavigation } from '@/lib/strapi/lesson-queries';
import { COMPLETE_PROGRAMS } from '@/app/data/programs';
import LessonPlayerClient from './LessonPlayerClient';
import type { ProgramWithLessons, Lesson, ModuleWithLessons } from '@/lib/strapi/types';

interface PageProps {
  params: Promise<{ programId: string; lessonId: string }>;
}

// Convert local program data to ProgramWithLessons format for fallback
function getFallbackProgram(id: string): ProgramWithLessons | null {
  const numericId = parseInt(id, 10);
  const localProgram = COMPLETE_PROGRAMS.find((p) => p.id === numericId);

  if (!localProgram) return null;

  const moduleRelations = localProgram.modules.map((module, moduleIndex) => ({
    id: moduleIndex + 1,
    documentId: `module-${moduleIndex + 1}`,
    title: module.title,
    description: module.description,
    order: moduleIndex + 1,
    lessons: (module.units || []).map((unit, lessonIndex) => ({
      id: moduleIndex * 100 + lessonIndex + 1,
      documentId: `lesson-${moduleIndex + 1}-${lessonIndex + 1}`,
      title: unit.title,
      slug: unit.title.toLowerCase().replace(/\s+/g, '-'),
      description: `Contenido de la lección: ${unit.title}`,
      cloudflareVideoId: null,
      duration: Math.floor(Math.random() * 1800) + 600,
      order: lessonIndex + 1,
      isFree: moduleIndex === 0 && lessonIndex === 0,
      resources: [],
      moduleId: moduleIndex + 1,
    })),
    totalDuration: module.hours * 60,
    lessonCount: (module.units || []).length,
  }));

  const totalLessons = moduleRelations.reduce((sum, m) => sum + m.lessonCount, 0);
  const totalDuration = moduleRelations.reduce((sum, m) => sum + m.totalDuration, 0);

  return {
    ...localProgram,
    documentId: localProgram.id.toString(),
    slug: localProgram.title.toLowerCase().replace(/\s+/g, '-'),
    moduleRelations,
    totalLessons,
    totalDuration,
    stripeProductId: null,
    stripePriceId: null,
  };
}

// Find lesson in fallback program data
function getFallbackLesson(program: ProgramWithLessons, lessonId: string): Lesson | null {
  for (const module of program.moduleRelations) {
    const lesson = module.lessons.find((l) => l.documentId === lessonId);
    if (lesson) return lesson;
  }
  return null;
}

// Get navigation for fallback
function getFallbackNavigation(program: ProgramWithLessons, lessonId: string): LessonNavigation {
  const allLessons: { lesson: Lesson; module: ModuleWithLessons }[] = [];
  for (const module of program.moduleRelations) {
    for (const lesson of module.lessons) {
      allLessons.push({ lesson, module });
    }
  }

  const currentIndex = allLessons.findIndex((item) => item.lesson.documentId === lessonId);

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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  let lesson = await getLessonById(resolvedParams.lessonId);
  let program = await getProgramWithLessons(resolvedParams.programId);

  // Fallback to local data
  if (!program) {
    program = getFallbackProgram(resolvedParams.programId);
  }
  if (program && !lesson) {
    lesson = getFallbackLesson(program, resolvedParams.lessonId);
  }

  if (!lesson || !program) {
    return {
      title: 'Lección no encontrada | Máxima Formación',
    };
  }

  return {
    title: `${lesson.title} | ${program.title} | Campus Máxima`,
    description: lesson.description || program.description,
  };
}

export default async function LessonPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { programId, lessonId } = resolvedParams;

  // Fetch program with all lessons from Strapi
  let program = await getProgramWithLessons(programId);

  // Fallback to local data
  if (!program) {
    console.warn(`Strapi unavailable for course ${programId}, using fallback data`);
    program = getFallbackProgram(programId);
  }

  if (!program) {
    notFound();
  }

  // Fetch current lesson from Strapi
  let lesson = await getLessonById(lessonId);

  // Fallback to local lesson
  if (!lesson) {
    lesson = getFallbackLesson(program, lessonId);
  }

  if (!lesson) {
    notFound();
  }

  // Get navigation data
  let navigation = await getLessonNavigation(programId, lessonId);

  // If Strapi navigation failed, use fallback
  if (navigation.currentIndex === -1) {
    navigation = getFallbackNavigation(program, lessonId);
  }

  return (
    <LessonPlayerClient
      program={program}
      lesson={lesson}
      navigation={navigation}
    />
  );
}
