'use client';

import React from 'react';
import { BarChart3, BookOpen, Clock } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useUserCampus } from '@/app/hooks/useUserCampus';
import type { MaxymiaCourse, MaxymiaCourseProgress, Locale } from '../types';
import { getCourseMeta, getCourseProgressStats } from '../data/queries';
import { MAXYMIA_CATEGORY_LABELS, MAXYMIA_LEVEL_LABELS } from '../data/labels';
import { CourseCard, type CourseCardData } from '@/app/components/CourseCard';

/**
 * Adaptador MaxymiaCourse → <CourseCard> (la misma tarjeta que los programas
 * de Máxima). Añade lo propio del campus: progreso del alumno y tema oscuro.
 * Lee el estado Pro del usuario con Clerk (toda la superficie de Maxymia va
 * dentro de AppClerkProvider), igual que hace <ProgramCard> en /programas.
 */
interface MaxymiaCourseCardProps {
  course: MaxymiaCourse;
  locale: Locale;
  progress?: MaxymiaCourseProgress;
  enrolled?: boolean;
  index?: number;
  /** Tema claro (landing y ficha pública). Por defecto, el oscuro del campus. */
  light?: boolean;
}

export function maxymiaCourseToCardData(
  course: MaxymiaCourse,
  locale: Locale,
  progress?: MaxymiaCourseProgress,
  enrolled?: boolean,
): CourseCardData {
  const { totalLessons, totalMinutes } = getCourseMeta(course);
  const stats = getCourseProgressStats(course, progress?.completedLessons);
  const hours = course.durationHours ?? Math.round(totalMinutes / 60);
  const meta: CourseCardData['meta'] = [];
  if (hours > 0) meta.push({ icon: Clock, label: `${hours} h` });
  const level = MAXYMIA_LEVEL_LABELS[course.level]?.[locale];
  if (level) meta.push({ icon: BarChart3, label: level });
  if (totalLessons > 0) {
    meta.push({ icon: BookOpen, label: `${totalLessons} ${locale === 'es' ? 'lecciones' : 'lessons'}` });
  }
  const hasProgress = !!progress && (progress.completedLessons?.length ?? 0) > 0;

  return {
    // La ficha es una landing pública: todo el mundo enlaza directo a ella.
    href: `/maxymia/campus/${course.slug}`,
    title: course.title[locale],
    description: course.description[locale],
    image: course.image,
    kind: 'maxymia',
    isPro: course.isPro,
    area: MAXYMIA_CATEGORY_LABELS[course.category]?.[locale] ?? null,
    meta,
    pricing: {
      price: course.price,
      originalPrice: course.originalPrice ?? null,
      isPro: course.isPro,
      haveDiscount: course.haveDiscount,
      proOnly: course.proOnly,
    },
    progress: hasProgress || stats.isCompleted
      ? { percent: stats.percent, completed: stats.completed, total: totalLessons, isCompleted: stats.isCompleted }
      : undefined,
    enrolled,
  };
}

export default function MaxymiaCourseCard({
  course,
  locale,
  progress,
  enrolled,
  index = 0,
  light = false,
}: MaxymiaCourseCardProps) {
  const { isSignedIn } = useUser();
  const { hasPro } = useUserCampus();
  const userHasPro = !!isSignedIn && hasPro;
  return (
    <CourseCard
      data={maxymiaCourseToCardData(course, locale, progress, enrolled)}
      index={index}
      userHasPro={userHasPro}
      locale={locale}
      theme={light ? 'light' : 'dark'}
      priority={index < 4}
    />
  );
}
