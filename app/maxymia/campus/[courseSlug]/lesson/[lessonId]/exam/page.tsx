import { notFound } from 'next/navigation';
import { fetchLesson } from '../../../../../data/queries';
import MaxymiaExamPlayer from './MaxymiaExamPlayer';

interface PageProps {
  params: Promise<{ courseSlug: string; lessonId: string }>;
  searchParams: Promise<{ index?: string }>;
}

export default async function BlockExamPage({ params, searchParams }: PageProps) {
  const { courseSlug, lessonId } = await params;
  const { index } = await searchParams;
  const result = await fetchLesson(courseSlug, lessonId);

  if (!result || result.block.exams.length === 0) notFound();

  const examIndex = Math.max(0, Math.min(result.block.exams.length - 1, parseInt(index ?? '0', 10) || 0));
  const exam = result.block.exams[examIndex];

  return (
    <MaxymiaExamPlayer
      course={result.course}
      block={result.block}
      exam={exam}
      anchorLesson={result.lesson}
    />
  );
}
