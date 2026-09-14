'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, m } from 'framer-motion';
import { PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import { useUserCampus } from '@/app/hooks/useUserCampus';
import { useLocale } from '../../../../../i18n/LocaleProvider';
import MaxymiaLessonSidebar from '../../../../../components/MaxymiaLessonSidebar';
import ExamContainer from '../../../../../components/exam/ExamContainer';
import type { MaxymiaCourse, MaxymiaBlock, MaxymiaExam, MaxymiaLesson } from '../../../../../types';

interface Props {
  course: MaxymiaCourse;
  block: MaxymiaBlock;
  exam: MaxymiaExam;
  anchorLesson: MaxymiaLesson;
}

export default function MaxymiaExamPlayer({ course, block, exam, anchorLesson }: Props) {
  const { locale } = useLocale();
  const { courseProgress } = useUserCampus();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const completedSet = useMemo(() => {
    const data = courseProgress[course.id];
    return new Set(data?.completedLessons ?? []);
  }, [courseProgress, course.id]);

  const nextLesson = useMemo(() => {
    const idx = course.blocks.findIndex((b) => b.id === block.id);
    if (idx === -1) return null;
    const next = course.blocks[idx + 1];
    if (!next) return null;
    const firstLesson = next.lessons[0];
    if (!firstLesson) return null;
    return {
      lessonTitle: firstLesson.title,
      blockTitle: next.title,
      href: `/maxymia/campus/${course.slug}/lesson/${firstLesson.id}`,
    };
  }, [course, block.id]);

  return (
    <div className="flex h-[calc(100dvh-57px)] overflow-hidden bg-mx-bg text-mx-text">
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <m.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="shrink-0 overflow-hidden"
          >
            <MaxymiaLessonSidebar
              course={course}
              currentLessonId=""
              completedLessons={completedSet}
              locale={locale}
            />
          </m.div>
        )}
      </AnimatePresence>

      <div id="exam-scroll-area" className="flex-1 min-w-0 overflow-y-auto">
        <div className="sticky top-0 z-30 bg-mx-bg/85 backdrop-blur-sm border-b border-mx-border px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="text-mx-text-muted hover:text-mx-orange transition-colors shrink-0"
              title={sidebarOpen ? (locale === 'es' ? 'Ocultar índice' : 'Hide index') : (locale === 'es' ? 'Mostrar índice' : 'Show index')}
            >
              {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
            </button>
            <div className="min-w-0">
              <p className="text-mx-text-muted text-label-sm tracking-widest uppercase truncate">
                {block.title[locale]}
              </p>
              <p className="text-mx-text text-body-sm font-medium truncate">
                {locale === 'es' ? 'Examen del bloque' : 'Block exam'}
              </p>
            </div>
          </div>
          <Link
            href={`/maxymia/campus/${course.slug}/lesson/${anchorLesson.id}`}
            className="flex items-center gap-1.5 text-mx-text-muted hover:text-mx-text text-label-md transition-colors px-3 py-1.5 rounded-lg border border-mx-border hover:border-mx-text-muted flex-shrink-0"
            title={locale === 'es' ? 'Salir del examen' : 'Exit exam'}
          >
            <X size={14} />
            <span className="hidden sm:inline">
              {locale === 'es' ? 'Salir del examen' : 'Exit exam'}
            </span>
          </Link>
        </div>

        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="px-6 md:px-12 lg:px-16 py-10 max-w-4xl mx-auto"
        >
          <ExamContainer
            exam={exam}
            courseId={course.id}
            blockId={block.id}
            locale={locale}
            nextLesson={nextLesson}
            scrollContainerId="exam-scroll-area"
          />
        </m.div>
      </div>
    </div>
  );
}
