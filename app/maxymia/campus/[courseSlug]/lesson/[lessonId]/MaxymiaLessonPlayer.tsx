'use client';

import React, { useMemo, useCallback, useState } from 'react';
import Link from 'next/link';
import { m } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  ChevronLeft,
} from 'lucide-react';
import { useUserCampus } from '@/app/hooks/useUserCampus';
import { useLocale } from '../../../../i18n/LocaleProvider';
import LessonContentRenderer from '../../../../components/LessonContentRenderer';
import MaxymiaLessonSidebar from '../../../../components/MaxymiaLessonSidebar';
import type { MaxymiaCourse, MaxymiaBlock, MaxymiaLesson, LessonNavigation } from '../../../../types';

interface Props {
  course: MaxymiaCourse;
  block: MaxymiaBlock;
  lesson: MaxymiaLesson;
}

export default function MaxymiaLessonPlayer({ course, block, lesson }: Props) {
  const { locale } = useLocale();
  const { courseProgress } = useUserCampus();
  const [markedComplete, setMarkedComplete] = useState(false);

  const completedSet = useMemo(() => {
    const data = courseProgress[course.id];
    const set = new Set(data?.completedLessons ?? []);
    if (markedComplete) set.add(lesson.id);
    return set;
  }, [courseProgress, course.id, lesson.id, markedComplete]);

  const isCompleted = completedSet.has(lesson.id);

  const nav = useMemo((): LessonNavigation | null => {
    const allLessons: { blockId: string; lessonId: string; title: typeof course.title; blockTitle: typeof course.title }[] = [];
    for (const b of course.blocks) {
      for (const l of b.lessons) {
        allLessons.push({ blockId: b.id, lessonId: l.id, title: l.title, blockTitle: b.title });
      }
    }
    const currentIndex = allLessons.findIndex((l) => l.lessonId === lesson.id);
    if (currentIndex === -1) return null;
    const current = allLessons[currentIndex];
    const prev = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
    const next = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
    return {
      current: { blockId: current.blockId, lessonId: current.lessonId, title: current.title },
      prev: prev ? { blockId: prev.blockId, lessonId: prev.lessonId, title: prev.title } : null,
      next: next ? { blockId: next.blockId, lessonId: next.lessonId, title: next.title } : null,
      blockTitle: current.blockTitle,
      courseSlug: course.slug,
      courseTitle: course.title,
      totalLessons: allLessons.length,
      currentIndex,
    };
  }, [course, lesson.id]);

  const handleMarkComplete = useCallback(async () => {
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete',
          programDocumentId: course.id,
          lessonDocumentId: lesson.id,
        }),
      });
      setMarkedComplete(true);
    } catch (err) {
      console.error('Failed to mark lesson complete:', err);
    }
  }, [course.id, lesson.id]);

  return (
    <div className="flex min-h-[calc(100vh-2rem)]">
      {/* Sidebar */}
      <MaxymiaLessonSidebar
        course={course}
        currentLessonId={lesson.id}
        completedLessons={completedSet}
        locale={locale}
      />

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Header bar */}
        <div className="sticky top-8 z-30 bg-[#0b1018]/80 backdrop-blur-sm border-b border-white/5 px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={`/maxymia/campus/${course.slug}`}
              className="text-white/40 hover:text-mx-orange transition-colors flex-shrink-0"
            >
              <ChevronLeft size={18} />
            </Link>
            <div className="min-w-0">
              <p className="text-white/30 text-[10px] tracking-widest uppercase truncate">
                {course.title[locale]}
              </p>
              <p className="text-white text-sm font-medium truncate">
                {lesson.title[locale]}
              </p>
            </div>
          </div>
          {nav && (
            <span className="text-white/30 text-xs flex-shrink-0">
              {nav.currentIndex + 1}/{nav.totalLessons}
            </span>
          )}
        </div>

        {/* Lesson content */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="px-6 md:px-12 lg:px-16 py-10 max-w-4xl"
        >
          {/* Block breadcrumb */}
          <p className="text-mx-orange text-xs tracking-[0.2em] uppercase mb-6">
            {block.title[locale]}
          </p>

          {/* Content */}
          <LessonContentRenderer content={lesson.content[locale]} locale={locale} />

          {/* Mark as complete */}
          <div className="mt-16 mb-8 flex items-center gap-4">
            {isCompleted ? (
              <div className="flex items-center gap-2 text-mx-orange">
                <CheckCircle size={20} />
                <span className="text-sm font-medium">
                  {locale === 'es' ? 'Lección completada' : 'Lesson completed'}
                </span>
              </div>
            ) : (
              <button
                onClick={handleMarkComplete}
                className="flex items-center gap-2 bg-mx-orange text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-mx-orange-dark transition-colors"
              >
                <CheckCircle size={16} />
                {locale === 'es' ? 'Marcar como completada' : 'Mark as completed'}
              </button>
            )}
          </div>

          {/* Navigation */}
          {nav && (
            <div className="flex items-center justify-between pt-8 border-t border-white/10">
              {nav.prev ? (
                <Link
                  href={`/maxymia/campus/${course.slug}/lesson/${nav.prev.lessonId}`}
                  className="flex items-center gap-2 text-white/50 hover:text-mx-orange transition-colors text-sm"
                >
                  <ArrowLeft size={16} />
                  <span className="hidden sm:inline">{nav.prev.title[locale]}</span>
                  <span className="sm:hidden">{locale === 'es' ? 'Anterior' : 'Previous'}</span>
                </Link>
              ) : (
                <div />
              )}
              {nav.next ? (
                <Link
                  href={`/maxymia/campus/${course.slug}/lesson/${nav.next.lessonId}`}
                  className="flex items-center gap-2 text-white/50 hover:text-mx-orange transition-colors text-sm"
                >
                  <span className="hidden sm:inline">{nav.next.title[locale]}</span>
                  <span className="sm:hidden">{locale === 'es' ? 'Siguiente' : 'Next'}</span>
                  <ArrowRight size={16} />
                </Link>
              ) : (
                <div />
              )}
            </div>
          )}
        </m.div>
      </div>
    </div>
  );
}
