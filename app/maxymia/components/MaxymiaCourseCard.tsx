'use client';

import React, { useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { m } from 'framer-motion';
import { ArrowUpRight, Calendar, User, Trophy } from 'lucide-react';
import type { MaxymiaCourse, MaxymiaCourseProgress, Locale } from '../types';
import { getCourseMeta, getCourseProgressStats } from '../data/queries';

interface MaxymiaCourseCardProps {
  course: MaxymiaCourse;
  locale: Locale;
  progress?: MaxymiaCourseProgress;
  enrolled?: boolean;
  index?: number;
  /** Versión clara (para la ficha de producto en tema light): tarjeta y popup
   *  en blanco con texto oscuro. Por defecto, tema oscuro del campus. */
  light?: boolean;
}

export default function MaxymiaCourseCard({
  course,
  locale,
  progress,
  enrolled,
  index = 0,
  light = false,
}: MaxymiaCourseCardProps) {
  // The course ficha is a public landing now, so every visitor — signed in or
  // not, crawlers included — links straight to it (no detour through /sign-in).
  const campusHref = `/maxymia/campus/${course.slug}`;

  const { totalLessons } = getCourseMeta(course);
  const {
    percent: progressPercent,
    isCompleted: isFullyCompleted,
    completed: completedCount,
  } = getCourseProgressStats(course, progress?.completedLessons);

  const createdLabel = course.createdAt
    ? new Date(course.createdAt).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', { month: 'short', year: 'numeric' })
    : null;

  const cardRef = useRef<HTMLDivElement>(null);
  const [popupSide, setPopupSide] = useState<'right' | 'left'>('right');

  const handleMouseEnter = useCallback(() => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const popupWidth = 300; // 272px + 12px padding
    if (rect.right + popupWidth > window.innerWidth) {
      setPopupSide('left');
    } else {
      setPopupSide('right');
    }
  }, []);

  // Paleta según tema. El thumbnail (azul + texto blanco) se mantiene en ambos.
  const c = light
    ? {
        cardBorder: 'border-mx-border',
        content: 'bg-white',
        title: 'text-mx-text',
        divider: 'border-mx-border',
        muted: 'text-mx-text-muted',
        faint: 'text-mx-text-muted',
        arrowBg: 'bg-black/[0.05]',
        arrowIcon: 'text-mx-text',
        track: 'bg-black/[0.06]',
        popup: 'bg-white border-mx-border',
        popupTitle: 'text-mx-text',
        popupDesc: 'text-mx-text-muted',
        popupDivider: 'border-mx-border',
      }
    : {
        cardBorder: 'border-[#2e3339]',
        content: 'bg-[#171c24]',
        title: 'text-white',
        divider: 'border-white/10',
        muted: 'text-white/30',
        faint: 'text-white/40',
        arrowBg: 'bg-white/10',
        arrowIcon: 'text-white',
        track: 'bg-white/10',
        popup: 'bg-[#171c24] border-white/40',
        popupTitle: 'text-white',
        popupDesc: 'text-white/50',
        popupDivider: 'border-white/5',
      };

  return (
    <m.div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      layout
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ delay: index * 0.06, duration: 0.5 }}
      className="group/card relative h-full"
    >
      <Link href={campusHref} className={`flex flex-col h-full overflow-hidden rounded-xl border ${isFullyCompleted ? 'border-amber-500/50 shadow-lg shadow-amber-500/10' : c.cardBorder}`}>
        {/* Thumbnail — solo la imagen del curso */}
        <div className="relative h-[240px] overflow-hidden">
          {/* Completion badge */}
          {isFullyCompleted && (
            <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full border border-amber-500/30">
              <Trophy size={12} className="text-amber-400" />
              <span className="text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                {locale === 'es' ? 'Completado' : 'Completed'}
              </span>
            </div>
          )}
          <img
            src={course.image}
            alt={course.title[locale]}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content area */}
        <div className={`${c.content} px-4 py-4 flex flex-col flex-grow`}>
          {/* Title */}
          <h3 className={`${c.title} font-semibold text-body-sm leading-snug line-clamp-3 min-h-[2.5rem] mb-3 group-hover/card:text-mx-orange transition-colors`}>
            {course.title[locale]}
          </h3>

          {/* Footer: Price or Progress */}
          <div className={`mt-auto pt-3 border-t ${c.divider}`}>
            {enrolled || progress ? (
              <div>
                {isFullyCompleted ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy size={14} className="text-amber-400" />
                      <span className="text-amber-400 text-body-sm font-semibold">
                        {locale === 'es' ? 'Curso completado' : 'Course completed'}
                      </span>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-amber-500/10 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity">
                      <ArrowUpRight size={14} className="text-amber-400" />
                    </div>
                  </div>
                ) : completedCount > 0 ? (
                  <>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-mx-orange text-label-md font-medium">
                        {progressPercent}%
                      </span>
                      <span className={`${c.muted} text-label-md`}>
                        {completedCount}/{totalLessons}
                      </span>
                    </div>
                    <div className={`w-full h-1.5 ${c.track} rounded-full overflow-hidden`}>
                      <div
                        className="h-full bg-gradient-to-r from-mx-orange to-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-green-400 text-body-sm font-medium">
                      ✓ {locale === 'es' ? 'Comprado' : 'Purchased'}
                    </span>
                    <div className={`w-7 h-7 rounded-full ${c.arrowBg} flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity`}>
                      <ArrowUpRight size={14} className={c.arrowIcon} />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {course.originalPrice && course.originalPrice > course.price && (
                    <span className={`${c.muted} text-body-sm line-through`}>
                      {course.originalPrice}&euro;
                    </span>
                  )}
                  <span className="text-mx-orange font-bold text-body-lg">
                    {course.price}&euro;
                  </span>
                </div>
                <div className={`w-7 h-7 rounded-full ${c.arrowBg} flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity`}>
                  <ArrowUpRight size={14} className={c.arrowIcon} />
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* ── Hover detail popup (tooltip con la descripción) ── */}
      <div className={`hidden lg:block absolute top-0 z-50 opacity-0 pointer-events-none group-hover/card:opacity-100 group-hover/card:pointer-events-auto transition-opacity duration-200 ${
        popupSide === 'right' ? 'left-full pl-3' : 'right-full pr-3'
      }`}>
        <div className={`w-72 2xl:w-80 ${c.popup} border rounded-xl shadow-2xl shadow-black/40`}>
          <div className="p-5">
            {/* Title + date */}
            <h4 className={`${c.popupTitle} font-bold text-body-sm leading-snug mb-2`}>
              {course.title[locale]}
            </h4>
            {createdLabel && (
              <span className={`flex items-center gap-1 ${c.faint} text-label-md mb-2`}>
                <Calendar size={10} />
                {createdLabel}
              </span>
            )}

            {/* Description */}
            <p className={`${c.popupDesc} text-label-md leading-relaxed mb-3 pb-3 border-b ${c.popupDivider}`}>
              {course.description[locale]}
            </p>

            {/* Author */}
            <div className="flex items-center gap-2.5">
              {course.instructor.avatar ? (
                <img src={course.instructor.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-mx-blue/20 flex items-center justify-center">
                  <User size={12} className="text-mx-blue" />
                </div>
              )}
              <div>
                <div className={`${c.popupTitle} text-label-md font-medium`}>{course.instructor.name}</div>
                <div className={`${c.faint} text-label-sm`}>{course.instructor.role}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </m.div>
  );
}
