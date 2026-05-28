import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getProgramWithLessons, getFirstLessonOfProgram } from '@/lib/strapi/lesson-queries';
import { getProgramById } from '@/lib/strapi/queries';
import { markdownToHtml } from '@/lib/markdown';
import type { ProgramRichHtml } from '@/app/programas/[id]/page';
import { getServerUserState } from '@/lib/auth/server-user-state';
import CourseOverviewClient from './CourseOverviewClient';

// Page becomes dynamic per request so we can read auth() and pass the
// access state down — without that, owners of the course briefly see
// the "Comprar" branch before useUserCampus settles. Strapi fetches
// inside getProgramWithLessons keep their own caching so the per-
// request cost stays at one DB round-trip.
export const dynamic = 'force-dynamic';

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

  const [program, initialUserState] = await Promise.all([
    getProgramWithLessons(programId),
    getServerUserState(),
  ]);

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

  const richHtml: ProgramRichHtml = {
    longDescription: program.longDescription ? await markdownToHtml(program.longDescription) : '',
    objectives: program.objectives ? await markdownToHtml(program.objectives) : '',
    audience: program.audience ? await markdownToHtml(program.audience) : '',
    careers: program.careers ? await markdownToHtml(program.careers) : '',
  };

  return (
    <CourseOverviewClient
      program={program}
      firstLessonId={firstLessonId}
      showSuccessMessage={resolvedSearchParams.success === 'true'}
      checkoutSessionId={resolvedSearchParams.session_id}
      richHtml={richHtml}
      initialUserState={initialUserState}
    />
  );
}
