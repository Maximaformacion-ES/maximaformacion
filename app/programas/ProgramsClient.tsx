'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { m } from 'framer-motion';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Tag,
  Monitor,
  Hourglass,
} from 'lucide-react';
import { FontStyles } from '../components/FontStyles';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { CatalogGrid } from '../components/CatalogGrid';
import { TopicFilterTrigger, TopicBadgesRow } from '../components/TopicFilter';
import {
  FilterBar,
  FilterDropdown,
  RangeFilterDropdown,
  SortDropdown,
} from '@/app/components/filters';
import type { FilterOption, SortOption } from '@/app/components/filters';
import type { Program, Topic } from '@/lib/strapi/types';
import { trackViewItemList } from '@/lib/analytics';
import { useUser } from '@clerk/nextjs';
import { useUserCampus } from '@/app/hooks/useUserCampus';
import { getEffectivePrice } from '@/lib/pricing';

type SortBy = 'relevance' | 'price-asc' | 'price-desc' | 'newest';

// 12 is the LCM of 2, 3 and 4, so a full page fills the grid cleanly at
// every breakpoint (md=2 cols, lg=3 cols, 2xl=4 cols). With the previous 9
// per page, the 4-column layout left a single card alone on the last row.
const ITEMS_PER_PAGE = 12;

interface ProgramsClientProps {
  initialPrograms: Program[];
  availableTopics: Topic[];
  /** Initial page number from URL ?page=N (server-rendered). */
  initialPage?: number;
}

// Mapeo de valores de URL → valor real del filtro. URLSearchParams decodifica
// los `+` como espacios al leer, así que las keys aceptadas son el nombre
// completo en minúsculas (con espacios) o un slug corto.
const AREA_FROM_URL: Record<string, string> = {
  // forma canónica (espacios)
  'inteligencia artificial': 'Inteligencia Artificial',
  'ciencia de datos': 'Ciencia de Datos',
  'salud basada en datos': 'Salud basada en datos',
  'moodle / exelearning / h5p': 'Moodle / Exelearning / H5P',
  // aliases cortos
  'ia': 'Inteligencia Artificial',
  'datos': 'Ciencia de Datos',
  'salud': 'Salud basada en datos',
  'moodle': 'Moodle / Exelearning / H5P',
  'elearning': 'Moodle / Exelearning / H5P',
  'e-learning': 'Moodle / Exelearning / H5P',
};

function resolveArea(raw: string | null): string | null {
  if (!raw) return null;
  return AREA_FROM_URL[raw.trim().toLowerCase()] ?? null;
}

function resolveType(raw: string | null): 'all' | 'Curso' | 'Master' {
  if (!raw) return 'all';
  const k = raw.trim().toLowerCase();
  if (k === 'master' || k === 'masters' || k === 'máster' || k === 'másteres') return 'Master';
  if (k === 'curso' || k === 'cursos') return 'Curso';
  return 'all';
}

export default function ProgramsClient({ initialPrograms, availableTopics, initialPage = 1 }: ProgramsClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isSignedIn } = useUser();
  const { hasPro } = useUserCampus();
  const userHasPro = !!isSignedIn && hasPro;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read URL params on first render to seed filters (mega-menu links land here).
  const initialArea = resolveArea(searchParams.get('area'));
  const initialType = resolveType(searchParams.get('type'));

  // Filter state
  const [search, setSearch] = useState('');
  const [activeTypeTab, setActiveTypeTab] = useState<'all' | 'Curso' | 'Master'>(initialType);
  const [subjectAreaFilter, setSubjectAreaFilter] = useState<string | null>(initialArea);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [formatFilter, setFormatFilter] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [durationRange, setDurationRange] = useState<[number, number]>([0, 2000]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>('relevance');
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [topicsOpen, setTopicsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // URL-aware page navigation — keeps URL in sync with currentPage so Google
  // sees real ?page=N URLs and users can share/bookmark deep pages.
  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
    const sp = new URLSearchParams(searchParams.toString());
    if (page <= 1) sp.delete('page'); else sp.set('page', String(page));
    const qs = sp.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pathname, router, searchParams]);

  // Filter handlers that ALSO update URL so chip state, mega-menu links and
  // browser back/forward all stay in sync.
  const handleSubjectAreaClick = useCallback((key: string | null) => {
    setSubjectAreaFilter(key);
    const sp = new URLSearchParams(searchParams.toString());
    if (key) sp.set('area', key); else sp.delete('area');
    sp.delete('page');
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const handleTypeTabClick = useCallback((key: 'all' | 'Curso' | 'Master') => {
    setActiveTypeTab(key);
    const sp = new URLSearchParams(searchParams.toString());
    if (key === 'all') sp.delete('type'); else sp.set('type', key);
    sp.delete('page');
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

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

  // Reset page when filters change. Only strip `?page=` from URL; keep
  // `?area=` y `?type=` para que coincidan con los chips visibles.
  useEffect(() => {
    setCurrentPage(1);
    if (typeof window !== 'undefined' && window.location.search.includes('page=')) {
      const sp = new URLSearchParams(window.location.search);
      sp.delete('page');
      const qs = sp.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, activeTypeTab, subjectAreaFilter, typeFilter, formatFilter, priceRange, durationRange, selectedTopics, sortBy]);

  // Sync filters when the URL params change (e.g., user clicks a mega-menu
  // link while already on /programas — SPA navigation doesn't remount the
  // component, so useState initializers don't re-run).
  useEffect(() => {
    const urlArea = resolveArea(searchParams.get('area'));
    const urlType = resolveType(searchParams.get('type'));
    setSubjectAreaFilter(urlArea);
    setActiveTypeTab(urlType);
  }, [searchParams]);

  // Filter & sort
  const filteredPrograms = useMemo(() => {
    let result = [...initialPrograms];

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q)) ||
        p.topics?.some(t => t.name.toLowerCase().includes(q))
      );
    }

    // Type tab (Master vs Curso)
    if (activeTypeTab !== 'all') {
      result = result.filter(p => p.type === activeTypeTab);
    }

    // Subject area
    if (subjectAreaFilter) {
      result = result.filter(p => p.subjectArea === subjectAreaFilter);
    }

    // Type (legacy filter — kept for backwards compat)
    if (typeFilter) {
      result = result.filter(p => p.type === typeFilter);
    }

    // Format
    if (formatFilter) {
      result = result.filter(p => p.format === formatFilter);
    }

    // Price range
    if (priceRange[0] !== 0 || priceRange[1] !== 5000) {
      result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    }

    // Duration range
    if (durationRange[0] !== 0 || durationRange[1] !== 2000) {
      result = result.filter(p => p.duration >= durationRange[0] && p.duration <= durationRange[1]);
    }

    // Topics
    if (selectedTopics.length > 0) {
      result = result.filter(p => p.topics?.some(t => selectedTopics.includes(t.name)));
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'newest':
          return new Date(b.startDate ?? 0).getTime() - new Date(a.startDate ?? 0).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [initialPrograms, search, activeTypeTab, subjectAreaFilter, typeFilter, formatFilter, priceRange, durationRange, selectedTopics, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredPrograms.length / ITEMS_PER_PAGE));
  const paginatedPrograms = filteredPrograms.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // GA4 view_item_list — emits whenever the visible page of programs changes
  useEffect(() => {
    if (paginatedPrograms.length === 0) return;
    trackViewItemList(
      paginatedPrograms.map((p, idx) => ({
        item_id: p.slug,
        item_name: p.title,
        item_category: p.type,
        price: getEffectivePrice(p, userHasPro),
        index: (currentPage - 1) * ITEMS_PER_PAGE + idx,
      })),
      'Catálogo de programas',
      'programas'
    );
  }, [paginatedPrograms, currentPage, userHasPro]);

  // Options
  const typeOptions: FilterOption[] = [
    { value: 'all', label: 'Todos' },
    { value: 'Master', label: 'Master' },
    { value: 'Curso', label: 'Curso' },
  ];

  const formatOptions: FilterOption[] = [
    { value: 'all', label: 'Todos' },
    { value: 'Online', label: 'Online' },
    { value: 'Presencial', label: 'Presencial' },
    { value: 'Híbrido', label: 'Híbrido' },
  ];

  const sortOptions: SortOption<SortBy>[] = [
    { value: 'relevance', label: 'Relevancia' },
    { value: 'price-asc', label: 'Precio: menor a mayor' },
    { value: 'price-desc', label: 'Precio: mayor a menor' },
    { value: 'newest', label: 'Más recientes' },
  ];

  function toggleDropdown(id: string) {
    setOpenDropdown((prev) => (prev === id ? null : id));
  }

  function toggleTopic(name: string) {
    setSelectedTopics(prev =>
      prev.includes(name) ? prev.filter(t => t !== name) : [...prev, name]
    );
  }

  const hasActiveFilters = !!(
    typeFilter || formatFilter || selectedTopics.length > 0 ||
    priceRange[0] !== 0 || priceRange[1] !== 5000 ||
    durationRange[0] !== 0 || durationRange[1] !== 2000
  );

  // Type selector (Todos / Másteres / Cursos) — rendered inside the toolbar.
  const typeSelector = (
    <div className="inline-flex items-center gap-0.5 p-0.5 rounded-full border border-mx-border bg-mx-card">
      {([
        { key: 'all', label: 'Todos' },
        { key: 'Master', label: 'Másteres' },
        { key: 'Curso', label: 'Cursos' },
      ] as const).map(({ key, label }) => {
        const count =
          key === 'all'
            ? initialPrograms.length
            : initialPrograms.filter((p) => p.type === key).length;
        const active = activeTypeTab === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => handleTypeTabClick(key)}
            className={`px-3 py-1.5 rounded-full text-body-sm font-medium whitespace-nowrap transition-all ${
              active
                ? 'bg-mx-orange text-white shadow-sm'
                : 'text-mx-text-muted hover:text-mx-text'
            }`}
          >
            {label}
            <span className={`ml-1 ${active ? 'text-white/70' : 'text-mx-text-muted/60'}`}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );

  // Category chips — rendered as the toolbar's secondary row.
  const categoryStrip = (
    <div className="flex flex-wrap items-center gap-2">
      {([
        { key: null, label: 'Todas las áreas' },
        { key: 'Inteligencia Artificial', label: 'Inteligencia Artificial' },
        { key: 'Ciencia de Datos', label: 'Ciencia de Datos' },
        { key: 'Moodle / Exelearning / H5P', label: 'Moodle / Exelearning / H5P' },
        { key: 'Salud basada en datos', label: 'Salud basada en datos' },
      ] as const).map(({ key, label }) => {
        const active = subjectAreaFilter === key;
        return (
          <button
            key={key ?? 'all'}
            type="button"
            onClick={() => handleSubjectAreaClick(key)}
            className={`px-3 py-1.5 rounded-full text-label-sm md:text-label-md font-medium border transition-colors ${
              active
                ? 'bg-mx-blue text-white border-mx-blue'
                : 'bg-mx-card text-mx-text-muted border-mx-border hover:border-mx-blue/40 hover:text-mx-text'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-mx-bg text-mx-text overflow-x-hidden">
      <FontStyles />

      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      <main className="pt-32 pb-24 px-6 md:px-12 max-w-[1800px] mx-auto relative z-10">
        {/* Hero-style title — same typography as the old CatalogHeader hero,
            kept on a single line so the catalog stays visible on entry. */}
        <div className="mb-6">
          <m.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-display-sm md:text-display-md font-black leading-[0.9] text-mx-blue"
          >
            <span className="text-stroke text-mx-orange">Programas</span>
            <span className="ml-3 align-middle text-body-sm md:text-body-md font-light text-mx-text-muted">
              · {initialPrograms.length} cursos y másteres
            </span>
          </m.h1>
        </div>

        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="sticky top-24 z-30 bg-mx-bg/80 backdrop-blur-md py-4 mb-8" ref={filtersRef}>
            <FilterBar
              variant="light"
              leadingSlot={typeSelector}
              secondaryRow={categoryStrip}
              filtersExpanded={filtersExpanded}
              onToggleFilters={() => {
                setFiltersExpanded(prev => !prev);
                if (filtersExpanded) setOpenDropdown(null);
              }}
              hasActiveFilters={hasActiveFilters}
              filtersLabel="Filtros"
              resultsCount={filteredPrograms.length}
              resultsLabel={`MOSTRANDO ${filteredPrograms.length} RESULTADOS`}
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
                  sortLabel="Ordenar"
                  variant="light"
                />
              }
              paginationSlot={
                totalPages > 1 ? (() => {
                  // Build href for a given page number, preserving current
                  // search params except the new page. Real <Link href>
                  // elements so Googlebot can follow paginated URLs from
                  // the initial HTML (SEO audit requirement).
                  const hrefForPage = (n: number) => {
                    const sp = new URLSearchParams(searchParams.toString());
                    if (n <= 1) sp.delete('page'); else sp.set('page', String(n));
                    const qs = sp.toString();
                    return qs ? `${pathname}?${qs}` : pathname;
                  };
                  const prevPage = Math.max(1, currentPage - 1);
                  const nextPage = Math.min(totalPages, currentPage + 1);
                  return (
                    <div className="hidden md:flex items-center gap-1">
                      {currentPage > 1 ? (
                        <Link
                          href={hrefForPage(prevPage)}
                          aria-label="Página anterior"
                          rel="prev"
                          onClick={(e) => { e.preventDefault(); goToPage(prevPage); }}
                          className="w-8 h-8 rounded-full flex items-center justify-center border border-mx-border text-mx-text-muted hover:border-mx-blue/50 hover:text-mx-text transition-all"
                        >
                          <ChevronLeft size={14} />
                        </Link>
                      ) : (
                        <span className="w-8 h-8 rounded-full flex items-center justify-center border border-mx-border text-mx-text-muted opacity-30">
                          <ChevronLeft size={14} />
                        </span>
                      )}
                      <span className="text-mx-text-muted text-body-sm px-2 tabular-nums">
                        {currentPage}/{totalPages}
                      </span>
                      {currentPage < totalPages ? (
                        <Link
                          href={hrefForPage(nextPage)}
                          aria-label="Página siguiente"
                          rel="next"
                          onClick={(e) => { e.preventDefault(); goToPage(nextPage); }}
                          className="w-8 h-8 rounded-full flex items-center justify-center border border-mx-border text-mx-text-muted hover:border-mx-blue/50 hover:text-mx-text transition-all"
                        >
                          <ChevronRight size={14} />
                        </Link>
                      ) : (
                        <span className="w-8 h-8 rounded-full flex items-center justify-center border border-mx-border text-mx-text-muted opacity-30">
                          <ChevronRight size={14} />
                        </span>
                      )}
                    </div>
                  );
                })() : null
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
                    placeholder="Buscar programa..."
                    className="pl-9 pr-4 py-1.5 rounded-full text-body-sm bg-mx-card border border-mx-border text-mx-text placeholder:text-mx-text-muted/50 focus:outline-none focus:border-mx-blue transition-all w-full"
                  />
                </div>
              }
            >
              <FilterDropdown
                id="type"
                icon={<LayoutGrid size={14} />}
                label="Tipo"
                options={typeOptions}
                value={typeFilter}
                onChange={setTypeFilter}
                isOpen={openDropdown === 'type'}
                onToggle={() => toggleDropdown('type')}
                variant="light"
              />
              <RangeFilterDropdown
                id="price"
                icon={<Tag size={14} />}
                label="Precio"
                min={0}
                max={5000}
                step={100}
                value={priceRange}
                onChange={setPriceRange}
                formatValue={(v) => `${v}\u20AC`}
                isOpen={openDropdown === 'price'}
                onToggle={() => toggleDropdown('price')}
                variant="light"
              />
              <FilterDropdown
                id="format"
                icon={<Monitor size={14} />}
                label="Formato"
                options={formatOptions}
                value={formatFilter}
                onChange={setFormatFilter}
                isOpen={openDropdown === 'format'}
                onToggle={() => toggleDropdown('format')}
                variant="light"
              />
              <RangeFilterDropdown
                id="duration"
                icon={<Hourglass size={14} />}
                label="Duración"
                min={0}
                max={2000}
                step={50}
                value={durationRange}
                onChange={setDurationRange}
                formatValue={(v) => `${v}h`}
                isOpen={openDropdown === 'duration'}
                onToggle={() => toggleDropdown('duration')}
                variant="light"
              />
              {availableTopics.length > 0 && (
                <>
                  <div className="w-px h-6 bg-mx-border mx-1" />
                  <TopicFilterTrigger
                    isOpen={topicsOpen}
                    toggle={() => setTopicsOpen(!topicsOpen)}
                    selectedCount={selectedTopics.length}
                  />
                </>
              )}
            </FilterBar>

            {availableTopics.length > 0 && (
              <TopicBadgesRow
                isOpen={topicsOpen && filtersExpanded}
                topics={availableTopics}
                selectedTopics={selectedTopics}
                onToggle={toggleTopic}
              />
            )}
          </div>
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <CatalogGrid
            programs={paginatedPrograms}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
          />
        </m.div>
      </main>

      <Footer />
    </div>
  );
}
