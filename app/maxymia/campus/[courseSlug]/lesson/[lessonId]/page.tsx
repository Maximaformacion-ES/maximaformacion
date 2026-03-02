import { notFound } from 'next/navigation';
import { fetchLesson } from '../../../../data/queries';
import MaxymiaLessonPlayer from './MaxymiaLessonPlayer';

interface PageProps {
  params: Promise<{ courseSlug: string; lessonId: string }>;
}

export default async function LessonPage({ params }: PageProps) {
  const { courseSlug, lessonId } = await params;
  const result = await fetchLesson(courseSlug, lessonId);

  if (!result) notFound();

  return (
    <MaxymiaLessonPlayer
      course={result.course}
      block={result.block}
      lesson={result.lesson}
    />
  );
}
