'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, CheckCircle, Crown, ShoppingBag, Clock } from 'lucide-react';
import type { UserCourseData } from '@/lib/strapi/types';
import { formatTotalDuration } from '@/lib/cloudflare/stream';

interface CourseProgressCardProps {
  courseData: UserCourseData;
  index?: number;
}

export default function CourseProgressCard({ courseData, index = 0 }: CourseProgressCardProps) {
  const { program, progress, accessType, purchasedAt } = courseData;
  const progressPercent = progress?.progressPercent || 0;
  const isCompleted = progressPercent === 100;
  const hasStarted = progress && progress.completedLessons.length > 0;

  // Determine CTA button text and link
  const ctaText = isCompleted
    ? 'Ver certificado'
    : hasStarted
      ? 'Continuar'
      : 'Comenzar';

  const ctaLink = `/cursos/${program.documentId}${
    progress?.currentLessonId ? `/lesson/${progress.currentLessonId}` : ''
  }`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group bg-white/5 border border-white/10 hover:border-amber-500/50 rounded-xl overflow-hidden transition-all"
    >
      {/* Course Image */}
      <div className="relative aspect-video">
        <img
          src={program.image}
          alt={program.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Access Type Badge */}
        <div className="absolute top-3 right-3">
          {accessType === 'pro' ? (
            <span className="flex items-center gap-1 bg-amber-500/90 text-black text-xs font-bold px-2 py-1 rounded-full">
              <Crown size={12} />
              Pro
            </span>
          ) : (
            <span className="flex items-center gap-1 bg-green-500/90 text-black text-xs font-bold px-2 py-1 rounded-full">
              <ShoppingBag size={12} />
              Comprado
            </span>
          )}
        </div>

        {/* Completion Badge */}
        {isCompleted && (
          <div className="absolute top-3 left-3">
            <span className="flex items-center gap-1 bg-green-500 text-black text-xs font-bold px-2 py-1 rounded-full">
              <CheckCircle size={12} />
              Completado
            </span>
          </div>
        )}

        {/* Play Overlay */}
        <Link
          href={ctaLink}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <div className="w-14 h-14 rounded-full bg-amber-500/90 flex items-center justify-center shadow-lg">
            <Play className="text-black ml-1" size={24} fill="currentColor" />
          </div>
        </Link>
      </div>

      {/* Course Info */}
      <div className="p-4">
        <span className="text-amber-500 text-xs font-medium tracking-wider uppercase">
          {program.type}
        </span>
        <h3 className="text-white font-semibold mt-1 mb-2 line-clamp-2">
          {program.title}
        </h3>

        {/* Progress Bar */}
        {hasStarted && (
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-white/40 text-xs">Progreso</span>
              <span className="text-amber-500 text-xs font-medium">{progressPercent}%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                className={`h-full rounded-full ${
                  isCompleted
                    ? 'bg-green-500'
                    : 'bg-gradient-to-r from-amber-500 to-amber-400'
                }`}
              />
            </div>
          </div>
        )}

        {/* Meta info */}
        <div className="flex items-center justify-between text-white/40 text-xs mb-4">
          {'totalLessons' in program && (
            <span>{program.totalLessons} lecciones</span>
          )}
          {'totalDuration' in program && (
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {formatTotalDuration(program.totalDuration)}
            </span>
          )}
        </div>

        {/* CTA Button */}
        <Link
          href={ctaLink}
          className={`block w-full text-center py-3 rounded-lg font-medium transition-colors ${
            isCompleted
              ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
              : 'bg-amber-500 text-black hover:bg-amber-400'
          }`}
        >
          {ctaText}
        </Link>

        {/* Last accessed */}
        {progress?.lastAccessedAt && (
          <p className="text-white/30 text-xs text-center mt-3">
            Último acceso:{' '}
            {new Date(progress.lastAccessedAt).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'short',
            })}
          </p>
        )}
      </div>
    </motion.div>
  );
}
