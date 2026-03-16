'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
import LessonContentRenderer from '../../components/LessonContentRenderer';
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
  const { hasPro, hasAccess: checkAccess, courseProgress, isLoading, refetch } = useUserCampus();
  const { totalLessons, totalMinutes, totalExams } = getCourseMeta(course);
  const searchParams = useSearchParams();

  // Verify purchase after Stripe redirect
  useEffect(() => {
    const success = searchParams.get('success');
    const sessionId = searchParams.get('session_id');
    if (success === 'true' && sessionId) {
      fetch('/api/checkout/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.enrolled) {
            // Remove query params and refetch profile
            window.history.replaceState({}, '', window.location.pathname);
            refetch();
          }
        })
        .catch(console.error);
    }
  }, [searchParams, refetch]);

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
    <div>
      {/* ─── Hero with background image ─────────────────────── */}
      <m.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="relative mb-12 overflow-hidden"
      >
        {/* Background course image */}
        <div className="absolute inset-0">
          <img
            src={course.image}
            alt=""
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1018] via-[#0b1018]/85 to-[#0b1018]/60" />
        </div>

        <div className="relative px-6 md:px-[128px] pt-8 pb-12">
          <div className="max-w-[1800px] mx-auto">
            {/* Back nav */}
            <Link
              href="/maxymia/campus"
              className="inline-flex items-center gap-2 text-white/40 hover:text-mx-orange text-label-md md:text-body-sm 2xl:text-body-md mb-8 transition-colors"
            >
              <ArrowLeft size={14} />
              {locale === 'es' ? 'Volver al campus' : 'Back to campus'}
            </Link>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-mx-orange text-label-sm md:text-label-md tracking-[0.3em] uppercase font-medium">
                {course.category.replace('-', ' ')}
              </span>
              <span className="text-white/20">|</span>
              <span className="text-white/40 text-label-sm md:text-label-md">
                {LEVEL_LABELS[course.level]?.[locale]}
              </span>
            </div>

            <h1 className="text-heading-md md:text-heading-lg lg:text-display-sm font-bold text-white mb-4 max-w-3xl">
              {course.title[locale].toUpperCase()}
            </h1>
            <p className="text-white/60 text-body-sm md:text-body-md 2xl:text-body-lg mb-6 leading-relaxed max-w-2xl">
              {course.description[locale]}
            </p>

            {/* Instructor */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <User size={18} className="text-white/40" />
              </div>
              <div>
                <p className="text-white text-label-md md:text-body-sm 2xl:text-body-md font-medium">{course.instructor.name}</p>
                <p className="text-white/40 text-label-sm md:text-label-md 2xl:text-label-lg">{course.instructor.role}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 mb-8">
              <div className="flex items-center gap-2 text-white/60">
                <BookOpen className="text-mx-orange" size={18} />
                <span className="text-label-md md:text-body-sm 2xl:text-body-md">{totalLessons} {locale === 'es' ? 'lecciones' : 'lessons'}</span>
              </div>
              <div className="flex items-center gap-2 text-white/60">
                <Clock className="text-mx-orange" size={18} />
                <span className="text-label-md md:text-body-sm 2xl:text-body-md">{Math.round(totalMinutes / 60)}h {totalMinutes % 60}min</span>
              </div>
              <div className="flex items-center gap-2 text-white/60">
                <FileQuestion className="text-mx-orange" size={18} />
                <span className="text-label-md md:text-body-sm 2xl:text-body-md">{totalExams} {locale === 'es' ? 'exámenes' : 'exams'}</span>
              </div>
              <div className="flex items-center gap-2 text-white/60">
                <BarChart3 className="text-mx-orange" size={18} />
                <span className="text-label-md md:text-body-sm 2xl:text-body-md">{course.blocks.length} {locale === 'es' ? 'bloques' : 'blocks'}</span>
              </div>
            </div>

            {/* Progress bar (if enrolled) */}
            {enrolled && (
              <div className="mb-8 max-w-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/60 text-label-md md:text-body-sm 2xl:text-body-md">
                    {completedSet.size}/{totalLessons} {locale === 'es' ? 'completadas' : 'completed'}
                  </span>
                  <span className="text-mx-orange text-label-md md:text-body-sm 2xl:text-body-md font-semibold">{progressPercent}%</span>
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
              className="inline-flex items-center gap-2 bg-mx-orange text-white px-5 py-2.5 md:px-6 md:py-3 rounded-lg font-medium hover:bg-mx-orange-dark transition-colors text-body-sm md:text-body-md 2xl:text-body-lg"
            >
              <Play size={18} fill="currentColor" />
              {enrolled
                ? (locale === 'es' ? 'Continuar curso' : 'Continue course')
                : (locale === 'es' ? 'Comenzar curso' : 'Start course')
              }
            </Link>
          </div>
        </div>
      </m.section>

      {/* ─── Course content ──────────────────────────────────── */}
      <div className="px-6 md:px-[128px] pb-12">
        <div className="max-w-[1800px] mx-auto">

        {/* ─── Blocks Accordion ────────────────────────────────── */}
        <m.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2 className="text-white text-heading-sm md:text-heading-md lg:text-heading-lg font-bold mb-8">
            {locale === 'es' ? 'Contenido del curso' : 'Course content'}
          </h2>
          <div className="space-y-6">
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
  const completedInBlock = block.lessons.filter((l) => completedSet.has(l.id)).length;
  const total = block.lessons.length;

  return (
    <div>
      {/* Block title outside the card */}
      <h3 className="text-white font-semibold text-body-md md:text-heading-sm 2xl:text-heading-md mb-3">
        {block.title[locale]}
        <span className="text-white/30 text-label-sm md:text-label-md 2xl:text-label-lg font-normal ml-3">
          {completedInBlock}/{total} {locale === 'es' ? 'lecciones' : 'lessons'}
        </span>
      </h3>

      {/* Block description content */}
      {block.content[locale] && block.content[locale].length > 0 && (
        <div className="mb-4">
          <LessonContentRenderer content={block.content[locale]} locale={locale} />
        </div>
      )}

      {/* Card with lessons → topics (unidades) */}
      <div className="border border-white/10 rounded-xl overflow-hidden">
        {block.lessons.map((lesson, idx) => (
          <LessonAccordion
            key={lesson.id}
            lesson={lesson}
            courseSlug={courseSlug}
            completedSet={completedSet}
            locale={locale}
            index={idx}
            defaultOpen={defaultOpen && idx === 0}
          />
        ))}
        {block.exam && (
          <div className="flex items-center gap-3 px-5 py-3.5 text-purple-300/70 border-t border-white/5">
            <FileQuestion size={16} className="shrink-0" />
            <span className="text-body-sm 2xl:text-body-md">{block.exam.title[locale]}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Lesson Accordion (with topics as "unidades") ───────────────────────

interface LessonAccordionProps {
  lesson: MaxymiaBlock['lessons'][number];
  courseSlug: string;
  completedSet: Set<string>;
  locale: Locale;
  index: number;
  defaultOpen?: boolean;
}

function LessonAccordion({ lesson, courseSlug, completedSet, locale, index, defaultOpen = false }: LessonAccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const isCompleted = completedSet.has(lesson.id);
  const hasTopics = lesson.topics.length > 0;

  return (
    <div className={index > 0 ? 'border-t border-white/5' : ''}>
      {/* Lesson header */}
      <button
        onClick={() => hasTopics && setOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/5 transition-colors ${
          hasTopics ? 'cursor-pointer' : 'cursor-default'
        }`}
      >
        <div className="flex items-center gap-3">
          {isCompleted ? (
            <CheckCircle size={16} className="text-mx-orange shrink-0" />
          ) : (
            <div className="w-4 h-4 rounded-full border border-white/20 shrink-0" />
          )}
          <Link
            href={`/maxymia/campus/${courseSlug}/lesson/${lesson.id}`}
            onClick={(e) => e.stopPropagation()}
            className={`text-body-sm md:text-body-md 2xl:text-body-lg font-medium ${isCompleted ? 'text-white/60' : 'text-white/80'} hover:text-mx-orange transition-colors text-left`}
          >
            {lesson.title[locale]}
          </Link>
          {hasTopics && (
            open ? <ChevronUp size={14} className="text-white/30" /> : <ChevronDown size={14} className="text-white/30" />
          )}
        </div>
        <span className="text-white/30 text-label-sm md:text-label-md 2xl:text-label-lg">{lesson.estimatedMinutes} min</span>
      </button>

      {/* Topics (unidades) */}
      <AnimatePresence initial={false}>
        {open && hasTopics && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pl-12 pr-5 pb-3 space-y-1">
              {lesson.topics.map((topic, tIdx) => (
                <Link
                  key={topic.id}
                  href={`/maxymia/campus/${courseSlug}/lesson/${lesson.id}#${topic.anchorId}`}
                  className="flex items-center gap-2 py-1.5 text-white/50 hover:text-mx-orange transition-colors group"
                >
                  <span className="text-label-md md:text-body-sm 2xl:text-body-md text-white/25 group-hover:text-mx-orange/50">{tIdx + 1}.</span>
                  <span className="text-label-md md:text-body-sm 2xl:text-body-md">{topic.title[locale]}</span>
                </Link>
              ))}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
