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
import type { MaxymiaCourse, Locale } from '../types';

interface MaxymiaLessonSidebarProps {
  course: MaxymiaCourse;
  currentLessonId: string;
  completedLessons: Set<string>;
  locale: Locale;
}

export default function MaxymiaLessonSidebar({
  course,
  currentLessonId,
  completedLessons,
  locale,
}: MaxymiaLessonSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const totalLessons = course.blocks.reduce((sum, b) => sum + b.lessons.length, 0);
  const progressPercent = totalLessons > 0
    ? Math.round((completedLessons.size / totalLessons) * 100)
    : 0;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Progress header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/60 text-xs">
            {completedLessons.size}/{totalLessons} {locale === 'es' ? 'completadas' : 'completed'}
          </span>
          <span className="text-mx-orange text-xs font-semibold">{progressPercent}%</span>
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
          />
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-80 flex-shrink-0 border-r border-white/10 bg-white/[0.02] h-[calc(100vh-2rem)] sticky top-8 overflow-hidden">
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
                <span className="text-white text-sm font-medium">
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
  block: { id: string; title: Record<Locale, string>; lessons: { id: string; title: Record<Locale, string>; estimatedMinutes: number }[]; exam?: { id: string } | null };
  courseSlug: string;
  currentLessonId: string;
  completedLessons: Set<string>;
  locale: Locale;
}

function SidebarBlock({ block, courseSlug, currentLessonId, completedLessons, locale }: SidebarBlockProps) {
  const hasCurrentLesson = block.lessons.some((l) => l.id === currentLessonId);
  const [open, setOpen] = useState(hasCurrentLesson);

  const completedInBlock = block.lessons.filter((l) => completedLessons.has(l.id)).length;

  return (
    <div className="border-b border-white/5">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.03] transition-colors"
      >
        <div className="flex items-center gap-2 text-left">
          <BookOpen size={14} className="text-white/30 flex-shrink-0" />
          <span className="text-white/70 text-xs font-medium line-clamp-1">{block.title[locale]}</span>
          <span className="text-white/20 text-[10px]">{completedInBlock}/{block.lessons.length}</span>
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

              return (
                <Link
                  key={lesson.id}
                  href={`/maxymia/campus/${courseSlug}/lesson/${lesson.id}`}
                  className={`flex items-center gap-2.5 px-4 pl-8 py-2.5 text-xs transition-colors ${
                    isCurrent
                      ? 'bg-mx-orange/10 text-mx-orange border-l-2 border-mx-orange'
                      : 'text-white/50 hover:text-white/80 hover:bg-white/[0.03]'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle size={13} className="text-mx-orange flex-shrink-0" />
                  ) : (
                    <div className={`w-3.5 h-3.5 rounded-full border flex-shrink-0 ${isCurrent ? 'border-mx-orange' : 'border-white/20'}`} />
                  )}
                  <span className="line-clamp-1 flex-1">{lesson.title[locale]}</span>
                </Link>
              );
            })}
            {block.exam && (
              <div className="flex items-center gap-2 px-4 pl-8 py-2.5 text-xs text-purple-400/70">
                <FileQuestion size={11} className="flex-shrink-0" />
                <span className="line-clamp-1">{locale === 'es' ? 'Examen del bloque' : 'Block exam'}</span>
              </div>
            )}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
