import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import { getProgramWithLessons, getLessonById, getLessonNavigation } from '@/lib/strapi/lesson-queries';
import { getCourseAccess } from '@/lib/auth/entitlement';
import LessonPlayerClient from './LessonPlayerClient';

// Per-user gated content: must render dynamically so the server-side
// enrollment check runs on every request and the player HTML is never
// statically cached and served to a non-buyer.
export const dynamic = 'force-dynamic';

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

  // Server-side access gate. Free preview lessons stay open; everything else
  // requires a real enrollment (or Pro for `isPro` courses). A non-entitled
  // visitor is bounced to the course overview, which shows the purchase gate
  // — the lesson content is never sent to their browser.
  if (!lesson.isFree) {
    const { hasAccess } = await getCourseAccess(program.documentId, program.isPro);
    if (!hasAccess) {
      redirect(`/cursos/${programId}`);
    }
  }

  return (
    <LessonPlayerClient
      program={program}
      lesson={lesson}
      navigation={navigation}
    />
  );
}
