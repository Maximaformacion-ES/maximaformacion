import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getProgramWithLessons, getFirstLessonOfProgram } from '@/lib/strapi/lesson-queries';
import { getProgramById } from '@/lib/strapi/queries';
import { COMPLETE_PROGRAMS } from '@/app/data/programs';
import CourseOverviewClient from './CourseOverviewClient';
import type { ProgramWithLessons } from '@/lib/strapi/types';

interface PageProps {
  params: Promise<{ programId: string }>;
  searchParams: Promise<{ success?: string; session_id?: string }>;
}

// Convert local program data to ProgramWithLessons format for fallback
function getFallbackProgram(id: string): ProgramWithLessons | null {
  const numericId = parseInt(id, 10);
  const localProgram = COMPLETE_PROGRAMS.find((p) => p.id === numericId);

  if (!localProgram) return null;

  // Create demo lessons from modules for testing without Strapi
  const moduleRelations = localProgram.modules.map((module, moduleIndex) => ({
    id: moduleIndex + 1,
    documentId: `module-${moduleIndex + 1}`,
    title: module.title,
    description: module.description,
    order: moduleIndex + 1,
    lessons: module.topics.map((topic, lessonIndex) => ({
      id: moduleIndex * 100 + lessonIndex + 1,
      documentId: `lesson-${moduleIndex + 1}-${lessonIndex + 1}`,
      title: topic,
      slug: topic.toLowerCase().replace(/\s+/g, '-'),
      description: `Contenido de la lección: ${topic}`,
      cloudflareVideoId: null,
      duration: Math.floor(Math.random() * 1800) + 600, // 10-40 min in seconds
      order: lessonIndex + 1,
      isFree: moduleIndex === 0 && lessonIndex === 0, // First lesson is free preview
      resources: [],
      moduleId: moduleIndex + 1,
    })),
    totalDuration: module.hours * 60, // Convert hours to minutes
    lessonCount: module.topics.length,
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
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  let program = await getProgramById(resolvedParams.programId);

  // Fallback to local data
  if (!program) {
    const fallback = getFallbackProgram(resolvedParams.programId);
    if (fallback) {
      program = fallback;
    }
  }

  if (!program) {
    return {
      title: 'Curso no encontrado | Máxima Formación',
    };
  }

  return {
    title: `${program.title} | Campus Máxima`,
    description: program.description,
  };
}

export default async function CoursePage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const { programId } = resolvedParams;

  // Fetch program with lessons from Strapi
  let program = await getProgramWithLessons(programId);

  // Fallback to local data with generated lessons
  if (!program) {
    console.warn(`Strapi unavailable for course ${programId}, using fallback data`);
    program = getFallbackProgram(programId);
  }

  if (!program) {
    notFound();
  }

  // Get first lesson for "Start Course" button
  let firstLessonId: string | null = null;

  // Try Strapi first
  const firstLesson = await getFirstLessonOfProgram(programId);
  if (firstLesson) {
    firstLessonId = firstLesson.documentId;
  } else if (program.moduleRelations.length > 0 && program.moduleRelations[0].lessons.length > 0) {
    // Fallback to first lesson from our data
    firstLessonId = program.moduleRelations[0].lessons[0].documentId;
  }

  return (
    <CourseOverviewClient
      program={program}
      firstLessonId={firstLessonId}
      showSuccessMessage={resolvedSearchParams.success === 'true'}
    />
  );
}
