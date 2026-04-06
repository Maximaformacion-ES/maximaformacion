'use client';

import { useMemo, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { m } from 'framer-motion';
import {
  BookOpen,
  Trophy,
  PlayCircle,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useUserCampus } from '@/app/hooks/useUserCampus';
import { useLocale } from '../../i18n/LocaleProvider';
import { getTranslation } from '../../i18n/translations';
import { getCourseMeta, getRecommendedCourses } from '../../data/queries';
import MaxymiaCourseCard from '../../components/MaxymiaCourseCard';
import type { MaxymiaCourse, MaxymiaCourseProgress } from '../../types';

interface MyCoursesProps {
  courses: MaxymiaCourse[];
}

export default function MyCourses({ courses }: MyCoursesProps) {
  const { locale } = useLocale();
  const t = (key: string) => getTranslation(locale, key);
  const { user } = useUser();
  const { courseProgress, hasAccess, isLoading } = useUserCampus();

  const firstName = user?.firstName || '';

  // Build progress map
  const progressMap: Record<string, MaxymiaCourseProgress> = useMemo(() => {
    const map: Record<string, MaxymiaCourseProgress> = {};
    for (const [key, data] of Object.entries(courseProgress)) {
      map[key] = {
        courseId: key,
        completedLessons: data.completedLessons,
        currentLessonId: data.currentLessonId,
        examResults: {},
        startedAt: data.startedAt ?? new Date().toISOString(),
        lastAccessedAt: data.lastAccessedAt ?? new Date().toISOString(),
      };
    }
    return map;
  }, [courseProgress]);

  // Filter only courses the user has access to
  const myCourses = useMemo(() => {
    return courses.filter((c) => hasAccess(c.id));
  }, [courses, hasAccess]);

  // Split into in-progress, completed, not started
  const { inProgressCourses, completedCourses, notStartedCourses } = useMemo(() => {
    const inProgress: MaxymiaCourse[] = [];
    const completed: MaxymiaCourse[] = [];
    const notStarted: MaxymiaCourse[] = [];

    for (const c of myCourses) {
      const p = progressMap[c.id];
      if (!p || p.completedLessons.length === 0) {
        notStarted.push(c);
        continue;
      }
      const { totalLessons } = getCourseMeta(c);
      if (totalLessons > 0 && p.completedLessons.length >= totalLessons) {
        completed.push(c);
      } else {
        inProgress.push(c);
      }
    }

    inProgress.sort((a, b) => {
      const pa = progressMap[a.id];
      const pb = progressMap[b.id];
      return new Date(pb?.lastAccessedAt ?? 0).getTime() - new Date(pa?.lastAccessedAt ?? 0).getTime();
    });

    return { inProgressCourses: inProgress, completedCourses: completed, notStartedCourses: notStarted };
  }, [myCourses, progressMap]);

  // Stats
  const stats = useMemo(() => {
    let totalLessonsCompleted = 0;
    let totalLessons = 0;
    for (const c of myCourses) {
      const meta = getCourseMeta(c);
      totalLessons += meta.totalLessons;
      const p = progressMap[c.id];
      if (p) totalLessonsCompleted += p.completedLessons.length;
    }
    const globalPercent = totalLessons > 0 ? Math.round((totalLessonsCompleted / totalLessons) * 100) : 0;
    return {
      totalCourses: myCourses.length,
      inProgress: inProgressCourses.length,
      completed: completedCourses.length,
      globalPercent,
    };
  }, [myCourses, inProgressCourses, completedCourses, progressMap]);

  // Recommended courses (excludes already owned)
  const enrolledIds = useMemo(() => myCourses.map((c) => c.id), [myCourses]);
  const recommendedCourses = useMemo(
    () => getRecommendedCourses(courses, enrolledIds, 8),
    [courses, enrolledIds],
  );

  // Personalized greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (locale === 'es') {
      if (hour < 12) return 'Buenos días';
      if (hour < 20) return 'Buenas tardes';
      return 'Buenas noches';
    }
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, [locale]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-white/20 border-t-mx-blue rounded-full animate-spin" />
      </div>
    );
  }

  if (myCourses.length === 0) {
    return (
      <div className="max-w-[1800px] mx-auto px-6 md:px-[128px] py-32">
        <m.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-md mx-auto"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
            <BookOpen size={28} className="text-white/30" />
          </div>
          <h1 className="text-heading-sm md:text-heading-md font-bold text-white mb-3">
            {t('myCourses.emptyTitle')}
          </h1>
          <p className="text-white/50 text-body-sm md:text-body-md mb-8">
            {t('myCourses.emptyDesc')}
          </p>
          <Link
            href="/maxymia/campus/cursos"
            className="inline-flex items-center gap-2 px-6 py-3 bg-mx-blue hover:bg-mx-blue/90 text-white font-semibold rounded-lg transition-colors text-body-sm"
          >
            {t('myCourses.exploreCatalog')}
          </Link>
        </m.div>
      </div>
    );
  }

  return (
    <div>
      {/* ── Hero: Personalized greeting ── */}
      <section className="relative py-10 sm:py-14 lg:py-20 overflow-hidden">
        {/* Background blurs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 right-[25%] w-80 h-80 bg-mx-blue/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-[15%] w-60 h-60 bg-mx-orange/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-[1800px] mx-auto px-6 md:px-[128px]">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-heading-md sm:text-heading-lg lg:text-display-sm font-black tracking-tight text-white mb-2">
              {greeting}{firstName ? `, ${firstName}` : ''}
            </h1>
            <p className="text-white/40 text-body-sm md:text-body-md max-w-lg">
              {stats.inProgress > 0
                ? t('myCourses.heroContext').replace('{n}', String(stats.inProgress))
                : t('myCourses.heroContextNone')
              }
            </p>
          </m.div>

          {/* ── Stats + Global progress ── */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-3 gap-3 md:gap-5 mt-8"
          >
            <StatCard icon={<BookOpen size={22} />} label={t('myCourses.totalCourses')} value={stats.totalCourses} color="default" scrollTo="section-not-started" />
            <StatCard icon={<PlayCircle size={22} />} label={t('myCourses.inProgress')} value={stats.inProgress} color="blue" scrollTo="section-in-progress" />
            <StatCard icon={<Trophy size={22} />} label={t('myCourses.completedStat')} value={stats.completed} color="green" scrollTo="section-completed" />
          </m.div>

          {/* Global progress bar */}
          {stats.globalPercent > 0 && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-5"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/30 text-label-md">{t('myCourses.globalProgress')}</span>
                <span className="text-mx-orange text-label-md font-semibold">{stats.globalPercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <m.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.globalPercent}%` }}
                  transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-mx-orange to-amber-400 rounded-full"
                />
              </div>
            </m.div>
          )}
        </div>
      </section>

      {/* ── Course sections ── */}
      <div className="max-w-[1800px] mx-auto px-6 md:px-[128px] pb-16">
        {/* 1. In Progress — Horizontal carousel */}
        {inProgressCourses.length > 0 && (
          <CourseRow
            id="section-in-progress"
            title={t('myCourses.inProgressSection')}
            icon={<PlayCircle size={18} className="text-mx-blue" />}
            courses={inProgressCourses}
            locale={locale}
            progressMap={progressMap}
            hasAccess={hasAccess}
            delay={0.05}
          />
        )}

        {/* 2. Not Started — Horizontal carousel */}
        {notStartedCourses.length > 0 && (
          <CourseRow
            id="section-not-started"
            title={t('myCourses.notStartedSection')}
            icon={<Clock size={18} className="text-white/40" />}
            courses={notStartedCourses}
            locale={locale}
            progressMap={progressMap}
            hasAccess={hasAccess}
            delay={0.1}
          />
        )}

        {/* 3. Completed — Grid with certificate buttons */}
        {completedCourses.length > 0 && (
          <m.section
            id="section-completed"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mb-14 scroll-mt-8"
          >
            <div className="flex items-center gap-2 mb-5 px-1">
              <Trophy size={18} className="text-emerald-400" />
              <h2 className="text-body-lg md:text-heading-sm 2xl:text-heading-md font-semibold text-white">
                {t('myCourses.completedSection')}
              </h2>
              <span className="text-label-sm text-white/30 ml-1">({completedCourses.length})</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
              {completedCourses.map((course, idx) => (
                <CompletedCard
                  key={course.id}
                  course={course}
                  locale={locale}
                  progress={progressMap[course.id]}
                  index={idx}
                />
              ))}
            </div>
          </m.section>
        )}

        {/* 4. Recommended courses CTA */}
        {recommendedCourses.length > 0 && (
          <CourseRow
            title={t('myCourses.recommendedSection')}
            icon={<ArrowRight size={18} className="text-mx-orange" />}
            courses={recommendedCourses}
            locale={locale}
            progressMap={progressMap}
            hasAccess={hasAccess}
            delay={0.2}
          />
        )}
      </div>
    </div>
  );
}

// ─── Completed Card (grid card with certificate) ────────────────────
function CompletedCard({
  course,
  locale,
  progress,
  index,
}: {
  course: MaxymiaCourse;
  locale: 'es' | 'en';
  progress?: MaxymiaCourseProgress;
  index: number;
}) {
  return (
    <m.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ delay: index * 0.06, duration: 0.5 }}
      className="flex flex-col"
    >
      <MaxymiaCourseCard
        course={course}
        locale={locale}
        progress={progress}
        enrolled
        index={0}
      />
    </m.div>
  );
}

// ─── Stat Card ──────────────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  color = 'default',
  scrollTo,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color?: 'default' | 'blue' | 'green';
  scrollTo?: string;
}) {
  const styles = {
    default: {
      border: 'border-white/10',
      iconBg: 'bg-white/[0.06]',
      icon: 'text-white/50',
      value: 'text-white',
    },
    blue: {
      border: 'border-mx-blue',
      iconBg: 'bg-mx-blue/10',
      icon: 'text-mx-blue',
      value: 'text-mx-blue',
    },
    green: {
      border: 'border-mx-orange',
      iconBg: 'bg-mx-orange/10',
      icon: 'text-mx-orange',
      value: 'text-mx-orange',
    },
  };

  const s = styles[color];

  function handleClick() {
    if (!scrollTo) return;
    const el = document.getElementById(scrollTo);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div
      onClick={handleClick}
      className={`relative overflow-hidden px-5 py-5 md:px-6 md:py-6 rounded-2xl bg-white/[0.02] border ${s.border} ${scrollTo ? 'cursor-pointer' : ''}`}
    >
      <div className={`w-10 h-10 md:w-11 md:h-11 rounded-xl ${s.iconBg} flex items-center justify-center mb-4`}>
        <div className={s.icon}>{icon}</div>
      </div>
      <p className={`text-heading-md md:text-heading-lg 2xl:text-display-sm font-black ${s.value}`}>{value}</p>
      <p className="text-label-md md:text-body-sm text-white/40 mt-1">{label}</p>
    </div>
  );
}

// ─── Horizontal Scroll Row (from Dashboard pattern) ─────────────────
function CourseRow({
  id,
  title,
  icon,
  courses,
  locale,
  progressMap,
  hasAccess,
  delay = 0,
}: {
  id?: string;
  title: string;
  icon: React.ReactNode;
  courses: MaxymiaCourse[];
  locale: 'es' | 'en';
  progressMap: Record<string, MaxymiaCourseProgress>;
  hasAccess: (id: string) => boolean;
  delay?: number;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  const scroll = useCallback((direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.clientWidth * 0.7;
    el.scrollBy({ left: direction === 'left' ? -cardWidth : cardWidth, behavior: 'smooth' });
  }, []);

  if (courses.length === 0) return null;

  return (
    <m.section
      id={id}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="mb-14 scroll-mt-8"
    >
      {/* Row header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-white text-body-lg md:text-heading-sm 2xl:text-heading-md font-semibold">{title}</h2>
          <span className="text-label-sm text-white/30 ml-1">({courses.length})</span>
        </div>
        {courses.length > 3 && (
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/10 flex items-center justify-center transition-colors disabled:opacity-20 disabled:cursor-default"
            >
              <ChevronLeft size={16} className="text-white" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/10 flex items-center justify-center transition-colors disabled:opacity-20 disabled:cursor-default"
            >
              <ChevronRight size={16} className="text-white" />
            </button>
          </div>
        )}
      </div>

      {/* Scrollable row */}
      <div className="relative">
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#0b1018] to-transparent z-10 pointer-events-none" />
        )}

        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-2 overflow-y-hidden"
        >
          {courses.map((course, i) => (
            <div key={course.id} className="flex-shrink-0 w-[260px] sm:w-[280px] lg:w-[300px]">
              <MaxymiaCourseCard
                course={course}
                locale={locale}
                progress={progressMap[course.id]}
                enrolled={hasAccess(course.id) || !!progressMap[course.id]}
                index={i}
              />
            </div>
          ))}
        </div>

        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#0b1018] to-transparent z-10 pointer-events-none" />
        )}
      </div>
    </m.section>
  );
}
