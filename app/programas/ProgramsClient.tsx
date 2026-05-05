'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { m } from 'framer-motion';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Tag,
  Monitor,
  Hourglass,
  Star,
} from 'lucide-react';
import { FontStyles } from '../components/FontStyles';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { CatalogHeader } from '../components/CatalogHeader';
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

const ITEMS_PER_PAGE = 9;

interface ProgramsClientProps {
  initialPrograms: Program[];
  availableTopics: Topic[];
}

export default function ProgramsClient({ initialPrograms, availableTopics }: ProgramsClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isSignedIn } = useUser();
  const { hasPro } = useUserCampus();
  const userHasPro = !!isSignedIn && hasPro;

  // Filter state
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [formatFilter, setFormatFilter] = useState<string | null>(null);
  const [ratingFilter, setRatingFilter] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [durationRange, setDurationRange] = useState<[number, number]>([0, 2000]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [topicsOpen, setTopicsOpen] = useState(false);
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
  }, [search, typeFilter, formatFilter, ratingFilter, priceRange, durationRange, selectedTopics, sortBy]);

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

    // Type
    if (typeFilter) {
      result = result.filter(p => p.type === typeFilter);
    }

    // Format
    if (formatFilter) {
      result = result.filter(p => p.format === formatFilter);
    }

    // Rating
    if (ratingFilter) {
      const minRating = parseInt(ratingFilter);
      result = result.filter(p => (p.price ?? 0) >= 0 && minRating >= 0); // Programs don't have ratings yet, pass through
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
  }, [initialPrograms, search, typeFilter, formatFilter, ratingFilter, priceRange, durationRange, selectedTopics, sortBy]);

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

  const ratingOptions: FilterOption[] = [
    { value: 'all', label: 'Todas' },
    { value: '4', label: '4+ estrellas' },
    { value: '3', label: '3+ estrellas' },
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
    typeFilter || formatFilter || ratingFilter || selectedTopics.length > 0 ||
    priceRange[0] !== 0 || priceRange[1] !== 5000 ||
    durationRange[0] !== 0 || durationRange[1] !== 2000
  );

  return (
    <div className="min-h-screen bg-mx-bg text-mx-text overflow-x-hidden">
      <FontStyles />

      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      <main className="pt-32 pb-24 px-6 md:px-12 max-w-[1800px] mx-auto relative z-10">
        <CatalogHeader />

        <m.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="sticky top-24 z-30 bg-mx-bg/80 backdrop-blur-md py-6 mb-12" ref={filtersRef}>
            <FilterBar
              variant="light"
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
                totalPages > 1 ? (
                  <div className="hidden md:flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="w-8 h-8 rounded-full flex items-center justify-center border border-mx-border text-mx-text-muted hover:border-mx-blue/50 hover:text-mx-text disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <span className="text-mx-text-muted text-body-sm px-2 tabular-nums">
                      {currentPage}/{totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="w-8 h-8 rounded-full flex items-center justify-center border border-mx-border text-mx-text-muted hover:border-mx-blue/50 hover:text-mx-text disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                ) : null
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
              <FilterDropdown
                id="rating"
                icon={<Star size={14} />}
                label="Valoración"
                options={ratingOptions}
                value={ratingFilter}
                onChange={setRatingFilter}
                isOpen={openDropdown === 'rating'}
                onToggle={() => toggleDropdown('rating')}
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
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <CatalogGrid
            programs={paginatedPrograms}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </m.div>
      </main>

      <Footer />
    </div>
  );
}
