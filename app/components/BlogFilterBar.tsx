'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { getCategoryStyle } from '@/lib/blog-categories';

interface BlogFilterBarProps {
  categories: string[];
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  resultsCount: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const BlogFilterBar: React.FC<BlogFilterBarProps> = ({
  categories,
  activeFilter,
  setActiveFilter,
  searchQuery,
  setSearchQuery,
  resultsCount,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hrefForPage = (page: number) => {
    const sp = new URLSearchParams(searchParams?.toString() ?? '');
    if (page <= 1) sp.delete('page'); else sp.set('page', String(page));
    const qs = sp.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };
  return (
    <div className="sticky top-20 z-30 bg-mx-bg/80 backdrop-blur-md py-6 mb-10 border-b border-mx-border">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {categories.map(cat => {
            const isActive = activeFilter === cat;
            const isAll = cat === 'Todos';
            const style = getCategoryStyle(cat);
            return (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-body-sm font-medium transition-all duration-300 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? `${style.filterActiveBg} ${style.filterActiveText}`
                    : 'bg-mx-card text-mx-text-muted border border-mx-border hover:border-mx-orange/30'
                }`}
              >
                {!isAll && (
                  <span
                    className={`block w-2 h-2 rounded-full ${
                      isActive ? 'bg-white/70' : style.dot
                    }`}
                    aria-hidden="true"
                  />
                )}
                {cat}
              </button>
            );
          })}
        </div>

        {/* Right cluster: compact pagination + search */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Compact pagination (desktop only) — real <Link> hrefs so
              Googlebot can follow paginated URLs from the initial HTML. */}
          {totalPages > 1 && (
            <div className="hidden md:flex items-center gap-1 shrink-0">
              {currentPage > 1 ? (
                <Link
                  href={hrefForPage(currentPage - 1)}
                  aria-label="Página anterior"
                  rel="prev"
                  onClick={(e) => { e.preventDefault(); onPageChange(currentPage - 1); }}
                  className="w-8 h-8 rounded-full flex items-center justify-center border border-mx-border text-mx-text-muted hover:border-mx-orange hover:text-mx-orange transition-all"
                >
                  <ChevronLeft size={14} />
                </Link>
              ) : (
                <span className="w-8 h-8 rounded-full flex items-center justify-center border border-mx-border text-mx-text-muted opacity-30">
                  <ChevronLeft size={14} />
                </span>
              )}
              <span className="text-mx-text-muted text-body-sm px-2 tabular-nums whitespace-nowrap">
                {currentPage}/{totalPages}
              </span>
              {currentPage < totalPages ? (
                <Link
                  href={hrefForPage(currentPage + 1)}
                  aria-label="Página siguiente"
                  rel="next"
                  onClick={(e) => { e.preventDefault(); onPageChange(currentPage + 1); }}
                  className="w-8 h-8 rounded-full flex items-center justify-center border border-mx-border text-mx-text-muted hover:border-mx-orange hover:text-mx-orange transition-all"
                >
                  <ChevronRight size={14} />
                </Link>
              ) : (
                <span className="w-8 h-8 rounded-full flex items-center justify-center border border-mx-border text-mx-text-muted opacity-30">
                  <ChevronRight size={14} />
                </span>
              )}
            </div>
          )}

          {/* Search Input */}
          <div className="relative flex-1 md:flex-none md:w-72 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-mx-text-muted group-focus-within:text-mx-orange transition-colors" size={18} />
            <input
              type="text"
              placeholder="Buscar artículo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-mx-card border border-mx-border rounded-full pl-10 pr-4 py-2.5 text-body-sm focus:outline-none focus:border-mx-orange transition-colors text-mx-text placeholder:text-mx-text-muted/50"
            />
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mt-3 text-label-sm md:text-label-md text-mx-text-muted font-medium tracking-wider uppercase">
        Mostrando {resultsCount} resultados
      </div>
    </div>
  );
};
