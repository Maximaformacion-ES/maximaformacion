'use client';

import { useSearchParams } from 'next/navigation';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Tag,
  BarChart3,
  Hourglass,
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
import { normalizeForSearch } from '@/lib/normalize-search';

// ─── Types ──────────────────────────────────────────────────────────

type SortBy = 'relevance' | 'price-asc' | 'price-desc' | 'newest';

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
  // El buscador de la barra superior del campus llega como ?q=…
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') ?? '';
  const [search, setSearch] = useState(initialQ);
  // Si se vuelve a buscar desde la barra superior estando ya en el catálogo,
  // sincroniza (ajuste de estado durante el render al cambiar la prop).
  const [prevQ, setPrevQ] = useState(initialQ);
  if (initialQ !== prevQ) {
    setPrevQ(initialQ);
    setSearch(initialQ);
  }
  const [category, setCategory] = useState<MaxymiaCategory | null>(null);
  const [level, setLevel] = useState<MaxymiaLevel | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [durationRange, setDurationRange] = useState<[number, number]>([0, 600]);
  const [sortBy, setSortBy] = useState<SortBy>('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Al cambiar cualquier filtro volvemos a la página 1. Ajuste de estado durante
  // el render (patrón de React para "resetear estado cuando cambian unas props")
  // en vez de un efecto con setState síncrono; comparamos una clave compuesta.
  const filterKey = `${search}|${category}|${level}|${priceRange[0]}-${priceRange[1]}|${durationRange[0]}-${durationRange[1]}|${sortBy}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setCurrentPage(1);
  }

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

  // Memoize course metadata
  const coursesWithMeta = useMemo(
    () => courses.map((c) => ({ course: c, meta: getCourseMeta(c) })),
    [courses]
  );

  // Filter & sort
  const filteredCourses = useMemo(() => {
    let result = [...coursesWithMeta];

    // Search (insensible a mayúsculas y tildes: "estadistica" → "Estadística")
    if (search) {
      const q = normalizeForSearch(search);
      result = result.filter(
        ({ course }) =>
          normalizeForSearch(course.title.es).includes(q) ||
          normalizeForSearch(course.title.en).includes(q) ||
          course.tags.some((tag) => normalizeForSearch(tag).includes(q))
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

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.course.price - b.course.price;
        case 'price-desc':
          return b.course.price - a.course.price;
        case 'newest':
          return (
            new Date(b.course.createdAt ?? 0).getTime() -
            new Date(a.course.createdAt ?? 0).getTime()
          );
        default:
          return 0; // relevance = original order
      }
    });

    return result.map(({ course }) => course);
  }, [coursesWithMeta, search, category, level, priceRange, durationRange, sortBy]);

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

  const sortOptions: SortOption<SortBy>[] = [
    { value: 'relevance', label: t('sort.relevance') },
    { value: 'price-asc', label: t('sort.priceAsc') },
    { value: 'price-desc', label: t('sort.priceDesc') },
    { value: 'newest', label: t('sort.newest') },
  ];

  function toggleDropdown(id: string) {
    setOpenDropdown((prev) => (prev === id ? null : id));
  }

  const hasActiveFilters = !!(
    category || level ||
    priceRange[0] !== 0 || priceRange[1] !== 500 ||
    durationRange[0] !== 0 || durationRange[1] !== 600
  );

  return (
    <div>
      {/* ── Cabecera de página ── */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-heading-md md:text-heading-lg font-black tracking-tight text-mx-blue">
            {t('courses.title')}
          </h1>
          <p className="text-mx-text-muted text-body-sm mt-1 max-w-xl">
            {t('courses.subtitle')}
          </p>
        </div>
      </div>

      {/* ── Filters Bar ── */}
      <div className="w-full" ref={filtersRef}>
        <FilterBar
          variant="light"
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
              variant="light"
            />
          }
          paginationSlot={
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-full flex items-center justify-center border border-mx-border bg-mx-card text-mx-text-muted hover:border-mx-orange/40 hover:text-mx-text disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-mx-text-muted text-body-sm px-2 tabular-nums">
                {currentPage}/{totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-full flex items-center justify-center border border-mx-border bg-mx-card text-mx-text-muted hover:border-mx-orange/40 hover:text-mx-text disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          }
          searchSlot={
            <div className="relative w-full">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-mx-text-muted"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('campus.searchPlaceholder')}
                className="pl-9 pr-4 py-2 rounded-lg text-body-sm bg-mx-card border border-mx-border text-mx-text placeholder:text-mx-text-muted focus:outline-none focus:ring-2 focus:ring-mx-orange/40 transition-all w-full"
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
            variant="light"
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
            variant="light"
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
            variant="light"
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
            variant="light"
          />
        </FilterBar>
      </div>

      {/* ── Course Grid ── */}
      <div className="w-full pb-8">
        {paginatedCourses.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
            {paginatedCourses.map((course, idx) => (
              <MaxymiaCourseCard
                key={course.id}
                course={course}
                locale={locale}
                progress={courseProgress[course.id] ? { courseId: course.id, completedLessons: courseProgress[course.id].completedLessons, currentLessonId: courseProgress[course.id].currentLessonId, examResults: {}, startedAt: courseProgress[course.id].startedAt ?? '', lastAccessedAt: courseProgress[course.id].lastAccessedAt ?? '' } : undefined}
                enrolled={hasAccess(course.id, course.isPro) || !!courseProgress[course.id]}
                index={idx}
                light
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-mx-border bg-mx-card p-10 text-center">
            <Search className="mx-auto text-mx-text-muted mb-3" size={28} />
            <p className="text-mx-text-muted text-body-sm">{t('campus.noResults')}</p>
          </div>
        )}

        {/* ── Bottom Pagination (dots) ── */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          variant="light"
        />
      </div>
    </div>
  );
}
