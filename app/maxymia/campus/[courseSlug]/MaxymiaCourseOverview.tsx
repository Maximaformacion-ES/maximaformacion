'use client';

import React, { useState, useMemo } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  BookOpen,
  Clock,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  FileQuestion,
  Play,
  BarChart3,
  ArrowLeft,
  User,
} from 'lucide-react';
import { useUserCampus } from '@/app/hooks/useUserCampus';
import { useLocale } from '../../i18n/LocaleProvider';
import { getCourseMeta } from '../../data/queries';
import MaxymiaCourseDetail from './MaxymiaCourseDetail';
import type { MaxymiaCourse, MaxymiaBlock, MaxymiaCourseProgress, Locale } from '../../types';

const LEVEL_LABELS: Record<string, Record<Locale, string>> = {
  beginner: { es: 'Principiante', en: 'Beginner' },
  intermediate: { es: 'Intermedio', en: 'Intermediate' },
  advanced: { es: 'Avanzado', en: 'Advanced' },
};

interface Props {
  course: MaxymiaCourse;
}

export default function MaxymiaCourseOverview({ course }: Props) {
  const { locale } = useLocale();
  const { hasPro, hasAccess: checkAccess, courseProgress, isLoading } = useUserCampus();
  const { totalLessons, totalMinutes, totalExams } = getCourseMeta(course);

  // Build progress from courseProgress
  const progress: MaxymiaCourseProgress | null = useMemo(() => {
    const data = courseProgress[course.id];
    if (!data) return null;
    return {
      courseId: course.id,
      completedLessons: data.completedLessons,
      currentLessonId: data.currentLessonId,
      examResults: {},
      startedAt: data.startedAt ?? '',
      lastAccessedAt: data.lastAccessedAt ?? '',
    };
  }, [courseProgress, course.id]);

  const completedSet = useMemo(
    () => new Set(progress?.completedLessons ?? []),
    [progress]
  );

  const progressPercent = totalLessons > 0
    ? Math.round((completedSet.size / totalLessons) * 100)
    : 0;

  // Find first incomplete lesson for CTA
  const firstIncompleteLessonId = useMemo(() => {
    for (const block of course.blocks) {
      for (const lesson of block.lessons) {
        if (!completedSet.has(lesson.id)) return lesson.id;
      }
    }
    return course.blocks[0]?.lessons[0]?.id;
  }, [course, completedSet]);

  const enrolled = !!progress;

  // Check if user has access to this course
  const hasAccess = hasPro || checkAccess(course.id) || enrolled;

  // Show product/detail page if user doesn't have access
  if (!isLoading && !hasAccess) {
    return <MaxymiaCourseDetail course={course} />;
  }

  return (
    <div className="px-6 md:px-12 py-12">
      <div className="max-w-5xl mx-auto">

        {/* ─── Back nav ───────────────────────────────────────── */}
        <Link
          href="/maxymia/campus"
          className="inline-flex items-center gap-2 text-white/40 hover:text-mx-orange text-sm mb-8 transition-colors"
        >
          <ArrowLeft size={14} />
          {locale === 'es' ? 'Volver al campus' : 'Back to campus'}
        </Link>

        {/* ─── Hero ───────────────────────────────────────────── */}
        <m.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-12"
        >
          <div className="flex flex-col lg:flex-row gap-10 items-start">
            {/* Left info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-mx-orange text-xs tracking-[0.3em] uppercase font-medium">
                  {course.category.replace('-', ' ')}
                </span>
                <span className="text-white/20">|</span>
                <span className="text-white/40 text-xs">
                  {LEVEL_LABELS[course.level]?.[locale]}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {course.title[locale]}
              </h1>
              <p className="text-white/50 text-lg mb-6 leading-relaxed">
                {course.description[locale]}
              </p>

              {/* Instructor */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <User size={18} className="text-white/40" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{course.instructor.name}</p>
                  <p className="text-white/40 text-xs">{course.instructor.role}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mb-8">
                <div className="flex items-center gap-2 text-white/60">
                  <BookOpen className="text-mx-orange" size={18} />
                  <span className="text-sm">{totalLessons} {locale === 'es' ? 'lecciones' : 'lessons'}</span>
                </div>
                <div className="flex items-center gap-2 text-white/60">
                  <Clock className="text-mx-orange" size={18} />
                  <span className="text-sm">{Math.round(totalMinutes / 60)}h {totalMinutes % 60}min</span>
                </div>
                <div className="flex items-center gap-2 text-white/60">
                  <FileQuestion className="text-mx-orange" size={18} />
                  <span className="text-sm">{totalExams} {locale === 'es' ? 'exámenes' : 'exams'}</span>
                </div>
                <div className="flex items-center gap-2 text-white/60">
                  <BarChart3 className="text-mx-orange" size={18} />
                  <span className="text-sm">{course.blocks.length} {locale === 'es' ? 'bloques' : 'blocks'}</span>
                </div>
              </div>

              {/* Progress bar (if enrolled) */}
              {enrolled && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/60 text-sm">
                      {completedSet.size}/{totalLessons} {locale === 'es' ? 'completadas' : 'completed'}
                    </span>
                    <span className="text-mx-orange text-sm font-semibold">{progressPercent}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-mx-orange to-amber-400 rounded-full transition-all duration-700"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* CTA */}
              <Link
                href={`/maxymia/campus/${course.slug}/lesson/${firstIncompleteLessonId}`}
                className="inline-flex items-center gap-2 bg-mx-orange text-white px-6 py-3 rounded-lg font-medium hover:bg-mx-orange-dark transition-colors"
              >
                <Play size={18} fill="currentColor" />
                {enrolled
                  ? (locale === 'es' ? 'Continuar curso' : 'Continue course')
                  : (locale === 'es' ? 'Comenzar curso' : 'Start course')
                }
              </Link>
            </div>

            {/* Right: course image placeholder */}
            <div className="w-full lg:w-80 flex-shrink-0">
              <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-mx-orange/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                <BookOpen size={48} className="text-white/20" />
              </div>
              {!enrolled && (
                <div className="mt-4 text-center">
                  <span className="text-white text-2xl font-bold">{course.price}€</span>
                </div>
              )}
            </div>
          </div>
        </m.section>

        {/* ─── Blocks Accordion ────────────────────────────────── */}
        <m.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2 className="text-white text-xl font-semibold mb-6">
            {locale === 'es' ? 'Contenido del curso' : 'Course content'}
          </h2>
          <div className="space-y-3">
            {course.blocks.map((block, i) => (
              <BlockAccordion
                key={block.id}
                block={block}
                courseSlug={course.slug}
                completedSet={completedSet}
                locale={locale}
                defaultOpen={i === 0}
              />
            ))}
          </div>
        </m.section>
      </div>
    </div>
  );
}

// ─── Block Accordion ─────────────────────────────────────────────────

interface BlockAccordionProps {
  block: MaxymiaBlock;
  courseSlug: string;
  completedSet: Set<string>;
  locale: Locale;
  defaultOpen?: boolean;
}

function BlockAccordion({ block, courseSlug, completedSet, locale, defaultOpen = false }: BlockAccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const completedInBlock = block.lessons.filter((l) => completedSet.has(l.id)).length;
  const total = block.lessons.length;

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-5 py-4 bg-white/[0.03] hover:bg-white/[0.05] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-white font-medium text-left">{block.title[locale]}</span>
          <span className="text-white/30 text-xs">
            {completedInBlock}/{total}
          </span>
        </div>
        {open ? (
          <ChevronUp size={18} className="text-white/40" />
        ) : (
          <ChevronDown size={18} className="text-white/40" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="divide-y divide-white/5">
              {block.lessons.map((lesson) => {
                const isCompleted = completedSet.has(lesson.id);
                return (
                  <Link
                    key={lesson.id}
                    href={`/maxymia/campus/${courseSlug}/lesson/${lesson.id}`}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.03] transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      {isCompleted ? (
                        <CheckCircle size={16} className="text-mx-orange flex-shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${isCompleted ? 'text-white/60' : 'text-white/80'} group-hover:text-mx-orange transition-colors`}>
                        {lesson.title[locale]}
                      </span>
                    </div>
                    <span className="text-white/30 text-xs">{lesson.estimatedMinutes} min</span>
                  </Link>
                );
              })}
              {block.exam && (
                <div className="flex items-center gap-3 px-5 py-3.5 text-purple-300/70">
                  <FileQuestion size={16} className="flex-shrink-0" />
                  <span className="text-sm">{block.exam.title[locale]}</span>
                </div>
              )}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
