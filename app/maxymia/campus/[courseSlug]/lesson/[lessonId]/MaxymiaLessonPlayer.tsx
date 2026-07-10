'use client';

import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { m, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useUserCampus } from '@/app/hooks/useUserCampus';
import { useLocale } from '../../../../i18n/LocaleProvider';
import LessonContentRenderer from '../../../../components/LessonContentRenderer';
import MaxymiaLessonSidebar from '../../../../components/MaxymiaLessonSidebar';
import { isLessonComplete } from '../../../../data/queries';
import type { MaxymiaCourse, MaxymiaBlock, MaxymiaLesson, MaxymiaTopic, LessonNavigation, ContentBlock, Locale } from '../../../../types';

// ─── Helpers ──────────────────────────────────────────────────────────

/**
 * Each topic carries its own content blocks (per H3 section in the source doc).
 * We render exactly those — NOT an even split of the lesson's flat content,
 * which used to mis-assign blocks and bleed content into the previous topic.
 */
function topicSectionsFor(topics: MaxymiaTopic[], locale: Locale) {
  return topics.map((topic) => ({ topic, blocks: topic.content[locale] }));
}

interface Props {
  course: MaxymiaCourse;
  block: MaxymiaBlock;
  lesson: MaxymiaLesson;
  /** Por unidad (uid): cambio NO leído desde el changelog ("nuevo"/"actualizado"). */
  updatedUnits?: Record<string, { type: 'new' | 'updated'; ids: string[] }>;
}

export default function MaxymiaLessonPlayer({ course, block: initialBlock, lesson: initialLesson, updatedUnits = {} }: Props) {
  const { locale } = useLocale();
  const router = useRouter();
  const { courseProgress, refetch } = useUserCampus();
  // Optimistic set of unit uids marked complete locally this session (before the
  // server refetch lands). Progress is tracked per unit, not per lesson.
  const [localUnits, setLocalUnits] = useState<string[]>([]);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  // Track which topic is selected (null = lesson index view)
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  // ─── Navegación de lección EN CLIENTE ────────────────────────────────
  // El player ya recibe el curso COMPLETO (todas las lecciones y su contenido),
  // así que moverse entre lecciones no necesita una ida al servidor — igual que
  // ya pasa con los temas. Guardamos la lección actual y derivamos su bloque/
  // lección desde `course`; la URL se mantiene con history.pushState (deep-links
  // y botón atrás/adelante). Resultado: cambiar de lección es instantáneo, sin
  // skeleton ni re-fetch.
  const [currentLessonId, setCurrentLessonId] = useState(initialLesson.id);
  // Derivación directa (el React Compiler la memoiza): los objetos vienen de
  // `course`, estable, así que su referencia solo cambia cuando cambia la lección.
  let block = initialBlock;
  let lesson = initialLesson;
  for (const b of course.blocks) {
    const found = b.lessons.find((x) => x.id === currentLessonId);
    if (found) {
      block = b;
      lesson = found;
      break;
    }
  }

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

  // Botón atrás/adelante: la URL la manejamos con pushState, así que al navegar
  // por el historial sincronizamos la lección desde el path (client-side, sin
  // re-fetch). Si el id no está en el curso, dejamos que el router haga su nav.
  useEffect(() => {
    const onPop = () => {
      const match = window.location.pathname.match(/\/lesson\/([^/]+)/);
      const id = match ? decodeURIComponent(match[1]) : null;
      if (!id) return;
      const exists = course.blocks.some((b) => b.lessons.some((l) => l.id === id));
      if (exists) setCurrentLessonId(id);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [course]);

  const hasTopics = lesson.topics && lesson.topics.length > 0;
  const introBlocks: ContentBlock[] = lesson.intro ? lesson.intro[locale] : [];

  const topicSections = useMemo(
    () => (hasTopics ? topicSectionsFor(lesson.topics, locale) : []),
    [hasTopics, lesson.topics, locale]
  );

  const selectedSection = useMemo(
    () => topicSections.find((s) => s.topic.id === selectedTopicId) ?? null,
    [topicSections, selectedTopicId]
  );

  const completedSet = useMemo(() => {
    const data = courseProgress[course.id];
    const set = new Set(data?.completedLessons ?? []);
    for (const u of localUnits) set.add(u);
    return set;
  }, [courseProgress, course.id, localUnits]);

  // The lesson's ✓ is now DERIVED: complete only when all its units are done.
  const isCompleted = isLessonComplete(lesson, completedSet);

  // The unit the user is currently on: the selected topic, or the lesson itself
  // when it has no topics. On the lesson index (topics not yet opened) there is
  // nothing to mark.
  const currentUnitUid = useMemo(() => {
    if (selectedTopicId) {
      const t = lesson.topics.find((t) => t.id === selectedTopicId);
      return t ? (t.uid || t.id) : null;
    }
    return hasTopics ? null : (lesson.uid || lesson.id);
  }, [selectedTopicId, hasTopics, lesson]);

  // Avisos "Contenido nuevo/actualizado" por unidad (changelog). El aviso se limpia
  // cuando el alumno COMPLETA la unidad (re-hace el contenido nuevo/actualizado),
  // no solo al verla. Las unidades "actualizadas" llegan ya des-completadas desde
  // el servidor, así que el alumno debe repasarlas y volver a completarlas.
  const [updates, setUpdates] = useState(updatedUnits);
  const updatesRef = useRef(updatedUnits);
  const markUnitRead = useCallback((uid: string | null) => {
    if (!uid) return;
    const u = updatesRef.current[uid];
    if (!u) return;
    const next = { ...updatesRef.current };
    delete next[uid];
    updatesRef.current = next;
    setUpdates(next);
    fetch('/api/maxymia/updates/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: u.ids }),
    }).catch(() => {});
  }, []);

  const nextIsExam = useMemo(() => {
    const lastLesson = block.lessons[block.lessons.length - 1];
    return block.exams.length > 0 && lastLesson?.id === lesson.id;
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

  const markUnitComplete = useCallback(async (uid: string) => {
    if (!uid) return;
    setLocalUnits((prev) => (prev.includes(uid) ? prev : [...prev, uid]));
    // Al completar, limpiamos el aviso "nuevo/actualizado" de esta unidad.
    markUnitRead(uid);
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete',
          programId: course.id,
          lessonId: uid,
        }),
      });
    } catch (err) {
      console.error('Failed to mark unit complete:', err);
    }
  }, [course.id, markUnitRead]);

  // Cambia de lección (o de tema dentro de una lección) EN CLIENTE. Misma lección
  // → replaceState (no ensuciar el historial con cada tema). Otra lección →
  // pushState (para que el botón atrás vuelva a la anterior). El contenido se pinta
  // desde `course`, ya cargado, así que es instantáneo.
  const navigateToLesson = useCallback((lessonId: string, topic?: MaxymiaTopic) => {
    const hash = topic ? `#${topic.anchorId}` : '';
    const url = `/maxymia/campus/${course.slug}/lesson/${lessonId}${hash}`;
    if (lessonId === currentLessonId) {
      window.history.replaceState(null, '', url);
    } else {
      setCurrentLessonId(lessonId);
      window.history.pushState(null, '', url);
    }
    setSelectedTopicId(topic ? topic.id : null);
    document.getElementById('lesson-content-area')?.scrollTo({ top: 0 });
  }, [currentLessonId, course.slug]);

  const handleAdvanceLesson = useCallback(() => {
    // Marca la unidad actual como completada en SEGUNDO PLANO. `markUnitComplete`
    // ya hace el update optimista síncrono (el ✓ aparece al instante), así que NO
    // bloqueamos la navegación esperando la red — eso era lo que hacía lento el
    // botón "Siguiente" frente al clic directo (que no marca progreso).
    if (currentUnitUid) {
      void (async () => {
        await markUnitComplete(currentUnitUid);
        await refetch();
      })();
    }
    if (nextIsExam) {
      // El examen es una ruta/página aparte del servidor → navegación real.
      router.push(`/maxymia/campus/${course.slug}/lesson/${lesson.id}/exam?index=0`);
    } else if (nav?.next) {
      navigateToLesson(nav.next.lessonId);
    } else {
      router.push(`/maxymia/campus/${course.slug}`);
    }
  }, [nav, nextIsExam, lesson.id, currentUnitUid, markUnitComplete, refetch, router, course.slug, navigateToLesson]);

  const handleSelectTopic = useCallback((topic: MaxymiaTopic) => {
    setSelectedTopicId(topic.id);
    window.history.replaceState(null, '', `#${topic.anchorId}`);
    document.getElementById('lesson-content-area')?.scrollTo({ top: 0 });
  }, []);

  const handleBackToIndex = () => {
    setSelectedTopicId(null);
    window.history.replaceState(null, '', window.location.pathname);
  };

  // Advancing to the next topic counts the CURRENT topic as completed.
  const handleAdvanceToTopic = useCallback((next: MaxymiaTopic) => {
    // Progreso en segundo plano (optimista); navegamos al tema de inmediato.
    if (currentUnitUid) void markUnitComplete(currentUnitUid);
    handleSelectTopic(next);
  }, [currentUnitUid, markUnitComplete, handleSelectTopic]);

  // Advances through topics within the lesson before jumping to the next lesson.
  // On the lesson index view with topics, "Next" opens the first topic; on a
  // topic, it walks to the next one; on the last topic (or when the lesson has
  // no topics), it marks the lesson complete and advances to the next lesson/exam.
  const handleNextStep = useCallback(async () => {
    if (selectedTopicId) {
      const idx = topicSections.findIndex((s) => s.topic.id === selectedTopicId);
      const nextTopic = idx >= 0 ? topicSections[idx + 1] : null;
      if (nextTopic) {
        await handleAdvanceToTopic(nextTopic.topic);
        return;
      }
      await handleAdvanceLesson();
      return;
    }
    if (hasTopics && topicSections.length > 0) {
      handleSelectTopic(topicSections[0].topic);
      return;
    }
    await handleAdvanceLesson();
  }, [selectedTopicId, topicSections, hasTopics, handleSelectTopic, handleAdvanceToTopic, handleAdvanceLesson]);

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
              updatedUnits={updates}
              locale={locale}
              onNavigate={navigateToLesson}
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
              <button
                onClick={() => navigateToLesson(nav.prev!.lessonId)}
                title={locale === 'es' ? 'Lección anterior' : 'Previous lesson'}
                aria-label={locale === 'es' ? 'Lección anterior' : 'Previous lesson'}
                className="w-9 h-9 rounded-full flex items-center justify-center border border-white/10 text-white/60 hover:text-mx-orange hover:border-mx-orange/30 active:scale-90 active:bg-mx-orange/10 transition-all duration-150"
              >
                <ChevronLeft size={16} />
              </button>
            )}
            {(nav?.next || nextIsExam || hasTopics) && (
              <button
                onClick={handleNextStep}
                title={locale === 'es' ? 'Siguiente' : 'Next'}
                aria-label={locale === 'es' ? 'Siguiente' : 'Next'}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-mx-orange/10 border border-mx-orange/30 text-mx-orange hover:bg-mx-orange hover:text-white active:scale-90 active:brightness-110 transition-all duration-150"
              >
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <m.div
          key={selectedTopicId || 'index'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
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
              onAdvanceToTopic={handleAdvanceToTopic}
              onBackToIndex={handleBackToIndex}
              onNextLesson={handleAdvanceLesson}
              onNavigateLesson={navigateToLesson}
              prevLesson={nav.prev}
              locale={locale}
              nextIsExam={nextIsExam}
            />
          ) : nav && !selectedTopicId ? (
            /* ─── Lesson-level navigation ─── */
            <div className="flex items-center justify-between pt-8 border-t border-white/10 mt-8">
              {nav.prev ? (
                <button
                  onClick={() => navigateToLesson(nav.prev!.lessonId)}
                  className="flex items-center gap-2 text-white/50 hover:text-mx-orange active:scale-95 active:opacity-70 transition-all duration-150 text-body-sm"
                >
                  <ArrowLeft size={16} />
                  <span className="hidden sm:inline">{nav.prev.title[locale]}</span>
                  <span className="sm:hidden">{locale === 'es' ? 'Anterior' : 'Previous'}</span>
                </button>
              ) : (
                <div />
              )}
              {hasTopics && topicSections.length > 0 ? (
                <button
                  onClick={handleNextStep}
                  className="flex items-center gap-2 bg-mx-orange text-black px-4 py-2 rounded-lg hover:bg-mx-orange/90 active:scale-95 active:brightness-110 transition-all duration-150 text-body-sm font-medium"
                >
                  <span className="hidden sm:inline">{topicSections[0].topic.title[locale]}</span>
                  <span className="sm:hidden">{locale === 'es' ? 'Empezar' : 'Start'}</span>
                  <ArrowRight size={16} />
                </button>
              ) : nextIsExam ? (
                <button
                  onClick={handleNextStep}
                  className="flex items-center gap-2 bg-mx-orange text-black px-4 py-2 rounded-lg hover:bg-mx-orange/90 active:scale-95 active:brightness-110 transition-all duration-150 text-body-sm font-medium"
                >
                  <span>{locale === 'es' ? 'Examen del bloque' : 'Block exam'}</span>
                  <ArrowRight size={16} />
                </button>
              ) : nav.next ? (
                <button
                  onClick={handleNextStep}
                  className="flex items-center gap-2 text-white/50 hover:text-mx-orange active:scale-95 active:opacity-70 transition-all duration-150 text-body-sm"
                >
                  <span className="hidden sm:inline">{nav.next.title[locale]}</span>
                  <span className="sm:hidden">{locale === 'es' ? 'Siguiente' : 'Next'}</span>
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleNextStep}
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
  onAdvanceToTopic: (topic: MaxymiaTopic) => void;
  onBackToIndex: () => void;
  onNextLesson: () => void;
  onNavigateLesson: (lessonId: string) => void;
  prevLesson: { blockId: string; lessonId: string; title: { es: string; en: string } } | null;
  locale: 'es' | 'en';
  nextIsExam?: boolean;
}

function TopicNavigation({
  topicSections,
  selectedTopicId,
  onSelectTopic,
  onAdvanceToTopic,
  onBackToIndex,
  onNextLesson,
  onNavigateLesson,
  prevLesson,
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
        <button
          onClick={() => onNavigateLesson(prevLesson.lessonId)}
          className="flex items-center gap-2 text-white/50 hover:text-mx-orange transition-colors text-body-sm"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">{prevLesson.title[locale]}</span>
          <span className="sm:hidden">{locale === 'es' ? 'Lección anterior' : 'Previous lesson'}</span>
        </button>
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
          onClick={() => onAdvanceToTopic(nextTopic.topic)}
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
