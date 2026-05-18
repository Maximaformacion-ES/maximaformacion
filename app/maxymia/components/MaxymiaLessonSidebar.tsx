'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { m, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
  X,
  Menu,
  BookOpen,
  FileQuestion,
} from 'lucide-react';
import type { MaxymiaCourse, MaxymiaTopic, Locale } from '../types';
import { getCourseProgressStats } from '../data/queries';

interface MaxymiaLessonSidebarProps {
  course: MaxymiaCourse;
  currentLessonId: string;
  completedLessons: Set<string>;
  locale: Locale;
  onSelectTopic?: (topic: MaxymiaTopic) => void;
  onSelectLesson?: () => void;
  selectedTopicId?: string | null;
}

export default function MaxymiaLessonSidebar({
  course,
  currentLessonId,
  completedLessons,
  locale,
  onSelectTopic,
  onSelectLesson,
  selectedTopicId,
}: MaxymiaLessonSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const { completed: completedCount, total: totalLessons, percent: progressPercent } =
    getCourseProgressStats(course, completedLessons);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Progress header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/60 text-label-md">
            {completedCount}/{totalLessons} {locale === 'es' ? 'completadas' : 'completed'}
          </span>
          <span className="text-mx-orange text-label-md font-semibold">{progressPercent}%</span>
        </div>
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-mx-orange to-amber-400 rounded-full transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Blocks & Lessons */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {course.blocks.map((block) => (
          <SidebarBlock
            key={block.id}
            block={block}
            courseSlug={course.slug}
            currentLessonId={currentLessonId}
            completedLessons={completedLessons}
            locale={locale}
            onSelectTopic={onSelectTopic}
            onSelectLesson={onSelectLesson}
            selectedTopicId={selectedTopicId}
          />
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-80 min-w-80 flex-shrink-0 border-r border-white/10 bg-white/[0.02] h-full overflow-hidden">
        {sidebarContent}
      </aside>

      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-50 w-12 h-12 bg-mx-orange rounded-full flex items-center justify-center shadow-xl shadow-mx-orange/20"
      >
        <Menu size={20} className="text-white" />
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <m.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-[#0a0d1a] z-50 lg:hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <span className="text-white text-body-sm font-medium">
                  {locale === 'es' ? 'Contenido' : 'Content'}
                </span>
                <button onClick={() => setMobileOpen(false)}>
                  <X size={18} className="text-white/40" />
                </button>
              </div>
              {sidebarContent}
            </m.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Sidebar Block ───────────────────────────────────────────────────

interface SidebarBlockProps {
  block: { id: string; title: Record<Locale, string>; lessons: { id: string; title: Record<Locale, string>; estimatedMinutes: number; topics?: MaxymiaTopic[] }[]; exams: { id: string; title: Record<Locale, string> }[] };
  courseSlug: string;
  currentLessonId: string;
  completedLessons: Set<string>;
  locale: Locale;
  onSelectTopic?: (topic: MaxymiaTopic) => void;
  onSelectLesson?: () => void;
  selectedTopicId?: string | null;
}

function SidebarBlock({ block, courseSlug, currentLessonId, completedLessons, locale, onSelectTopic, onSelectLesson, selectedTopicId }: SidebarBlockProps) {
  const hasCurrentLesson = block.lessons.some((l) => l.id === currentLessonId);
  const [open, setOpen] = useState(hasCurrentLesson);
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(
    () => new Set(hasCurrentLesson ? [currentLessonId] : [])
  );

  const completedInBlock = block.lessons.filter((l) => completedLessons.has(l.id)).length;

  const toggleLesson = (lessonId: string) => {
    setExpandedLessons((prev) => {
      const next = new Set(prev);
      if (next.has(lessonId)) next.delete(lessonId);
      else next.add(lessonId);
      return next;
    });
  };

  return (
    <div className="border-b border-white/5">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.03] transition-colors"
      >
        <div className="flex items-center gap-2 text-left">
          <BookOpen size={14} className="text-white/30 flex-shrink-0" />
          <span className="text-white/70 text-label-md font-medium line-clamp-1">{block.title[locale]}</span>
          <span className="text-white/20 text-label-sm">{completedInBlock}/{block.lessons.length}</span>
        </div>
        {open ? <ChevronUp size={14} className="text-white/30" /> : <ChevronDown size={14} className="text-white/30" />}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <m.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            {block.lessons.map((lesson) => {
              const isCurrent = lesson.id === currentLessonId;
              const isCompleted = completedLessons.has(lesson.id);
              const hasTopics = lesson.topics && lesson.topics.length > 0;
              const isLessonExpanded = expandedLessons.has(lesson.id);

              return (
                <div key={lesson.id}>
                  {/* Lesson row — link to lesson + chevron to expand topics */}
                  <div className={`flex items-center gap-2.5 px-4 pl-8 py-2.5 text-label-md transition-colors ${
                    isCurrent && !selectedTopicId
                      ? 'bg-mx-orange/10 text-mx-orange border-l-2 border-mx-orange'
                      : isCurrent
                      ? 'bg-mx-orange/5 text-mx-orange/70'
                      : 'text-white/50 hover:text-white/80 hover:bg-white/[0.03]'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle size={13} className="text-mx-orange flex-shrink-0" />
                    ) : (
                      <div className={`w-3.5 h-3.5 rounded-full border flex-shrink-0 ${isCurrent ? 'border-mx-orange' : 'border-white/20'}`} />
                    )}
                    <Link
                      href={`/maxymia/campus/${courseSlug}/lesson/${lesson.id}`}
                      onClick={isCurrent && onSelectLesson ? (e) => { e.preventDefault(); onSelectLesson(); } : undefined}
                      className="line-clamp-1 flex-1"
                    >
                      {lesson.title[locale]}
                    </Link>
                    {hasTopics && (
                      <button
                        onClick={() => toggleLesson(lesson.id)}
                        className="flex-shrink-0 p-0.5"
                      >
                        {isLessonExpanded
                          ? <ChevronUp size={12} className="text-white/30" />
                          : <ChevronDown size={12} className="text-white/30" />
                        }
                      </button>
                    )}
                  </div>

                  {/* Topics (third level) — these are the clickable items */}
                  <AnimatePresence initial={false}>
                    {hasTopics && isLessonExpanded && (
                      <m.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        {lesson.topics!.map((topic, topicIdx) => {
                          const isSelected = selectedTopicId === topic.id;
                          return isCurrent && onSelectTopic ? (
                            <button
                              key={topic.id}
                              onClick={() => onSelectTopic(topic)}
                              className={`w-full flex items-center gap-2 pl-14 pr-4 py-1.5 text-label-sm transition-colors text-left ${
                                isSelected
                                  ? 'text-mx-orange font-medium'
                                  : 'text-mx-orange/60 hover:text-mx-orange'
                              }`}
                            >
                              <span className={`text-[10px] flex-shrink-0 ${isSelected ? 'text-mx-orange' : 'text-white/20'}`}>{topicIdx + 1}.</span>
                              <span className="line-clamp-1">{topic.title[locale]}</span>
                            </button>
                          ) : (
                            <Link
                              key={topic.id}
                              href={`/maxymia/campus/${courseSlug}/lesson/${lesson.id}#${topic.anchorId}`}
                              className="flex items-center gap-2 pl-14 pr-4 py-1.5 text-label-sm transition-colors text-white/35 hover:text-white/60"
                            >
                              <span className="text-[10px] text-white/20 flex-shrink-0">{topicIdx + 1}.</span>
                              <span className="line-clamp-1">{topic.title[locale]}</span>
                            </Link>
                          );
                        })}
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
            {block.lessons.length > 0 && block.exams.map((exam, examIdx) => (
              <Link
                key={exam.id}
                href={`/maxymia/campus/${courseSlug}/lesson/${block.lessons[block.lessons.length - 1].id}/exam?index=${examIdx}`}
                className="flex items-center gap-2 px-4 pl-8 py-2.5 text-label-md text-purple-400/70 hover:text-purple-300 hover:bg-white/[0.03] transition-colors"
              >
                <FileQuestion size={11} className="flex-shrink-0" />
                <span className="line-clamp-1">{exam.title[locale]}</span>
              </Link>
            ))}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
