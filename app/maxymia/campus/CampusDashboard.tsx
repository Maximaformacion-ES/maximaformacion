'use client';

import React, { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Star, Users, ArrowRight } from 'lucide-react';import { useUserCampus } from '@/app/hooks/useUserCampus';
import { useLocale } from '../i18n/LocaleProvider';
import { getTranslation } from '../i18n/translations';
import MaxymiaCourseCard from '../components/MaxymiaCourseCard';
import SlideIndicator from '@/app/components/SlideIndicator';
import { getBestRatedCourses, getLatestCourse, getRecommendedCourses, getRecentCourses, getCourseProgressStats } from '../data/queries';
import type { MaxymiaCourse, MaxymiaCourseProgress, Locale } from '../types';

// ─── Star Rating ─────────────────────────────────────────────────────
function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
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

  const badges = [t('campus.bestRatedBadge'), t('campus.newCourse')];

  const activeCourse = courses[activeIndex];

  return (
    <section className="relative mb-8 sm:mb-16 min-h-[60dvh] sm:h-[80dvh] flex flex-col justify-center overflow-hidden">
      {/* Course image background — full viewport width */}
      {activeCourse && (
        <div className="absolute inset-0 -mx-[128px] max-md:-mx-6" style={{ left: 0, right: 0, marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)' }}>
          <img
            src={activeCourse.image}
            alt=""
            className="absolute inset-0 w-screen h-full object-cover opacity-5"
          />
          {/* Blue accent gradient — left and bottom */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#527be7]/25 via-transparent to-transparent"/>
        </div>
      )}

      <div className="relative max-w-[1800px] w-full mx-auto px-4 sm:px-6 md:px-[128px]">
        <AnimatePresence mode="wait">
          {courses.map((course, i) => {
            if (i !== activeIndex) return null;
            const rating = course.rating ?? 0;
            const studentCount = course.studentCount ?? 0;
            const studentLabel = studentCount >= 1000
              ? `${(studentCount / 1000).toFixed(1).replace(/\.0$/, '')}k`
              : `${studentCount}`;

            return (
              <m.div
                key={course.id}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.5 }}
                className="py-12 md:py-20"
              >
                <div>
                  <div className="lg:w-1/2 w-full">
                    {/* Badge */}
                    <span className="inline-block px-3 py-1 mb-5 text-label-sm font-bold tracking-widest uppercase bg-mx-blue/20 text-mx-blue rounded-full border border-mx-blue/30">
                      {badges[i] ?? badges[0]}
                    </span>

                    <h1 className="text-heading-sm sm:text-heading-md md:text-heading-lg 2xl:text-display-sm font-bold text-white leading-tight mb-3 sm:mb-5 text-balance">
                      {course.title[locale].toUpperCase()}
                    </h1>

                    {/* Rating + students */}
                    <div className="flex items-center gap-3 mb-4">
                      <StarRating rating={rating} size={16} />
                      <span className="text-white/70 text-body-sm font-medium">{rating.toFixed(1)}</span>
                      <span className="text-white/20">|</span>
                      <span className="flex items-center gap-1 text-white/50 text-body-sm">
                        <Users size={14} />
                        {studentLabel} {t('campus.students')}
                      </span>
                    </div>

                    <p className="text-white/50 text-body-sm sm:text-body-md 2xl:text-body-lg leading-relaxed mb-4 sm:mb-6 max-w-lg">
                      {course.description[locale]}
                    </p>

                    {/* Instructor */}
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-mx-orange/30 to-purple-500/30 flex items-center justify-center">
                        <span className="text-white font-semibold text-body-sm">
                          {course.instructor.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-white text-body-sm font-medium">{course.instructor.name}</p>
                        <p className="text-white/40 text-label-md">{course.instructor.role}</p>
                      </div>
                    </div>

                    {/* Price + CTA */}
                    <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-5">
                      <div className="flex items-baseline gap-2">
                        {course.originalPrice && course.originalPrice > course.price && (
                          <span className="text-white/30 text-body-lg line-through">{course.originalPrice}&euro;</span>
                        )}
                        <span className="text-mx-orange text-heading-md sm:text-heading-lg 2xl:text-display-sm font-bold">{course.price}&euro;</span>
                      </div>
                      <Link
                        href={`/maxymia/campus/${course.slug}`}
                        className="inline-flex items-center gap-2 px-4 py-2.5 md:px-6 md:py-3 bg-mx-orange hover:bg-mx-orange/90 text-white font-semibold rounded-lg transition-colors text-label-md md:text-body-sm w-fit"
                      >
                        {t('campus.startLearning')}
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </div>
              </m.div>
            );
          })}
        </AnimatePresence>

        {/* Slide indicator — bottom right */}
        {courses.length > 1 && (
          <div className="flex justify-end pb-6">
            <SlideIndicator count={courses.length} active={activeIndex} onSelect={setActiveIndex} />
          </div>
        )}
      </div>
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
        <h2 className="text-white text-body-md sm:text-body-lg md:text-heading-sm 2xl:text-heading-md font-semibold">{title}</h2>
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
      <div className="relative group/row">
        {/* Left fade */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#0b1018] to-transparent z-10 pointer-events-none" />
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
              />
            </div>
          ))}
        </div>

        {/* Right fade */}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#0b1018] to-transparent z-10 pointer-events-none" />
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

  // Hero slides: best rated + latest
  const heroSlides = useMemo(() => {
    const bestRated = getBestRatedCourses(courses, 1)[0];
    const latest = getLatestCourse(courses);
    const slides: MaxymiaCourse[] = [];
    if (bestRated) slides.push(bestRated);
    if (latest && latest.id !== bestRated?.id) slides.push(latest);
    return slides;
  }, [courses]);

  // Rows
  const bestRatedCourses = useMemo(() => getBestRatedCourses(courses, 6), [courses]);
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
    <div>
      {/* Hero Carousel */}
      <HeroCarousel courses={heroSlides} locale={locale} t={t} />

      {/* Course rows */}
      <div id="courses" className="max-w-[1800px] mx-auto px-4 sm:px-6 md:px-[128px]">
        {/* Recently Added */}
        <CourseRow
          title={t('campus.recentlyAdded')}
          courses={recentCourses}
          locale={locale}
          progressMap={progressMap}
          hasAccess={hasAccess}
          delay={0.05}
        />

        {/* Best Rated */}
        <CourseRow
          title={t('campus.bestRated')}
          courses={bestRatedCourses}
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

        {/* Continue Learning */}
        {!isLoading && inProgressCourses.length > 0 && (
          <CourseRow
            title={t('campus.continueLearningRow')}
            courses={inProgressCourses}
            locale={locale}
            progressMap={progressMap}
            hasAccess={hasAccess}
            delay={0.3}
          />
        )}

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
