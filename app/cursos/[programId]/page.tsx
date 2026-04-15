import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getProgramWithLessons, getFirstLessonOfProgram } from '@/lib/strapi/lesson-queries';
import { getProgramById } from '@/lib/strapi/queries';
import CourseOverviewClient from './CourseOverviewClient';

// ISR: Revalidar cada hora
export const revalidate = 3600;

interface PageProps {
  params: Promise<{ programId: string }>;
  searchParams: Promise<{ success?: string; session_id?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const program = await getProgramById(resolvedParams.programId);

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

  const program = await getProgramWithLessons(programId);

  if (!program) {
    notFound();
  }

  // Get first lesson for "Start Course" button
  let firstLessonId: string | null = null;

  const firstLesson = await getFirstLessonOfProgram(programId);
  if (firstLesson) {
    firstLessonId = firstLesson.documentId;
  } else if (program.moduleRelations.length > 0 && program.moduleRelations[0].lessons.length > 0) {
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
