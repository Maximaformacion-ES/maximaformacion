'use client';

import React, { useMemo, useCallback, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const { courseProgress, refetch } = useUserCampus();
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
          programId: course.id,
          lessonId: lesson.id,
        }),
      });
      setMarkedComplete(true);
    } catch (err) {
      console.error('Failed to mark lesson complete:', err);
    }
  }, [course.id, lesson.id]);

  const handleNext = useCallback(async () => {
    if (!isCompleted) {
      await handleMarkComplete();
      await refetch();
    }
    if (nav?.next) {
      router.push(`/maxymia/campus/${course.slug}/lesson/${nav.next.lessonId}`);
    } else {
      router.push(`/maxymia/campus/${course.slug}`);
    }
  }, [nav, isCompleted, handleMarkComplete, refetch, router, course.slug]);

  return (
    <div className="flex h-[calc(100vh-2rem)] overflow-hidden">
      {/* Sidebar */}
      <MaxymiaLessonSidebar
        course={course}
        currentLessonId={lesson.id}
        completedLessons={completedSet}
        locale={locale}
      />

      {/* Main content — only this part scrolls */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        {/* Header bar */}
        <div className="sticky top-0 z-30 bg-[#0b1018]/80 backdrop-blur-sm border-b border-white/5 px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={`/maxymia/campus/${course.slug}`}
              className="text-white/40 hover:text-mx-orange transition-colors shrink-0"
            >
              <ChevronLeft size={18} />
            </Link>
            <div className="min-w-0">
              <p className="text-white/30 text-label-sm tracking-widest uppercase truncate">
                {block.title[locale]}
              </p>
              <p className="text-white text-body-sm font-medium truncate">
                {lesson.title[locale]}
              </p>
            </div>
          </div>
          {nav && (
            <span className="text-white/30 text-label-md shrink-0">
              {nav.currentIndex + 1}/{nav.totalLessons}
            </span>
          )}
        </div>

        {/* Lesson content */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="px-6 md:px-12 lg:px-16 py-10 max-w-4xl mx-auto"
        >
          {/* Lesson title */}
          <h1 className="text-white text-heading-md md:text-heading-lg font-bold mb-6">
            {lesson.title[locale]}
          </h1>

          {/* Content */}
          <LessonContentRenderer content={lesson.content[locale]} locale={locale} />

          {/* Navigation */}
          {nav && (
            <div className="flex items-center justify-between pt-8 border-t border-white/10 mt-8">
              {nav.prev ? (
                <Link
                  href={`/maxymia/campus/${course.slug}/lesson/${nav.prev.lessonId}`}
                  className="flex items-center gap-2 text-white/50 hover:text-mx-orange transition-colors text-body-sm"
                >
                  <ArrowLeft size={16} />
                  <span className="hidden sm:inline">{nav.prev.title[locale]}</span>
                  <span className="sm:hidden">{locale === 'es' ? 'Anterior' : 'Previous'}</span>
                </Link>
              ) : (
                <div />
              )}
              {nav.next ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 text-white/50 hover:text-mx-orange transition-colors text-body-sm"
                >
                  <span className="hidden sm:inline">{nav.next.title[locale]}</span>
                  <span className="sm:hidden">{locale === 'es' ? 'Siguiente' : 'Next'}</span>
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className={`flex items-center gap-2 transition-colors text-body-sm ${
                    isCompleted
                      ? 'text-green-400 hover:text-green-300'
                      : 'bg-mx-orange text-white px-4 py-2 rounded-lg hover:bg-mx-orange/90'
                  }`}
                >
                  {isCompleted
                    ? (locale === 'es' ? '✓ Curso completado' : '✓ Course completed')
                    : (locale === 'es' ? 'Completar curso' : 'Complete course')
                  }
                </button>
              )}
            </div>
          )}
        </m.div>
      </div>
    </div>
  );
}
