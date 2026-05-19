'use client';

import React from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { RESOURCE_CATEGORY_BY_KEY } from '@/lib/resource-categories-meta';
import type { ResourceCategory } from '@/lib/strapi/types';

export interface CategoryFilter {
  value: string;
  count: number;
}

interface ResourcesFilterBarProps {
  categories: CategoryFilter[];
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  resultsCount: number;
}

export const ResourcesFilterBar: React.FC<ResourcesFilterBarProps> = ({
  categories,
  activeFilter,
  setActiveFilter,
  searchQuery,
  setSearchQuery,
  resultsCount,
}) => {
  return (
    <div className="sticky top-20 z-30 bg-mx-bg/80 backdrop-blur-md py-6 mb-10 border-b border-mx-border">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {categories.map((cat) => {
            const isActive = activeFilter === cat.value;
            const className = `px-5 py-2 rounded-full text-body-sm font-medium transition-all duration-300 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              isActive
                ? 'bg-mx-orange text-white'
                : 'bg-mx-card text-mx-text-muted border border-mx-border hover:border-mx-orange/30'
            }`;
            const inner = (
              <>
                <span>{cat.value}</span>
                <span
                  className={`inline-flex items-center justify-center min-w-[1.25rem] px-1.5 py-0.5 rounded-full text-label-sm font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-mx-bg text-mx-text-muted'
                  }`}
                >
                  {cat.count}
                </span>
              </>
            );
            // Real <Link> for categories with their own landing page so Googlebot
            // discovers them; onClick intercept preserves in-place filter UX.
            const landingSlug = RESOURCE_CATEGORY_BY_KEY.get(cat.value as ResourceCategory)?.slug;
            if (landingSlug) {
              return (
                <Link
                  key={cat.value}
                  href={`/recursos/categoria/${landingSlug}`}
                  onClick={(e) => {
                    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
                    e.preventDefault();
                    setActiveFilter(cat.value);
                  }}
                  className={className}
                >
                  {inner}
                </Link>
              );
            }
            return (
              <button
                key={cat.value}
                onClick={() => setActiveFilter(cat.value)}
                className={className}
              >
                {inner}
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-72 group">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-mx-text-muted group-focus-within:text-mx-orange transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder="Buscar recurso..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-mx-card border border-mx-border rounded-full pl-10 pr-4 py-2.5 text-body-sm focus:outline-none focus:border-mx-orange transition-colors text-mx-text placeholder:text-mx-text-muted/50"
          />
        </div>
      </div>

      <div className="mt-3 text-label-sm md:text-label-md text-mx-text-muted font-medium tracking-wider uppercase">
        Mostrando {resultsCount} resultados
      </div>
    </div>
  );
};
