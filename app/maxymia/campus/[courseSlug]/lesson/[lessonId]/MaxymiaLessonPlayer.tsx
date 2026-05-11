'use client';

import React, { useMemo, useCallback, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { m, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useUserCampus } from '@/app/hooks/useUserCampus';
import { useLocale } from '../../../../i18n/LocaleProvider';
import LessonContentRenderer from '../../../../components/LessonContentRenderer';
import MaxymiaLessonSidebar from '../../../../components/MaxymiaLessonSidebar';
import type { MaxymiaCourse, MaxymiaBlock, MaxymiaLesson, MaxymiaTopic, LessonNavigation, ContentBlock } from '../../../../types';

// ─── Helpers ──────────────────────────────────────────────────────────

/** Split content blocks evenly among topics */
function distributeBlocks(topics: MaxymiaTopic[], blocks: ContentBlock[]) {
  const n = topics.length;
  if (n === 0) return [];
  const perTopic = Math.floor(blocks.length / n);
  const remainder = blocks.length % n;
  const sections: { topic: MaxymiaTopic; blocks: ContentBlock[] }[] = [];
  let offset = 0;
  for (let i = 0; i < n; i++) {
    const count = perTopic + (i < remainder ? 1 : 0);
    sections.push({ topic: topics[i], blocks: blocks.slice(offset, offset + count) });
    offset += count;
  }
  return sections;
}

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

  const [sidebarOpen, setSidebarOpen] = useState(true);
  // Track which topic is selected (null = lesson index view)
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  // Read hash on mount and on hash change to select topic
  useEffect(() => {
    const readHash = () => {
      const hash = window.location.hash.slice(1);
      if (!hash || !lesson.topics?.length) {
        setSelectedTopicId(null);
        return;
      }
      const match = lesson.topics.find((t) => t.anchorId === hash);
      setSelectedTopicId(match ? match.id : null);
    };
    readHash();
    window.addEventListener('hashchange', readHash);
    return () => window.removeEventListener('hashchange', readHash);
  }, [lesson.topics]);

  // Reset topic when lesson changes
  useEffect(() => {
    if (!window.location.hash) setSelectedTopicId(null);
  }, [lesson.id]);

  const hasTopics = lesson.topics && lesson.topics.length > 0;
  const introBlocks: ContentBlock[] = lesson.intro ? lesson.intro[locale] : [];

  const topicSections = useMemo(
    () => (hasTopics ? distributeBlocks(lesson.topics, lesson.content[locale]) : []),
    [hasTopics, lesson.topics, lesson.content, locale]
  );

  const selectedSection = useMemo(
    () => topicSections.find((s) => s.topic.id === selectedTopicId) ?? null,
    [topicSections, selectedTopicId]
  );

  const completedSet = useMemo(() => {
    const data = courseProgress[course.id];
    const set = new Set(data?.completedLessons ?? []);
    if (markedComplete) set.add(lesson.id);
    return set;
  }, [courseProgress, course.id, lesson.id, markedComplete]);

  const isCompleted = completedSet.has(lesson.id);

  const nextIsExam = useMemo(() => {
    const lastLesson = block.lessons[block.lessons.length - 1];
    return !!block.exam && lastLesson?.id === lesson.id;
  }, [block, lesson.id]);

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
    if (nextIsExam) {
      router.push(`/maxymia/campus/${course.slug}/lesson/${lesson.id}/exam`);
    } else if (nav?.next) {
      router.push(`/maxymia/campus/${course.slug}/lesson/${nav.next.lessonId}`);
    } else {
      router.push(`/maxymia/campus/${course.slug}`);
    }
  }, [nav, nextIsExam, lesson.id, isCompleted, handleMarkComplete, refetch, router, course.slug]);

  const handleSelectTopic = (topic: MaxymiaTopic) => {
    setSelectedTopicId(topic.id);
    window.history.replaceState(null, '', `#${topic.anchorId}`);
    // Scroll main content to top
    document.getElementById('lesson-content-area')?.scrollTo({ top: 0 });
  };

  const handleBackToIndex = () => {
    setSelectedTopicId(null);
    window.history.replaceState(null, '', window.location.pathname);
  };

  return (
    <div className="flex h-[calc(100dvh-57px)] overflow-hidden">
      {/* Sidebar */}
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
              currentLessonId={lesson.id}
              completedLessons={completedSet}
              locale={locale}
              onSelectTopic={handleSelectTopic}
              onSelectLesson={handleBackToIndex}
              selectedTopicId={selectedTopicId}
            />
          </m.div>
        )}
      </AnimatePresence>

      {/* Main content — only this part scrolls */}
      <div id="lesson-content-area" className="flex-1 min-w-0 overflow-y-auto">
        {/* Header bar */}
        <div className="sticky top-0 z-30 bg-[#0b1018]/80 backdrop-blur-sm border-b border-white/5 px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="text-[#6b7280] hover:text-mx-orange transition-colors shrink-0"
              title={sidebarOpen ? (locale === 'es' ? 'Ocultar índice' : 'Hide index') : (locale === 'es' ? 'Mostrar índice' : 'Show index')}
            >
              {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
            </button>
            {selectedTopicId ? (
              <button
                onClick={handleBackToIndex}
                className="text-white/40 hover:text-mx-orange transition-colors shrink-0"
              >
                <ChevronLeft size={18} />
              </button>
            ) : (
              <Link
                href={`/maxymia/campus/${course.slug}`}
                className="text-white/40 hover:text-mx-orange transition-colors shrink-0"
              >
                <ChevronLeft size={18} />
              </Link>
            )}
            <div className="min-w-0">
              <p className="text-white/30 text-label-sm tracking-widest uppercase truncate">
                {block.title[locale]}
              </p>
              <p className="text-white text-body-sm font-medium truncate">
                {selectedSection ? selectedSection.topic.title[locale] : lesson.title[locale]}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {nav && (
              <span className="text-white/30 text-label-md hidden sm:inline">
                {nav.currentIndex + 1}/{nav.totalLessons}
              </span>
            )}
            {nav?.prev && (
              <Link
                href={`/maxymia/campus/${course.slug}/lesson/${nav.prev.lessonId}`}
                title={locale === 'es' ? 'Lección anterior' : 'Previous lesson'}
                aria-label={locale === 'es' ? 'Lección anterior' : 'Previous lesson'}
                className="w-9 h-9 rounded-full flex items-center justify-center border border-white/10 text-white/60 hover:text-mx-orange hover:border-mx-orange/30 active:scale-90 active:bg-mx-orange/10 transition-all duration-150"
              >
                <ChevronLeft size={16} />
              </Link>
            )}
            {nav?.next && (
              <Link
                href={`/maxymia/campus/${course.slug}/lesson/${nav.next.lessonId}`}
                title={locale === 'es' ? 'Siguiente lección' : 'Next lesson'}
                aria-label={locale === 'es' ? 'Siguiente lección' : 'Next lesson'}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-mx-orange/10 border border-mx-orange/30 text-mx-orange hover:bg-mx-orange hover:text-white active:scale-90 active:brightness-110 transition-all duration-150"
              >
                <ChevronRight size={16} />
              </Link>
            )}
          </div>
        </div>

        {/* Content */}
        <m.div
          key={selectedTopicId || 'index'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="px-6 md:px-12 lg:px-16 py-10 max-w-4xl mx-auto"
        >
          {selectedSection ? (
            /* ─── Topic content view ─── */
            <>
              <h1 className="text-white text-heading-md md:text-heading-lg font-bold mb-8">
                {selectedSection.topic.title[locale]}
              </h1>
              <LessonContentRenderer content={selectedSection.blocks} locale={locale} />
            </>
          ) : hasTopics ? (
            /* ─── Lesson index view (title + intro blocks + topic buttons) ─── */
            <>
              <h1 className="text-white text-heading-md md:text-heading-lg font-bold mb-6">
                {lesson.title[locale]}
              </h1>

              {/* Lesson intro (content_es dynamic zone) */}
              {introBlocks.length > 0 && (
                <div className="mb-8">
                  <LessonContentRenderer content={introBlocks} locale={locale} />
                </div>
              )}

              <div className="space-y-3">
                {topicSections.map((section, idx) => (
                  <button
                    key={section.topic.id}
                    onClick={() => handleSelectTopic(section.topic)}
                    className="w-full flex items-center gap-4 px-5 py-4 border border-white/10 rounded-lg hover:border-mx-orange/40 hover:bg-white/[0.02] transition-colors text-left group"
                  >
                    <span className="text-mx-orange text-body-sm font-bold">{idx + 1}.</span>
                    <span className="text-white/80 text-body-sm md:text-body-md xl:text-[16px] 2xl:text-[20px] font-medium group-hover:text-white transition-colors flex-1">
                      {section.topic.title[locale]}
                    </span>
                    <ArrowRight size={16} className="text-white/20 group-hover:text-mx-orange transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </>
          ) : (
            /* ─── No topics — intro + flat content ─── */
            <>
              <h1 className="text-white text-heading-md md:text-heading-lg font-bold mb-6">
                {lesson.title[locale]}
              </h1>
              {introBlocks.length > 0 && (
                <div className="mb-8">
                  <LessonContentRenderer content={introBlocks} locale={locale} />
                </div>
              )}
              {lesson.content[locale].length > 0 && (
                <LessonContentRenderer content={lesson.content[locale]} locale={locale} />
              )}
            </>
          )}

          {/* Navigation */}
          {nav && selectedSection ? (
            /* ─── Topic-level navigation ─── */
            <TopicNavigation
              topicSections={topicSections}
              selectedTopicId={selectedTopicId!}
              onSelectTopic={handleSelectTopic}
              onBackToIndex={handleBackToIndex}
              onNextLesson={handleNext}
              prevLesson={nav.prev}
              courseSlug={course.slug}
              locale={locale}
              nextIsExam={nextIsExam}
            />
          ) : nav && !selectedTopicId ? (
            /* ─── Lesson-level navigation ─── */
            <div className="flex items-center justify-between pt-8 border-t border-white/10 mt-8">
              {nav.prev ? (
                <Link
                  href={`/maxymia/campus/${course.slug}/lesson/${nav.prev.lessonId}`}
                  className="flex items-center gap-2 text-white/50 hover:text-mx-orange active:scale-95 active:opacity-70 transition-all duration-150 text-body-sm"
                >
                  <ArrowLeft size={16} />
                  <span className="hidden sm:inline">{nav.prev.title[locale]}</span>
                  <span className="sm:hidden">{locale === 'es' ? 'Anterior' : 'Previous'}</span>
                </Link>
              ) : (
                <div />
              )}
              {nextIsExam ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 bg-mx-orange text-black px-4 py-2 rounded-lg hover:bg-mx-orange/90 active:scale-95 active:brightness-110 transition-all duration-150 text-body-sm font-medium"
                >
                  <span>{locale === 'es' ? 'Examen del bloque' : 'Block exam'}</span>
                  <ArrowRight size={16} />
                </button>
              ) : nav.next ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 text-white/50 hover:text-mx-orange active:scale-95 active:opacity-70 transition-all duration-150 text-body-sm"
                >
                  <span className="hidden sm:inline">{nav.next.title[locale]}</span>
                  <span className="sm:hidden">{locale === 'es' ? 'Siguiente' : 'Next'}</span>
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className={`flex items-center gap-2 active:scale-95 transition-all duration-150 text-body-sm ${
                    isCompleted
                      ? 'text-green-400 hover:text-green-300'
                      : 'bg-mx-orange text-white px-4 py-2 rounded-lg hover:bg-mx-orange/90 active:brightness-110'
                  }`}
                >
                  {isCompleted
                    ? (locale === 'es' ? '✓ Curso completado' : '✓ Course completed')
                    : (locale === 'es' ? 'Completar curso' : 'Complete course')
                  }
                </button>
              )}
            </div>
          ) : null}
        </m.div>
      </div>
    </div>
  );
}

// ─── Topic Navigation ─────────────────────────────────────────────────

interface TopicNavigationProps {
  topicSections: { topic: MaxymiaTopic; blocks: ContentBlock[] }[];
  selectedTopicId: string;
  onSelectTopic: (topic: MaxymiaTopic) => void;
  onBackToIndex: () => void;
  onNextLesson: () => void;
  prevLesson: { blockId: string; lessonId: string; title: { es: string; en: string } } | null;
  courseSlug: string;
  locale: 'es' | 'en';
  nextIsExam?: boolean;
}

function TopicNavigation({
  topicSections,
  selectedTopicId,
  onSelectTopic,
  onBackToIndex,
  onNextLesson,
  prevLesson,
  courseSlug,
  locale,
  nextIsExam,
}: TopicNavigationProps) {
  const currentIdx = topicSections.findIndex((s) => s.topic.id === selectedTopicId);
  const prevTopic = currentIdx > 0 ? topicSections[currentIdx - 1] : null;
  const nextTopic = currentIdx < topicSections.length - 1 ? topicSections[currentIdx + 1] : null;
  const isFirst = currentIdx === 0;
  const isLast = currentIdx === topicSections.length - 1;

  return (
    <div className="flex items-center justify-between pt-8 border-t border-white/10 mt-8">
      {/* Previous */}
      {prevTopic ? (
        <button
          onClick={() => onSelectTopic(prevTopic.topic)}
          className="flex items-center gap-2 text-white/50 hover:text-mx-orange transition-colors text-body-sm"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">{prevTopic.topic.title[locale]}</span>
          <span className="sm:hidden">{locale === 'es' ? 'Anterior' : 'Previous'}</span>
        </button>
      ) : isFirst && prevLesson ? (
        <Link
          href={`/maxymia/campus/${courseSlug}/lesson/${prevLesson.lessonId}`}
          className="flex items-center gap-2 text-white/50 hover:text-mx-orange transition-colors text-body-sm"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">{prevLesson.title[locale]}</span>
          <span className="sm:hidden">{locale === 'es' ? 'Lección anterior' : 'Previous lesson'}</span>
        </Link>
      ) : isFirst ? (
        <button
          onClick={onBackToIndex}
          className="flex items-center gap-2 text-white/50 hover:text-mx-orange transition-colors text-body-sm"
        >
          <ArrowLeft size={16} />
          <span>{locale === 'es' ? 'Índice de la lección' : 'Lesson index'}</span>
        </button>
      ) : (
        <div />
      )}

      {/* Next */}
      {nextTopic ? (
        <button
          onClick={() => onSelectTopic(nextTopic.topic)}
          className="flex items-center gap-2 text-white/50 hover:text-mx-orange transition-colors text-body-sm"
        >
          <span className="hidden sm:inline">{nextTopic.topic.title[locale]}</span>
          <span className="sm:hidden">{locale === 'es' ? 'Siguiente' : 'Next'}</span>
          <ArrowRight size={16} />
        </button>
      ) : isLast ? (
        <button
          onClick={onNextLesson}
          className="flex items-center gap-2 bg-mx-orange text-black px-4 py-2 rounded-lg hover:bg-mx-orange/90 transition-colors text-body-sm font-medium"
        >
          <span>
            {nextIsExam
              ? (locale === 'es' ? 'Examen del bloque' : 'Block exam')
              : (locale === 'es' ? 'Siguiente lección' : 'Next lesson')}
          </span>
          <ArrowRight size={16} />
        </button>
      ) : (
        <div />
      )}
    </div>
  );
}
