import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getProgramWithLessons, getLessonById, getLessonNavigation } from '@/lib/strapi/lesson-queries';
import LessonPlayerClient from './LessonPlayerClient';

// ISR: Revalidar cada hora
export const revalidate = 3600;

interface PageProps {
  params: Promise<{ programId: string; lessonId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const [lesson, program] = await Promise.all([
    getLessonById(resolvedParams.lessonId),
    getProgramWithLessons(resolvedParams.programId),
  ]);

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

  const [program, lesson, navigation] = await Promise.all([
    getProgramWithLessons(programId),
    getLessonById(lessonId),
    getLessonNavigation(programId, lessonId),
  ]);

  if (!program || !lesson) {
    notFound();
  }

  return (
    <LessonPlayerClient
      program={program}
      lesson={lesson}
      navigation={navigation}
    />
  );
}
