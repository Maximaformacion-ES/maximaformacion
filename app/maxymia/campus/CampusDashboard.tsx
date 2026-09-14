'use client';

import React, { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ArrowRight, Play } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useUserCampus } from '@/app/hooks/useUserCampus';
import { useLocale } from '../i18n/LocaleProvider';
import { getTranslation } from '../i18n/translations';
import MaxymiaCourseCard from '../components/MaxymiaCourseCard';
import SlideIndicator from '@/app/components/SlideIndicator';
import { getFeaturedCourses, getLatestCourse, getRecommendedCourses, getRecentCourses, getCourseProgressStats } from '../data/queries';
import type { MaxymiaCourse, MaxymiaCourseProgress, Locale } from '../types';

// ─── Hero Carousel ───────────────────────────────────────────────────
interface HeroCarouselProps {
  courses: MaxymiaCourse[];
  locale: Locale;
  t: (key: string) => string;
}

function HeroCarousel({ courses, locale, t }: HeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-rotate every 10 seconds, reset timer on manual change
  useEffect(() => {
    if (courses.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % courses.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [courses.length, activeIndex]);

  if (courses.length === 0) return null;

  const badges = [t('campus.featuredBadge'), t('campus.newCourse')];

  return (
    <section className="relative mb-10 rounded-2xl border border-mx-border bg-mx-card shadow-sm overflow-hidden">
      <AnimatePresence mode="wait">
        {courses.map((course, i) => {
          if (i !== activeIndex) return null;
          return (
            <m.div
              key={course.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-5"
            >
              {/* Texto */}
              <div className="lg:col-span-3 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
                <span className="inline-block w-fit px-3 py-1 mb-4 text-label-sm font-black tracking-[0.18em] uppercase bg-mx-blue text-white rounded-full">
                  {badges[i] ?? badges[0]}
                </span>
                <h1 className="text-heading-md md:text-heading-lg 2xl:text-display-sm font-black tracking-tight leading-tight text-mx-blue mb-3 text-balance">
                  {course.title[locale]}
                </h1>
                <p className="text-mx-text-muted text-body-sm sm:text-body-md leading-relaxed mb-5 max-w-xl line-clamp-3">
                  {course.description[locale]}
                </p>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-full bg-mx-blue/10 text-mx-blue flex items-center justify-center font-semibold text-body-sm">
                    {course.instructor.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-mx-text text-body-sm font-medium">{course.instructor.name}</p>
                    <p className="text-mx-text-muted text-label-md">{course.instructor.role}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    href={`/maxymia/campus/${course.slug}`}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-mx-orange hover:bg-mx-orange-dark text-white font-medium rounded-lg transition-colors text-body-sm"
                  >
                    <Play size={16} fill="currentColor" />
                    {t('campus.startLearning')}
                    <ArrowRight size={16} />
                  </Link>
                  <div className="flex items-baseline gap-2">
                    {course.originalPrice && course.originalPrice > course.price && (
                      <span className="text-mx-text-muted text-body-sm line-through">{course.originalPrice}&euro;</span>
                    )}
                    <span className="text-mx-orange text-heading-sm font-black">{course.price}&euro;</span>
                  </div>
                </div>
              </div>
              {/* Imagen */}
              <div className="relative lg:col-span-2 min-h-[220px] lg:min-h-[320px]">
                <Image
                  src={course.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                  unoptimized
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-mx-card via-mx-card/30 to-transparent lg:via-transparent" />
              </div>
            </m.div>
          );
        })}
      </AnimatePresence>
      {courses.length > 1 && (
        <div className="absolute bottom-4 left-6 sm:left-8 lg:left-10">
          <SlideIndicator count={courses.length} active={activeIndex} onSelect={setActiveIndex} />
        </div>
      )}
    </section>
  );
}

// ─── Horizontal scroll row ───────────────────────────────────────────
interface CourseRowProps {
  title: string;
  courses: MaxymiaCourse[];
  locale: Locale;
  progressMap: Record<string, MaxymiaCourseProgress>;
  hasAccess: (id: string, isPro?: boolean | null) => boolean;
  delay?: number;
}

function CourseRow({ title, courses, locale, progressMap, hasAccess, delay = 0 }: CourseRowProps) {
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
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="mb-10 sm:mb-12"
    >
      {/* Row header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 px-1">
        <h2 className="text-mx-text text-body-lg md:text-heading-sm font-bold tracking-tight">{title}</h2>
        {courses.length > 3 && (
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="w-8 h-8 rounded-full border border-mx-border bg-mx-card hover:border-mx-orange/40 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-default"
            >
              <ChevronLeft size={16} className="text-mx-text" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="w-8 h-8 rounded-full border border-mx-border bg-mx-card hover:border-mx-orange/40 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-default"
            >
              <ChevronRight size={16} className="text-mx-text" />
            </button>
          </div>
        )}
      </div>

      {/* Scrollable row */}
      <div className="relative group/row">
        {/* Left fade */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-mx-bg to-transparent z-10 pointer-events-none" />
        )}

        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-2 overflow-y-hidden"
        >
          {courses.map((course, i) => (
            <div
              key={course.id}
              className="flex-shrink-0 w-[260px] sm:w-[280px] lg:w-[300px]"
            >
              <MaxymiaCourseCard
                course={course}
                locale={locale}
                progress={progressMap[course.id]}
                enrolled={hasAccess(course.id, course.isPro) || !!progressMap[course.id]}
                index={i}
                light
              />
            </div>
          ))}
        </div>

        {/* Right fade */}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-mx-bg to-transparent z-10 pointer-events-none" />
        )}
      </div>
    </m.section>
  );
}

// ─── Main component ──────────────────────────────────────────────────
interface CampusDashboardProps {
  courses: MaxymiaCourse[];
}

export default function CampusDashboard({ courses }: CampusDashboardProps) {
  const { locale } = useLocale();
  const t = (key: string) => getTranslation(locale, key);
  const { courseProgress, hasAccess, isLoading } = useUserCampus();
  const { user } = useUser();

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

  const enrolledCourseIds = useMemo(() => Object.keys(progressMap), [progressMap]);

  // Hero slides: featured + latest
  const heroSlides = useMemo(() => {
    const featured = getFeaturedCourses(courses, 1)[0];
    const latest = getLatestCourse(courses);
    const slides: MaxymiaCourse[] = [];
    if (featured) slides.push(featured);
    if (latest && latest.id !== featured?.id) slides.push(latest);
    return slides;
  }, [courses]);

  // Rows
  const featuredCourses = useMemo(() => getFeaturedCourses(courses, 6), [courses]);
  const recommendedCourses = useMemo(
    () => getRecommendedCourses(courses, enrolledCourseIds, 6),
    [courses, enrolledCourseIds]
  );
  const recentCourses = useMemo(() => getRecentCourses(courses, 10), [courses]);
  const { inProgressCourses, completedCourses } = useMemo(() => {
    const inProgress: MaxymiaCourse[] = [];
    const completed: MaxymiaCourse[] = [];
    for (const c of courses) {
      const p = progressMap[c.id];
      if (!p) continue;
      const { isCompleted } = getCourseProgressStats(c, p.completedLessons);
      if (isCompleted) {
        completed.push(c);
      } else {
        inProgress.push(c);
      }
    }
    inProgress.sort((a, b) => {
      const pa = progressMap[a.id];
      const pb = progressMap[b.id];
      return new Date(pb.lastAccessedAt).getTime() - new Date(pa.lastAccessedAt).getTime();
    });
    return { inProgressCourses: inProgress, completedCourses: completed };
  }, [courses, progressMap]);

  return (
    <div className="w-full">
      {/* Saludo */}
      <div className="mb-6">
        <h1 className="text-heading-md md:text-heading-lg font-black tracking-tight text-mx-blue">
          {locale === 'es' ? 'Hola' : 'Hi'}{user?.firstName ? `, ${user.firstName}` : ''}
        </h1>
        <p className="text-mx-text-muted text-body-sm mt-1">
          {inProgressCourses.length > 0
            ? (locale === 'es'
                ? `Tienes ${inProgressCourses.length} ${inProgressCourses.length === 1 ? 'curso en marcha' : 'cursos en marcha'}. Sigue por donde lo dejaste.`
                : `You have ${inProgressCourses.length} ${inProgressCourses.length === 1 ? 'course' : 'courses'} in progress. Pick up where you left off.`)
            : t('campus.welcomeDesc')}
        </p>
      </div>

      {/* Continuar: lo primero si hay cursos en marcha */}
      {!isLoading && inProgressCourses.length > 0 && (
        <CourseRow
          title={t('campus.continueLearningRow')}
          courses={inProgressCourses}
          locale={locale}
          progressMap={progressMap}
          hasAccess={hasAccess}
          delay={0}
        />
      )}

      {/* Destacado / nuevo */}
      <HeroCarousel courses={heroSlides} locale={locale} t={t} />

      {/* Course rows */}
      <div id="courses" className="w-full">
        {/* Recently Added */}
        <CourseRow
          title={t('campus.recentlyAdded')}
          courses={recentCourses}
          locale={locale}
          progressMap={progressMap}
          hasAccess={hasAccess}
          delay={0.05}
        />

        {/* Featured */}
        <CourseRow
          title={t('campus.featured')}
          courses={featuredCourses}
          locale={locale}
          progressMap={progressMap}
          hasAccess={hasAccess}
          delay={0.1}
        />

        {/* Recommended */}
        <CourseRow
          title={t('campus.recommended')}
          courses={recommendedCourses}
          locale={locale}
          progressMap={progressMap}
          hasAccess={hasAccess}
          delay={0.2}
        />

        {/* Completed Courses */}
        {!isLoading && completedCourses.length > 0 && (
          <CourseRow
            title={t('campus.completedRow')}
            courses={completedCourses}
            locale={locale}
            progressMap={progressMap}
            hasAccess={hasAccess}
            delay={0.35}
          />
        )}
      </div>
    </div>
  );
}
