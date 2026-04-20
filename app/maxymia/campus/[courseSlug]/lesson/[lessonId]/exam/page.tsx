import { notFound } from 'next/navigation';
import { fetchLesson } from '../../../../../data/queries';
import MaxymiaExamPlayer from './MaxymiaExamPlayer';

interface PageProps {
  params: Promise<{ courseSlug: string; lessonId: string }>;
}

export default async function BlockExamPage({ params }: PageProps) {
  const { courseSlug, lessonId } = await params;
  const result = await fetchLesson(courseSlug, lessonId);

  if (!result || !result.block.exam) notFound();

  return (
    <MaxymiaExamPlayer
      course={result.course}
      block={result.block}
      exam={result.block.exam}
      anchorLesson={result.lesson}
    />
  );
}
