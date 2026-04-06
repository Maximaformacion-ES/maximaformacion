'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import {
  BookOpen,
  Clock,
  CheckCircle,
  ChevronDown,
  FileQuestion,
  Play,
  User,
  Monitor,
  Globe,
  GraduationCap,
  Mail,
  Phone,
  ArrowRight,
  Target,
  Users,
  Briefcase,
  Lock,
  Trophy,
  RotateCcw,
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

const LANGUAGE_LABELS: Record<string, Record<Locale, string>> = {
  es: { es: 'Español', en: 'Spanish' },
  en: { es: 'Inglés', en: 'English' },
  bilingual: { es: 'Bilingüe', en: 'Bilingual' },
};

type TabId = 'objectives' | 'audience' | 'careers';

interface Props {
  course: MaxymiaCourse;
}

export default function MaxymiaCourseOverview({ course }: Props) {
  const { locale } = useLocale();
  const { hasPro, hasAccess: checkAccess, courseProgress, isLoading, refetch } = useUserCampus();
  const { totalLessons, totalMinutes, totalExams } = getCourseMeta(course);
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabId>('objectives');

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

  const isFullyCompleted = progressPercent === 100 && totalLessons > 0;

  // Find first incomplete lesson for CTA
  const firstIncompleteLessonId = useMemo(() => {
    for (const block of course.blocks) {
      for (const lesson of block.lessons) {
        if (!completedSet.has(lesson.id)) return lesson.id;
      }
    }
    return course.blocks[0]?.lessons[0]?.id;
  }, [course, completedSet]);

  // Find next lesson (first incomplete after last completed)
  const nextLessonId = useMemo(() => {
    let foundCurrent = false;
    for (const block of course.blocks) {
      for (const lesson of block.lessons) {
        if (!completedSet.has(lesson.id)) {
          if (foundCurrent || completedSet.size === 0) return lesson.id;
          return lesson.id;
        }
        foundCurrent = true;
      }
    }
    return course.blocks[0]?.lessons[0]?.id;
  }, [course, completedSet]);

  const enrolled = !!progress;
  const hasAccess = hasPro || checkAccess(course.id) || enrolled;

  // Show product/detail page if user doesn't have access
  if (!isLoading && !hasAccess) {
    return <MaxymiaCourseDetail course={course} />;
  }

  const tabs: { id: TabId; label: Record<Locale, string>; icon: React.ElementType }[] = [
    { id: 'objectives', label: { es: 'Objetivos', en: 'Objectives' }, icon: Target },
    { id: 'audience', label: { es: 'A quién va dirigido', en: 'Who is this for' }, icon: Users },
    { id: 'careers', label: { es: 'Salidas profesionales', en: 'Career paths' }, icon: Briefcase },
  ];

  return (
    <div>
      {/* ─── Hero Section (two-column) ─────────────────────── */}
      <m.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="relative overflow-hidden"
      >
        {/* Background course image */}
        <div className="absolute inset-0">
          <img
            src={course.image}
            alt=""
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b1018]/95 via-[#0b1018]/85 to-[#0b1018]/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1018] via-[#0b1018]/30 to-transparent" />
        </div>

        <div className="relative px-6 md:px-[128px] py-16">
          <div className="max-w-[1300px] mx-auto flex flex-col lg:flex-row gap-12 items-start">

            {/* ─── Left Column ─── */}
            <div className="flex-1 min-w-0">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="bg-mx-orange text-white text-[10px] tracking-[2px] uppercase font-black px-3 py-1 rounded-full">
                  {course.category.replace('-', ' ')}
                </span>
                <span className="bg-white/10 text-white/70 text-[10px] tracking-[0.5px] uppercase font-medium px-3 py-1 rounded-full">
                  {LEVEL_LABELS[course.level]?.[locale]}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-heading-md md:text-heading-lg lg:text-display-sm font-black text-white tracking-tight leading-tight mb-6 max-w-3xl">
                {course.title[locale]}
              </h1>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-8">
                {course.tags.map((tag) => (
                  <span
                    key={tag}
                    className="backdrop-blur-sm bg-white/10 text-white/60 text-xs px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Description */}
              <p className="text-white/60 text-body-sm md:text-body-md font-light leading-relaxed mb-10 max-w-2xl">
                {course.description[locale]}
              </p>

              {/* Instructor */}
              <div className="flex items-center mb-12">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                  <User size={18} className="text-white/40" />
                </div>
              </div>

              {/* ─── Tabs ─── */}
              <div className="border-b border-white/10 mb-8">
                <div className="flex gap-0 overflow-x-auto no-scrollbar -mb-px">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-3 py-3 text-sm font-medium whitespace-nowrap transition-colors relative shrink-0 ${
                          isActive ? 'text-mx-orange' : 'text-white/40 hover:text-white/60'
                        }`}
                      >
                        <Icon size={16} />
                        {tab.label[locale]}
                        {isActive && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-mx-orange" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tab Content */}
              <div className="max-w-full">
                {activeTab === 'objectives' && (
                  <MarkdownBlock content={course.objectives || (locale === 'es' ? 'Los objetivos de este curso se irán definiendo a medida que avances en el temario.' : 'Course objectives will be defined as you progress through the syllabus.')} />
                )}
                {activeTab === 'audience' && (
                  <MarkdownBlock content={course.audiences || (locale === 'es' ? 'Este curso está dirigido a cualquier persona interesada en esta temática.' : 'This course is aimed at anyone interested in this subject.')} />
                )}
                {activeTab === 'careers' && (
                  <MarkdownBlock content={course.careers || (locale === 'es' ? 'Las salidas profesionales relacionadas con este curso son amplias y diversas.' : 'Career opportunities related to this course are broad and diverse.')} />
                )}
              </div>
            </div>

            {/* ─── Right Column (Sidebar Card) ─── */}
            <div className="w-full lg:w-[403px] shrink-0 lg:sticky lg:top-8">
              <div className="bg-[#171c24] border border-white/15 rounded-[10px] overflow-hidden">
                {/* Card image header */}
                <div className="bg-mx-blue relative flex items-center justify-center py-20 overflow-hidden">
                  <img
                    src={course.image}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-20"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-[#0b1018]/50 blur-[15px] w-full h-[135px]" />
                  </div>
                  <div className="absolute left-2 top-1/2 -translate-y-1/2">
                    <Image src="/iconBlue.svg" alt="" width={48} height={49} />
                  </div>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <Image src="/iconOrange.svg" alt="" width={48} height={49} />
                  </div>
                  <div className="relative px-12 text-center">
                    <p className="text-white text-body-md font-black uppercase tracking-tight leading-tight">
                      {course.title[locale]}
                    </p>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-6 flex flex-col gap-6">
                  {/* Stats grid 2x3 */}
                  <div className="grid grid-cols-2 gap-y-[12px]">
                    <StatItem icon={Monitor} label={locale === 'es' ? 'Modalidad' : 'Modality'} value="Online" />
                    <StatItem icon={Globe} label={locale === 'es' ? 'Idioma' : 'Language'} value={(course.language && LANGUAGE_LABELS[course.language]?.[locale]) || 'Español'} />
                    <StatItem icon={BookOpen} label={locale === 'es' ? 'Lecciones' : 'Lessons'} value={String(totalLessons)} />
                    <StatItem icon={Clock} label={locale === 'es' ? 'Duración' : 'Duration'} value={`${Math.round(totalMinutes / 60)}h ${totalMinutes % 60}min`} />
                    <StatItem icon={FileQuestion} label={locale === 'es' ? 'Exámenes' : 'Exams'} value={String(totalExams)} />
                    <StatItem icon={GraduationCap} label={locale === 'es' ? 'Nivel' : 'Level'} value={(course.level && LEVEL_LABELS[course.level]?.[locale]) || 'Principiante'} />
                  </div>

                  <div className="border-t border-white/10" />

                  {isFullyCompleted ? (
                    <>
                      {/* Completed celebration — chevrons style */}
                      <div className="relative flex items-center justify-center py-6">
                        <Image src="/iconBlue.svg" alt="" width={32} height={33} className="absolute left-0" />
                        <Image src="/iconOrange.svg" alt="" width={32} height={33} className="absolute right-0" />
                        <div className="text-center px-10">
                          <p className="text-mx-orange text-body-lg font-black tracking-[0.2em] uppercase">
                            {locale === 'es' ? 'COMPLETADO' : 'COMPLETED'}
                          </p>
                        </div>
                      </div>

                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full w-full" />
                      </div>

                      {/* Completed badge */}
                      <div className="bg-amber-500/5 border border-amber-500/20 rounded-[10px] px-4 py-3 text-center">
                        <p className="text-amber-400 text-xs font-black">
                          {locale === 'es' ? 'Enhorabuena — Has completado este curso' : 'Congratulations — You completed this course'}
                        </p>
                      </div>

                      {/* Review button */}
                      <Link
                        href={`/maxymia/campus/${course.slug}/lesson/${course.blocks[0]?.lessons[0]?.id}`}
                        className="flex items-center justify-center gap-2 border border-white/10 text-white/80 px-6 py-3.5 rounded-[10px] font-light text-sm hover:border-amber-500/30 hover:text-amber-400 transition-colors"
                      >
                        <RotateCcw size={16} />
                        {locale === 'es' ? 'Repasar curso' : 'Review course'}
                      </Link>
                    </>
                  ) : (
                    <>
                      {/* Progress section */}
                      <div className="flex flex-col gap-3">
                        <p className="text-white/93 text-2xl font-bold">
                          {locale === 'es' ? 'Tu progreso' : 'Your progress'}
                        </p>
                        <p className="text-white/40 text-xs">
                          {completedSet.size} {locale === 'es' ? 'de' : 'of'} {totalLessons} {locale === 'es' ? 'lecciones completadas' : 'lessons completed'}
                        </p>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-mx-orange rounded-full transition-all duration-700"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        <p className="text-mx-orange text-heading-md font-black">
                          {progressPercent}%
                        </p>
                      </div>

                      {/* CTA buttons */}
                      <div className="flex flex-col gap-3">
                        <Link
                          href={`/maxymia/campus/${course.slug}/lesson/${firstIncompleteLessonId}`}
                          className="flex items-center justify-center gap-3 bg-mx-orange text-white px-6 py-4 rounded-[10px] font-medium text-base hover:bg-mx-orange/90 transition-colors"
                        >
                          <Play size={18} fill="currentColor" />
                          {enrolled
                            ? (locale === 'es' ? 'Continuar curso' : 'Continue course')
                            : (locale === 'es' ? 'Comenzar curso' : 'Start course')
                          }
                        </Link>
                        <Link
                          href={`/maxymia/campus/${course.slug}/lesson/${nextLessonId}`}
                          className="flex items-center justify-center gap-2 border border-white/10 text-white/80 px-6 py-3.5 rounded-[10px] font-light text-sm hover:border-white/20 transition-colors"
                        >
                          <ArrowRight size={16} />
                          {locale === 'es' ? 'Ir a la siguiente lección' : 'Go to next lesson'} →
                        </Link>
                      </div>
                    </>
                  )}

                  <div className="border-t border-white/10" />

                  {/* Contact */}
                  <div className="flex flex-col gap-3">
                    <p className="text-white/40 text-[12px] font-black tracking-[1.2px] uppercase">
                      {locale === 'es' ? 'Contacto' : 'Contact'}
                    </p>
                    <a href="mailto:cursos@maximaformacion.es" className="flex items-center gap-3 text-white/40 text-sm hover:text-white/60 transition-colors">
                      <Mail size={14} />
                      cursos@maximaformacion.es
                    </a>
                    <a href="tel:+34635659391" className="flex items-center gap-3 text-white/40 text-sm hover:text-white/60 transition-colors">
                      <Phone size={14} />
                      +34 635 65 93 91
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </m.section>

      {/* ─── Course Content Section ──────────────────────────── */}
      <m.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="pb-32 px-6 md:px-[128px]"
      >
        <div className="max-w-[1024px] mx-auto">
          {/* Section header */}
          <div className="flex flex-col items-center gap-4 mb-10">
            <h2 className="text-white text-heading-md md:text-heading-lg font-bold tracking-tight text-center">
              {locale === 'es' ? 'Contenido del curso' : 'Course content'}
            </h2>
            <p className="text-white/60 text-body-sm md:text-body-md font-light text-center">
              {totalLessons} {locale === 'es' ? 'lecciones' : 'lessons'} · {Math.round(totalMinutes / 60)}h {totalMinutes % 60}min · {course.blocks.length} {locale === 'es' ? 'bloques' : 'blocks'}
            </p>
          </div>

          {/* Stats + progress bar */}
          <div className="mb-10">
            <div className="flex items-center justify-center gap-6 mb-4 text-white/50 text-body-sm">
              <span className="flex items-center gap-1.5">
                <BookOpen size={14} className="text-mx-orange" />
                {totalLessons} {locale === 'es' ? 'lecciones' : 'lessons'}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-mx-orange" />
                {Math.round(totalMinutes / 60)}h {totalMinutes % 60}min
              </span>
              <span className="flex items-center gap-1.5">
                <FileQuestion size={14} className="text-mx-orange" />
                {totalExams} {locale === 'es' ? 'exámenes' : 'exams'}
              </span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-mx-orange rounded-full transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-mx-orange text-sm text-center mt-2">
              {progressPercent}% {locale === 'es' ? 'completado' : 'completed'} · {completedSet.size} {locale === 'es' ? 'de' : 'of'} {totalLessons} {locale === 'es' ? 'lecciones' : 'lessons'}
            </p>
          </div>

          {/* Module cards */}
          <div className="space-y-4 mb-10">
            {course.blocks.map((block, blockIdx) => (
              <ModuleCard
                key={block.id}
                block={block}
                blockIndex={blockIdx}
                courseSlug={course.slug}
                completedSet={completedSet}
                firstIncompleteLessonId={firstIncompleteLessonId}
                locale={locale}
              />
            ))}
          </div>

          {/* Back link */}
          <div className="text-center">
            <Link
              href="/maxymia/campus/cursos"
              className="text-white/50 text-body-sm hover:text-mx-orange transition-colors"
            >
              ← {locale === 'es' ? 'Volver al catálogo de cursos' : 'Back to course catalog'}
            </Link>
          </div>
        </div>
      </m.section>
    </div>
  );
}

// ─── Stat Item ──────────────────────────────────────────────────────

function StatItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="pt-0.5">
        <Icon size={14} className="text-mx-orange" />
      </div>
      <div>
        <p className="text-white/40 text-[10px] tracking-[1px] uppercase font-medium">{label}</p>
        <p className="text-white text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

// ─── Markdown Block (same renderer as product page) ─────────────────

function MarkdownBlock({ content }: { content: string }) {
  const [html, setHtml] = useState('');

  useEffect(() => {
    let cancelled = false;
    if (content) {
      import('@/lib/markdown').then(({ markdownToHtml }) =>
        markdownToHtml(content).then((result) => {
          if (!cancelled) setHtml(result);
        })
      );
    }
    return () => { cancelled = true; };
  }, [content]);

  if (!html) return null;

  return (
    <div
      className="markdown-content text-body-sm sm:text-body-md text-white/60 font-light [&_ul]:space-y-3 sm:[&_ul]:space-y-4 [&_li]:flex [&_li]:items-start [&_li]:gap-3 sm:[&_li]:gap-4 [&_li]:before:content-[''] [&_li]:before:w-1.5 [&_li]:before:h-1.5 [&_li]:before:rounded-full [&_li]:before:bg-mx-orange [&_li]:before:mt-[7px] [&_li]:before:shrink-0 [&_ul]:list-none [&_ul]:pl-0 [&_p]:mb-3 sm:[&_p]:mb-4"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// ─── Module Card (same accordion pattern as product page) ───────────

interface ModuleCardProps {
  block: MaxymiaBlock;
  blockIndex: number;
  courseSlug: string;
  completedSet: Set<string>;
  firstIncompleteLessonId: string | undefined;
  locale: Locale;
}

function ModuleCard({ block, blockIndex, courseSlug, completedSet, firstIncompleteLessonId, locale }: ModuleCardProps) {
  const [expanded, setExpanded] = useState(blockIndex === 0);
  const total = block.lessons.length;
  const completedInBlock = block.lessons.filter((l) => completedSet.has(l.id)).length;
  const blockCompleted = completedInBlock === total && total > 0;
  const blockProgress = total > 0 ? Math.round((completedInBlock / total) * 100) : 0;

  return (
    <div className={`overflow-hidden rounded-lg ${blockCompleted ? 'bg-amber-500/[0.03] border border-amber-500/20' : 'bg-white/[0.03] border border-white/10'}`}>
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full p-5 md:p-6 flex items-center justify-between text-left hover:bg-white/[0.02] duration-200 transition-colors group"
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            {blockCompleted ? (
              <span className="flex items-center gap-1.5 text-amber-400 text-label-md font-bold">
                <CheckCircle size={12} />
                {locale === 'es' ? 'Bloque' : 'Block'} {blockIndex + 1}
              </span>
            ) : (
              <span className="text-mx-orange text-label-md font-bold">
                {locale === 'es' ? 'Bloque' : 'Block'} {blockIndex + 1}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-white/30 text-label-md">
              {completedInBlock}/{total}
            </span>
            <div className="w-12 h-1.5 bg-white/10 rounded-full overflow-hidden hidden sm:block">
              <div
                className={`h-full rounded-full transition-all duration-500 ${blockCompleted ? 'bg-amber-400' : 'bg-mx-orange'}`}
                style={{ width: `${blockProgress}%` }}
              />
            </div>
          </div>
          <h3 className="text-body-md md:text-body-lg font-bold text-white group-hover:text-mx-orange transition-colors duration-300">
            {block.title[locale]}
          </h3>
        </div>
        <m.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="ml-4 shrink-0"
        >
          <ChevronDown size={20} className="text-white/30" />
        </m.div>
      </button>

      <AnimatePresence>
        {expanded && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 md:px-6 pb-5 md:pb-6 pt-3 border-t border-white/10 space-y-2">
              {block.lessons.map((lesson, lessonIndex) => {
                const isCompleted = completedSet.has(lesson.id);
                const isCurrent = lesson.id === firstIncompleteLessonId;

                return (
                  <m.div
                    key={lesson.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: lessonIndex * 0.05 }}
                  >
                    <Link
                      href={`/maxymia/campus/${courseSlug}/lesson/${lesson.id}`}
                      className={`flex items-center justify-between py-2.5 group -mx-3 px-3 rounded-lg ${
                        isCurrent
                          ? 'bg-mx-orange/5'
                          : isCompleted
                          ? 'bg-mx-orange/[0.03]'
                          : 'hover:bg-white/[0.03]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isCompleted ? (
                          <CheckCircle size={14} className="text-mx-orange shrink-0" />
                        ) : isCurrent ? (
                          <Play size={14} className="text-mx-orange shrink-0" fill="currentColor" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-white/15 shrink-0" />
                        )}
                        <span className={`text-body-sm ${
                          isCurrent
                            ? 'text-white font-medium'
                            : isCompleted
                            ? 'text-mx-orange/50 line-through decoration-mx-orange/30'
                            : 'text-white/70 font-light group-hover:text-white/90'
                        }`}>
                          {lesson.title[locale]}
                        </span>
                      </div>
                      <span className={`text-label-md ml-4 shrink-0 ${
                        isCurrent ? 'text-mx-orange' : isCompleted ? 'text-mx-orange/40' : 'text-white/30'
                      }`}>
                        {isCompleted ? '✓' : `${lesson.estimatedMinutes} min`}
                      </span>
                    </Link>
                  </m.div>
                );
              })}
              {block.exam && (
                <div className="flex items-center gap-3 py-3 text-purple-300/70">
                  <FileQuestion size={14} className="shrink-0" />
                  <span className="text-body-sm">{block.exam.title[locale]}</span>
                </div>
              )}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
