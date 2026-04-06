'use client';

import React, { useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { m } from 'framer-motion';
import { Star, ArrowUpRight, Users, Calendar, User, Trophy } from 'lucide-react';
import type { MaxymiaCourse, MaxymiaCourseProgress, Locale } from '../types';
import { getCourseMeta } from '../data/queries';

interface MaxymiaCourseCardProps {
  course: MaxymiaCourse;
  locale: Locale;
  progress?: MaxymiaCourseProgress;
  enrolled?: boolean;
  index?: number;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={12}
          className={
            star <= Math.floor(rating)
              ? 'text-mx-orange fill-mx-orange'
              : star <= Math.ceil(rating) && rating % 1 >= 0.5
              ? 'text-mx-orange fill-mx-orange/50'
              : 'text-white/20'
          }
        />
      ))}
    </div>
  );
}

export default function MaxymiaCourseCard({
  course,
  locale,
  progress,
  enrolled,
  index = 0,
}: MaxymiaCourseCardProps) {
  const { totalLessons } = getCourseMeta(course);
  const completedCount = progress?.completedLessons.length ?? 0;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const isFullyCompleted = progressPercent === 100 && totalLessons > 0;

  const rating = course.rating ?? 0;
  const studentCount = course.studentCount ?? 0;
  const studentLabel = studentCount >= 1000
    ? `${(studentCount / 1000).toFixed(1).replace(/\.0$/, '')}k`
    : `${studentCount}`;

  const thumbnailLines = course.thumbnailTitle
    ? course.thumbnailTitle[locale].split('\n')
    : [course.title[locale].split(' ').slice(0, 2).join(' ')];

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
      <Link href={`/maxymia/campus/${course.slug}`} className={`flex flex-col h-full overflow-hidden rounded-xl border ${isFullyCompleted ? 'border-amber-500/50 shadow-lg shadow-amber-500/10' : 'border-[#2e3339]'}`}>
        {/* Thumbnail area */}
        <div className={`relative h-[200px] overflow-hidden flex items-center justify-center ${isFullyCompleted ? 'bg-gradient-to-br from-amber-600 to-amber-800' : 'bg-[#527be7]'}`}>
          {/* Completion badge */}
          {isFullyCompleted && (
            <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full border border-amber-500/30">
              <Trophy size={12} className="text-amber-400" />
              <span className="text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                {locale === 'es' ? 'Completado' : 'Completed'}
              </span>
            </div>
          )}
          {/* Course image at 10% opacity behind everything */}
          <img
            src={course.image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />

          {/* Dark cloud/glow behind chevrons + text for contrast */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-full h-[60%] bg-[#0b1018]/50 blur-[30px]" />
          </div>

          {/* Left chevron */}
          <div className="absolute left-1 top-1/2 -translate-y-1/2 z-10">
            <img src="/iconBlue.svg" alt="" className="w-8 h-auto" />
          </div>

          {/* Right chevron */}
          <div className="absolute right-1 top-1/2 -translate-y-1/2 z-10">
            <img src="/iconOrange.svg" alt="" className="w-8 h-auto" />
          </div>

          {/* Thumbnail title centered */}
          <div className="relative z-10 text-center px-12">
            {thumbnailLines.length > 1 ? (
              <>
                <p className="text-white/70 text-label-md tracking-widest uppercase font-medium shadow-2xl">
                  {thumbnailLines[0]}
                </p>
                <p className="text-white text-heading-md font-black tracking-tight leading-tight shadow-2xl">
                  {thumbnailLines.slice(1).join(' ')}
                </p>
              </>
            ) : (
              <p className="text-white text-heading-sm font-black tracking-tight leading-tight uppercase shadow-2xl">
                {thumbnailLines[0]}
              </p>
            )}
          </div>
        </div>

        {/* Orange accent bar */}
        {/* <div className="h-[5px] bg-mx-orange" /> */}

        {/* Content area — dark background */}
        <div className="bg-[#171c24] px-4 py-4 flex flex-col flex-grow">
          {/* Rating + students */}
          <div className="flex items-center gap-2 mb-2">
            <StarRating rating={rating} />
            <span className="text-white/60 text-label-md font-medium">{rating.toFixed(1)}</span>
            <span className="text-white/30 text-label-md">|</span>
            <span className="flex items-center gap-1 text-white/40 text-label-md">
              <Users size={11} />
              {studentLabel} {locale === 'es' ? 'estudiantes' : 'students'}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-white font-semibold text-body-sm leading-snug line-clamp-2 min-h-[2.5rem] mb-3 group-hover/card:text-mx-orange transition-colors">
            {course.title[locale]}
          </h3>

          {/* Footer: Price or Progress */}
          <div className="mt-auto pt-3 border-t border-white/10">
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
                      <span className="text-white/30 text-label-md">
                        {completedCount}/{totalLessons}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
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
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity">
                      <ArrowUpRight size={14} className="text-white" />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {course.originalPrice && course.originalPrice > course.price && (
                    <span className="text-white/30 text-body-sm line-through">
                      {course.originalPrice}&euro;
                    </span>
                  )}
                  <span className="text-mx-orange font-bold text-body-lg">
                    {course.price}&euro;
                  </span>
                </div>
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity">
                  <ArrowUpRight size={14} className="text-white" />
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* ── Hover detail popup ── */}
      <div className={`hidden lg:block absolute top-0 z-50 opacity-0 pointer-events-none group-hover/card:opacity-100 group-hover/card:pointer-events-auto transition-opacity duration-200 ${
        popupSide === 'right' ? 'left-full pl-3' : 'right-full pr-3'
      }`}>
        <div className="w-72 2xl:w-80 bg-[#171c24] border border-white/40 rounded-xl shadow-2xl shadow-black/40">
          <div className="p-5">
            {/* Title + date */}
            <h4 className="text-white font-bold text-body-sm leading-snug mb-2">
              {course.title[locale]}
            </h4>
            {createdLabel && (
              <span className="flex items-center gap-1 text-white/40 text-label-md mb-2">
                <Calendar size={10} />
                {createdLabel}
              </span>
            )}

            {/* Description */}
            <p className="text-white/50 text-label-md leading-relaxed mb-3 pb-3 border-b border-white/5">
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
                <div className="text-white text-label-md font-medium">{course.instructor.name}</div>
                <div className="text-white/40 text-label-sm">{course.instructor.role}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </m.div>
  );
}
