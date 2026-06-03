import { notFound, redirect } from 'next/navigation';
import { fetchLesson } from '../../../../data/queries';
import { getCourseAccess } from '@/lib/auth/entitlement';
import MaxymiaLessonPlayer from './MaxymiaLessonPlayer';

interface PageProps {
  params: Promise<{ courseSlug: string; lessonId: string }>;
}

export default async function LessonPage({ params }: PageProps) {
  const { courseSlug, lessonId } = await params;
  const result = await fetchLesson(courseSlug, lessonId);

  if (!result) notFound();

  // Server-side access gate. The campus layout only requires the visitor to
  // be signed in — it does NOT verify they bought *this* course, so without
  // this any logged-in user could open any lesson by URL. Bounce a
  // non-entitled visitor to the course page (which shows the purchase view)
  // before the player content is ever sent. Enrollment is keyed by course id.
  const { hasAccess } = await getCourseAccess(result.course.id, result.course.isPro);
  if (!hasAccess) {
    redirect(`/maxymia/campus/${courseSlug}`);
  }

  return (
    <MaxymiaLessonPlayer
      course={result.course}
      block={result.block}
      lesson={result.lesson}
    />
  );
}
