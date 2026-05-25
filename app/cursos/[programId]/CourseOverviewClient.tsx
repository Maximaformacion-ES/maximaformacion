'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { m, AnimatePresence } from 'framer-motion';
import {
  Play,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Lock,
  Video,
  PartyPopper,
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useUserCampus } from '@/app/hooks/useUserCampus';
import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';
import { FontStyles } from '@/app/components/FontStyles';
import { ProgramHeroSection } from '@/app/components/ProgramHeroSection';
import { ProgramTabs } from '@/app/components/ProgramTabs';
import { CourseAccessSidebar } from '@/app/components/CourseAccessSidebar';
import CourseAccessGate from '@/app/components/CourseAccessGate';
import type {
  ProgramWithLessons,
  CourseProgress,
  Lesson,
  ModuleWithLessons,
} from '@/lib/strapi/types';
import { formatTotalDuration, formatDuration } from '@/lib/cloudflare/stream';
import { trackViewItem, trackPurchaseOnce } from '@/lib/analytics';
import { getEffectivePrice } from '@/lib/pricing';

// ─── Sub-components (lesson list — only used when internal lessons exist) ────

interface LessonRowProps {
  lesson: Lesson;
  programDocumentId: string;
  isCompleted: boolean;
  canAccess: boolean;
  hasAccess: boolean;
}

function LessonRow({
  lesson,
  programDocumentId,
  isCompleted,
  canAccess,
  hasAccess,
}: LessonRowProps) {
  const isFree = lesson.isFree;

  return (
    <Link
      href={
        canAccess
          ? `/cursos/${programDocumentId}/lesson/${lesson.documentId}`
          : '#'
      }
      className={`block p-4 pl-20 flex items-center justify-between border-b border-mx-border last:border-0 transition-colors ${
        canAccess
          ? 'hover:bg-mx-bg cursor-pointer'
          : 'opacity-50 cursor-not-allowed'
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isCompleted
              ? 'bg-green-100 text-green-600'
              : canAccess
                ? 'bg-mx-border text-mx-text-muted'
                : 'bg-mx-border/60 text-mx-text-muted/60'
          }`}
        >
          {isCompleted ? (
            <CheckCircle size={16} />
          ) : canAccess ? (
            <Video size={16} />
          ) : (
            <Lock size={14} />
          )}
        </div>
        <div>
          <p className="text-mx-text font-medium">
            {lesson.title}
            {isFree && !hasAccess && (
              <span className="ml-2 text-label-md bg-mx-orange/10 text-mx-orange px-2 py-0.5 rounded-full">
                Vista previa
              </span>
            )}
          </p>
          <p className="text-mx-text-muted text-body-sm">
            {formatDuration(lesson.duration)}
          </p>
        </div>
      </div>
      {canAccess && !isCompleted && (
        <Play className="text-mx-text-muted" size={16} />
      )}
    </Link>
  );
}

interface ModuleAccordionProps {
  module: ModuleWithLessons;
  moduleIndex: number;
  isExpanded: boolean;
  onToggle: (index: number) => void;
  completedLessons: Set<string>;
  hasAccess: boolean;
  programDocumentId: string;
  showProgress: boolean;
}

function ModuleAccordion({
  module,
  moduleIndex,
  isExpanded,
  onToggle,
  completedLessons,
  hasAccess,
  programDocumentId,
  showProgress,
}: ModuleAccordionProps) {
  const moduleCompleted = module.lessons.every((l) => completedLessons.has(l.documentId));
  const moduleProgress = module.lessons.filter((l) => completedLessons.has(l.documentId)).length;

  return (
    <m.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: moduleIndex * 0.08 }}
      className="border border-mx-border rounded-xl overflow-hidden bg-white"
    >
      {/* Module Header */}
      <button
        onClick={() => onToggle(moduleIndex)}
        className="w-full p-6 flex items-center justify-between bg-white hover:bg-mx-bg transition-colors"
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              moduleCompleted
                ? 'bg-green-100 text-green-600'
                : 'bg-mx-orange/10 text-mx-orange'
            }`}
          >
            {moduleCompleted ? (
              <CheckCircle size={20} />
            ) : (
              <span className="font-bold">{moduleIndex + 1}</span>
            )}
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-mx-text">{module.title}</h3>
            <p className="text-mx-text-muted text-body-sm">
              {module.lessonCount} lecciones · {formatTotalDuration(module.totalDuration)}
              {showProgress && (
                <span className="ml-2 text-mx-orange">
                  ({moduleProgress}/{module.lessonCount} completadas)
                </span>
              )}
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="text-mx-text-muted" size={24} />
        ) : (
          <ChevronDown className="text-mx-text-muted" size={24} />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="border-t border-mx-border bg-white">
              {module.lessons.map((lesson) => {
                const isCompleted = completedLessons.has(lesson.documentId);
                const canAccess = hasAccess || lesson.isFree;
                return (
                  <LessonRow
                    key={lesson.id}
                    lesson={lesson}
                    programDocumentId={programDocumentId}
                    isCompleted={isCompleted}
                    canAccess={canAccess}
                    hasAccess={hasAccess}
                  />
                );
              })}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </m.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

interface CourseOverviewClientProps {
  program: ProgramWithLessons;
  firstLessonId: string | null;
  showSuccessMessage: boolean;
  checkoutSessionId?: string;
  richHtml: import('@/app/programas/[id]/page').ProgramRichHtml;
}

export default function CourseOverviewClient({
  program,
  firstLessonId,
  showSuccessMessage,
  checkoutSessionId,
  richHtml,
}: CourseOverviewClientProps) {
  const { isSignedIn, isLoaded } = useUser();
  const {
    hasPro,
    hasAccess: checkAccess,
    courseProgress,
    isLoading: campusLoading,
  } = useUserCampus();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set([0]));
  const [successDismissed, setSuccessDismissed] = useState(false);
  const showSuccess = showSuccessMessage && !successDismissed;

  const userHasPro = isSignedIn && hasPro;
  const hasAccess = checkAccess(program.documentId, program.isPro);

  // Course progress
  const progressData = courseProgress[program.documentId];
  const progress: CourseProgress | undefined = progressData
    ? {
        startedAt: progressData.startedAt || new Date().toISOString(),
        lastAccessedAt: progressData.lastAccessedAt || new Date().toISOString(),
        completedLessons: progressData.completedLessons,
        currentLessonId: progressData.currentLessonId || undefined,
        progressPercent: 0,
      }
    : undefined;
  const completedLessons = new Set(progressData?.completedLessons || []);

  // Hide success after 5s
  useEffect(() => {
    if (showSuccessMessage && !successDismissed) {
      const t = setTimeout(() => setSuccessDismissed(true), 5000);
      return () => clearTimeout(t);
    }
  }, [showSuccessMessage, successDismissed]);

  // GA4 view_item
  useEffect(() => {
    if (!program?.slug) return;
    const effective = getEffectivePrice(program, userHasPro);
    trackViewItem({
      item_id: program.slug,
      item_name: program.title,
      item_category: program.type,
      price: effective,
    });
  }, [program, userHasPro]);

  // GA4 purchase
  useEffect(() => {
    if (!showSuccessMessage || !checkoutSessionId || !program?.slug) return;
    const effective = getEffectivePrice(program, userHasPro);
    trackPurchaseOnce(checkoutSessionId, {
      items: [
        {
          item_id: program.slug,
          item_name: program.title,
          item_category: program.type,
          price: effective,
        },
      ],
      value: effective,
    });
  }, [showSuccessMessage, checkoutSessionId, program, userHasPro]);

  const toggleModule = (index: number) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  // If user doesn't have access and the course is Pro, show access gate
  if (isLoaded && !campusLoading && program.isPro && !hasAccess) {
    return (
      <div className="bg-mx-bg min-h-screen text-mx-text overflow-x-hidden">
        <FontStyles />
        <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
        <main className="relative z-10">
          <CourseAccessGate
            program={program}
            isSignedIn={isSignedIn || false}
            userHasPro={userHasPro || false}
          />
        </main>
        <Footer />
      </div>
    );
  }

  // Find current lesson (last accessed or first incomplete)
  const currentLessonId = progress?.currentLessonId || firstLessonId;
  const hasInternalLessons = program.moduleRelations.length > 0;

  return (
    <div className="min-h-screen bg-mx-bg text-mx-text overflow-x-hidden">
      <FontStyles />
      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      <main className="relative z-10">
        {/* Success toast */}
        <AnimatePresence>
          {showSuccess && (
            <m.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3"
            >
              <PartyPopper size={24} />
              <span className="font-medium">¡Compra completada! Ya tienes acceso al curso.</span>
            </m.div>
          )}
        </AnimatePresence>

        {/* Hero (image bg + title + tabs) — same layout as the product page */}
        <ProgramHeroSection
          program={program}
          sidebar={
            <CourseAccessSidebar
              program={program}
              currentLessonId={currentLessonId}
              hasProgress={!!progress}
            />
          }
          tabs={<ProgramTabs program={program} richHtml={richHtml} />}
        />

        {/* Mobile sidebar — desktop already shows it inside the hero */}
        <section className="pb-12 px-6 md:px-12 bg-mx-bg lg:hidden">
          <div className="max-w-[1400px] mx-auto">
            <CourseAccessSidebar
              program={program}
              currentLessonId={currentLessonId}
              hasProgress={!!progress}
            />
          </div>
        </section>

        {/* Module list — only when there are real internal lessons */}
        {hasInternalLessons && (
          <section className="py-16 px-6 md:px-12">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-heading-md font-bold text-mx-text mb-8">Contenido del curso</h2>
              <div className="space-y-4">
                {program.moduleRelations.map((module, moduleIndex) => (
                  <ModuleAccordion
                    key={module.id}
                    module={module}
                    moduleIndex={moduleIndex}
                    isExpanded={expandedModules.has(moduleIndex)}
                    onToggle={toggleModule}
                    completedLessons={completedLessons}
                    hasAccess={hasAccess}
                    programDocumentId={program.documentId}
                    showProgress={!!progress}
                  />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
