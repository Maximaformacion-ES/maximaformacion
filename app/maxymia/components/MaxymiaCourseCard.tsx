'use client';

import React from 'react';
import Link from 'next/link';
import { m } from 'framer-motion';
import { Star, ArrowUpRight, Users } from 'lucide-react';
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

  const rating = course.rating ?? 0;
  const studentCount = course.studentCount ?? 0;
  const studentLabel = studentCount >= 1000
    ? `${(studentCount / 1000).toFixed(1).replace(/\.0$/, '')}k`
    : `${studentCount}`;

  const thumbnailLines = course.thumbnailTitle
    ? course.thumbnailTitle[locale].split('\n')
    : [course.title[locale].split(' ').slice(0, 2).join(' ')];

  return (
    <m.div
      layout
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ delay: index * 0.06, duration: 0.5 }}
      className="group relative rounded-xl overflow-hidden h-full"
    >
      <Link href={`/maxymia/campus/${course.slug}`} className="flex flex-col h-full">
        {/* Thumbnail area — blue background with chevrons and title */}
        <div className="relative h-[200px] bg-[#527be7] overflow-hidden flex items-center justify-center">
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
                <p className="text-white/70 text-xs tracking-widest uppercase font-medium shadow-2xl">
                  {thumbnailLines[0]}
                </p>
                <p className="text-white text-2xl font-black tracking-tight leading-tight shadow-2xl">
                  {thumbnailLines.slice(1).join(' ')}
                </p>
              </>
            ) : (
              <p className="text-white text-xl font-black tracking-tight leading-tight uppercase shadow-2xl">
                {thumbnailLines[0]}
              </p>
            )}
          </div>
        </div>

        {/* Orange accent bar */}
        <div className="h-[5px] bg-mx-orange" />

        {/* Content area — dark background */}
        <div className="bg-[#0f141e] px-4 py-4 flex flex-col flex-grow">
          {/* Rating + students */}
          <div className="flex items-center gap-2 mb-2">
            <StarRating rating={rating} />
            <span className="text-white/60 text-xs font-medium">{rating.toFixed(1)}</span>
            <span className="text-white/30 text-xs">|</span>
            <span className="flex items-center gap-1 text-white/40 text-xs">
              <Users size={11} />
              {studentLabel} {locale === 'es' ? 'estudiantes' : 'students'}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-white font-semibold text-[15px] leading-snug line-clamp-2 min-h-[2.5rem] mb-3 group-hover:text-mx-orange transition-colors">
            {course.title[locale]}
          </h3>

          {/* Footer: Price or Progress */}
          <div className="mt-auto pt-3 border-t border-white/10">
            {enrolled || progress ? (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-mx-orange text-xs font-medium">
                    {progressPercent}%
                  </span>
                  <span className="text-white/30 text-xs">
                    {completedCount}/{totalLessons}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-mx-orange to-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {course.originalPrice && course.originalPrice > course.price && (
                    <span className="text-white/30 text-sm line-through">
                      {course.originalPrice}&euro;
                    </span>
                  )}
                  <span className="text-mx-orange font-bold text-lg">
                    {course.price}&euro;
                  </span>
                </div>
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight size={14} className="text-white" />
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>
    </m.div>
  );
}
