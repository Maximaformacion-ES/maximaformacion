'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { m } from 'framer-motion';
import { Play, CheckCircle, Crown, ShoppingBag, Clock, ArrowRight } from 'lucide-react';
import type { UserCourseData } from '@/lib/strapi/types';
import { formatTotalDuration } from '@/lib/cloudflare/stream';

interface CourseProgressCardProps {
  courseData: UserCourseData;
  index?: number;
}

export default function CourseProgressCard({ courseData, index = 0 }: CourseProgressCardProps) {
  const { program, progress, accessType } = courseData;
  const progressPercent = progress?.progressPercent || 0;
  const isCompleted = progressPercent === 100;
  const hasStarted = progress && progress.completedLessons.length > 0;

  const ctaText = isCompleted ? 'Ver certificado' : hasStarted ? 'Continuar' : 'Comenzar';
  const ctaLink = `/cursos/${program.documentId}${
    progress?.currentLessonId ? `/lesson/${progress.currentLessonId}` : ''
  }`;

  return (
    <m.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="group flex gap-4 p-3 bg-white border border-mx-border hover:border-mx-orange/40 rounded-xl transition-all"
    >
      {/* Course Image — compact landscape */}
      <Link href={ctaLink} className="relative w-32 h-24 sm:w-36 sm:h-28 shrink-0 rounded-lg overflow-hidden bg-mx-bg">
        <Image
          src={program.image}
          alt={program.title}
          className="object-cover transition-transform group-hover:scale-105"
          fill
          sizes="(max-width: 640px) 128px, 144px"
          unoptimized
        />
        {/* Play overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
          <div className="w-9 h-9 rounded-full bg-mx-orange opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Play size={14} className="text-white ml-0.5" fill="currentColor" />
          </div>
        </div>

        {/* Completion badge over image */}
        {isCompleted && (
          <span className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            <CheckCircle size={10} />
            Completado
          </span>
        )}
      </Link>

      {/* Course Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-mx-orange text-[10px] font-bold tracking-widest uppercase">
              {program.type}
            </span>
            {accessType === 'pro' ? (
              <span className="flex items-center gap-1 text-mx-orange text-[10px] font-semibold bg-mx-orange/10 px-1.5 py-0.5 rounded-full">
                <Crown size={10} />
                Pro
              </span>
            ) : (
              <span className="flex items-center gap-1 text-green-700 text-[10px] font-semibold bg-green-100 px-1.5 py-0.5 rounded-full">
                <ShoppingBag size={10} />
                Comprado
              </span>
            )}
          </div>

          <h3 className="text-mx-text font-semibold text-body-sm leading-snug line-clamp-2">
            {program.title}
          </h3>

          {/* Progress bar */}
          {hasStarted && (
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-mx-border rounded-full overflow-hidden">
                  <m.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.6 }}
                    className={`h-full rounded-full ${
                      isCompleted ? 'bg-green-500' : 'bg-mx-orange'
                    }`}
                  />
                </div>
                <span className="text-mx-text-muted text-[10px] font-medium tabular-nums">
                  {progressPercent}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer: meta + CTA */}
        <div className="flex items-center justify-between mt-2 gap-2">
          <div className="flex items-center gap-2 text-mx-text-muted text-[11px] min-w-0">
            {'totalLessons' in program && (
              <span className="truncate">{program.totalLessons} lecciones</span>
            )}
            {'totalDuration' in program && (
              <span className="flex items-center gap-1 shrink-0">
                <Clock size={10} />
                {formatTotalDuration(program.totalDuration)}
              </span>
            )}
          </div>
          <Link
            href={ctaLink}
            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full transition-colors shrink-0 ${
              isCompleted
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-mx-orange text-white hover:bg-mx-orange-dark'
            }`}
          >
            {ctaText}
            <ArrowRight size={11} />
          </Link>
        </div>
      </div>
    </m.div>
  );
}
