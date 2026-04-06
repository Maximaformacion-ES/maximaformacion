'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Tag,
  BarChart3,
  Hourglass,
  Star,
} from 'lucide-react';
import { useUserCampus } from '@/app/hooks/useUserCampus';
import { useLocale } from '../../i18n/LocaleProvider';
import { getTranslation } from '../../i18n/translations';
import { getMaxymiaCategories, getCourseMeta } from '../../data/queries';
import MaxymiaCourseCard from '../../components/MaxymiaCourseCard';
import {
  FilterBar,
  FilterDropdown,
  RangeFilterDropdown,
  SortDropdown,
  Pagination,
} from '@/app/components/filters';
import type { FilterOption, SortOption } from '@/app/components/filters';
import type { MaxymiaCourse, MaxymiaCategory, MaxymiaLevel } from '../../types';

// ─── Types ──────────────────────────────────────────────────────────

type SortBy = 'relevance' | 'rating' | 'price-asc' | 'price-desc' | 'newest' | 'students';

const COURSES_PER_PAGE = 20;

// ─── CourseCatalog ──────────────────────────────────────────────────

interface CourseCatalogProps {
  courses: MaxymiaCourse[];
}

export default function CourseCatalog({ courses }: CourseCatalogProps) {
  const { locale } = useLocale();
  const { courseProgress, hasAccess } = useUserCampus();
  const t = useCallback(
    (key: string) => getTranslation(locale, key),
    [locale]
  );

  // State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<MaxymiaCategory | null>(null);
  const [level, setLevel] = useState<MaxymiaLevel | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [durationRange, setDurationRange] = useState<[number, number]>([0, 600]);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Click outside
  const filtersRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filtersRef.current && !filtersRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, category, level, priceRange, durationRange, minRating, sortBy]);

  // Memoize course metadata
  const coursesWithMeta = useMemo(
    () => courses.map((c) => ({ course: c, meta: getCourseMeta(c) })),
    [courses]
  );

  // Filter & sort
  const filteredCourses = useMemo(() => {
    let result = [...coursesWithMeta];

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        ({ course }) =>
          course.title.es.toLowerCase().includes(q) ||
          course.title.en.toLowerCase().includes(q) ||
          course.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    // Category
    if (category) {
      result = result.filter(({ course }) => course.category === category);
    }

    // Level
    if (level) {
      result = result.filter(({ course }) => course.level === level);
    }

    // Price range
    if (priceRange[0] !== 0 || priceRange[1] !== 500) {
      result = result.filter(
        ({ course }) => course.price >= priceRange[0] && course.price <= priceRange[1]
      );
    }

    // Duration range
    if (durationRange[0] !== 0 || durationRange[1] !== 600) {
      result = result.filter(
        ({ meta }) => meta.totalMinutes >= durationRange[0] && meta.totalMinutes <= durationRange[1]
      );
    }

    // Rating
    if (minRating) {
      result = result.filter(({ course }) => (course.rating ?? 0) >= minRating);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.course.rating ?? 0) - (a.course.rating ?? 0);
        case 'price-asc':
          return a.course.price - b.course.price;
        case 'price-desc':
          return b.course.price - a.course.price;
        case 'newest':
          return (
            new Date(b.course.createdAt ?? 0).getTime() -
            new Date(a.course.createdAt ?? 0).getTime()
          );
        case 'students':
          return (b.course.studentCount ?? 0) - (a.course.studentCount ?? 0);
        default:
          return 0; // relevance = original order
      }
    });

    return result.map(({ course }) => course);
  }, [coursesWithMeta, search, category, level, priceRange, durationRange, minRating, sortBy]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / COURSES_PER_PAGE));
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * COURSES_PER_PAGE,
    currentPage * COURSES_PER_PAGE
  );

  // Filter options
  const categories = getMaxymiaCategories();
  const categoryOptions: FilterOption[] = [
    { value: 'all', label: locale === 'es' ? 'Todas' : 'All' },
    ...categories.map((c) => ({ value: c.id, label: c.label[locale] })),
  ];

  const levelOptions: FilterOption[] = [
    { value: 'all', label: locale === 'es' ? 'Todos' : 'All' },
    { value: 'beginner', label: t('level.beginner') },
    { value: 'intermediate', label: t('level.intermediate') },
    { value: 'advanced', label: t('level.advanced') },
  ];

  const ratingOptions: FilterOption[] = [
    { value: 'all', label: t('filter.rating.all') },
    { value: '4', label: t('filter.rating.4plus') },
    { value: '3', label: t('filter.rating.3plus') },
  ];

  const sortOptions: SortOption<SortBy>[] = [
    { value: 'relevance', label: t('sort.relevance') },
    { value: 'rating', label: t('sort.rating') },
    { value: 'price-asc', label: t('sort.priceAsc') },
    { value: 'price-desc', label: t('sort.priceDesc') },
    { value: 'newest', label: t('sort.newest') },
    { value: 'students', label: t('sort.students') },
  ];

  function toggleDropdown(id: string) {
    setOpenDropdown((prev) => (prev === id ? null : id));
  }

  const hasActiveFilters = !!(
    category || level || minRating ||
    priceRange[0] !== 0 || priceRange[1] !== 500 ||
    durationRange[0] !== 0 || durationRange[1] !== 600
  );

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative py-12 sm:py-16 lg:py-32 overflow-hidden">
        {/* Chevron SVGs with color gradient rectangles behind — hidden on mobile, smaller on tablet */}
        <div className="hidden sm:flex absolute left-4 sm:left-10 lg:left-20 top-1/2 -translate-y-1/2 items-center">
          <img src="/iconBlue.svg" alt="" className="relative z-10 w-28 sm:w-36 lg:w-56 h-auto" />
          <div className="absolute left-14 sm:left-18 lg:left-23 top-1/2 h-8/10 bottom-0 w-[40vw] bg-linear-to-r from-mx-blue/60 to-transparent blur-sm pointer-events-none -translate-y-1/2" />
        </div>
        <div className="hidden sm:flex absolute right-4 sm:right-10 lg:right-20 top-1/2 -translate-y-1/2 items-center">
          <img src="/iconOrange.svg" alt="" className="relative z-10 w-28 sm:w-36 lg:w-56 h-auto" />
          <div className="absolute right-14 sm:right-18 lg:right-23 h-8/10 top-1/2 bottom-0 w-[40vw] bg-linear-to-l from-mx-orange/60 to-transparent blur-sm pointer-events-none -translate-y-1/2" />
        </div>

        <div className="relative z-10 text-center px-6">
          <h1 className="text-heading-md sm:text-heading-lg lg:text-display-sm 2xl:text-display-md font-black tracking-tight text-white mb-3 lg:mb-4">
            {t('courses.title')}
          </h1>
          <p className="text-white/50 text-label-md sm:text-body-sm lg:text-body-md 2xl:text-body-lg max-w-xl mx-auto">
            {t('courses.subtitle')}
          </p>
        </div>
      </section>

      {/* ── Filters Bar ── */}
      <div className="max-w-[1800px] mx-auto px-4 md:px-8 lg:px-32" ref={filtersRef}>
        <FilterBar
          variant="dark"
          filtersExpanded={filtersExpanded}
          onToggleFilters={() => {
            setFiltersExpanded((prev) => !prev);
            if (filtersExpanded) setOpenDropdown(null);
          }}
          hasActiveFilters={hasActiveFilters}
          filtersLabel={t('filter.filters')}
          resultsCount={filteredCourses.length}
          resultsLabel={t('courses.showingResults').replace('{n}', String(filteredCourses.length))}
          sortSlot={
            <SortDropdown<SortBy>
              options={sortOptions}
              value={sortBy}
              onChange={(v) => {
                setSortBy(v);
                setOpenDropdown(null);
              }}
              isOpen={openDropdown === 'sort'}
              onToggle={() => toggleDropdown('sort')}
              sortLabel={t('sort.label')}
              variant="dark"
            />
          }
          paginationSlot={
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-full flex items-center justify-center border border-white/10 text-white/50 hover:border-white/20 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-white/60 text-body-sm px-2 tabular-nums">
                {currentPage}/{totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-full flex items-center justify-center border border-white/10 text-white/50 hover:border-white/20 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          }
          searchSlot={
            <div className="relative w-full">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('campus.searchPlaceholder')}
                className="pl-9 pr-4 py-1.5 rounded-full text-body-sm bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#527be7]/50  transition-all w-full"
              />
            </div>
          }
        >
          <FilterDropdown
            id="category"
            icon={<LayoutGrid size={14} />}
            label={t('filter.category')}
            options={categoryOptions}
            value={category}
            onChange={(v) => setCategory(v as MaxymiaCategory | null)}
            isOpen={openDropdown === 'category'}
            onToggle={() => toggleDropdown('category')}
            variant="dark"
          />
          <RangeFilterDropdown
            id="price"
            icon={<Tag size={14} />}
            label={t('filter.price')}
            min={0}
            max={500}
            step={10}
            value={priceRange}
            onChange={setPriceRange}
            formatValue={(v) => `${v}\u20AC`}
            isOpen={openDropdown === 'price'}
            onToggle={() => toggleDropdown('price')}
            variant="dark"
          />
          <FilterDropdown
            id="level"
            icon={<BarChart3 size={14} />}
            label={t('filter.level')}
            options={levelOptions}
            value={level}
            onChange={(v) => setLevel(v as MaxymiaLevel | null)}
            isOpen={openDropdown === 'level'}
            onToggle={() => toggleDropdown('level')}
            variant="dark"
          />
          <RangeFilterDropdown
            id="duration"
            icon={<Hourglass size={14} />}
            label={t('filter.duration')}
            min={0}
            max={600}
            step={30}
            value={durationRange}
            onChange={setDurationRange}
            formatValue={(v) => v < 60 ? `${v}min` : `${Math.floor(v / 60)}h${v % 60 ? ` ${v % 60}min` : ''}`}
            isOpen={openDropdown === 'duration'}
            onToggle={() => toggleDropdown('duration')}
            variant="dark"
          />
          <FilterDropdown
            id="rating"
            icon={<Star size={14} />}
            label={t('filter.rating')}
            options={ratingOptions}
            value={minRating !== null ? String(minRating) : null}
            onChange={(v) => setMinRating(v ? parseInt(v) : null)}
            isOpen={openDropdown === 'rating'}
            onToggle={() => toggleDropdown('rating')}
            variant="dark"
          />
        </FilterBar>
      </div>

      {/* ── Course Grid ── */}
      <div className="max-w-[1800px] mx-auto px-4 md:px-8 lg:px-32 pb-16">
        {paginatedCourses.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
            {paginatedCourses.map((course, idx) => (
              <MaxymiaCourseCard
                key={course.id}
                course={course}
                locale={locale}
                progress={courseProgress[course.id] ? { courseId: course.id, completedLessons: courseProgress[course.id].completedLessons, currentLessonId: courseProgress[course.id].currentLessonId, examResults: {}, startedAt: courseProgress[course.id].startedAt ?? '', lastAccessedAt: courseProgress[course.id].lastAccessedAt ?? '' } : undefined}
                enrolled={hasAccess(course.id) || !!courseProgress[course.id]}
                index={idx}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-white/40 text-body-sm">{t('campus.noResults')}</p>
          </div>
        )}

        {/* ── Bottom Pagination (dots) ── */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          variant="dark"
        />
      </div>
    </div>
  );
}
