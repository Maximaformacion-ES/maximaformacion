'use client';

import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { themeClasses } from './types';
import type { FilterBarProps } from './types';

export function FilterBar({
  variant = 'dark',
  filtersExpanded,
  onToggleFilters,
  hasActiveFilters = false,
  filtersLabel = 'Filtros',
  sortSlot,
  paginationSlot,
  searchSlot,
  resultsCount,
  resultsLabel,
  children,
}: FilterBarProps) {
  const tc = themeClasses[variant];

  const defaultResultsLabel = resultsLabel
    ?? `Mostrando ${resultsCount} resultados`;

  return (
    <div>
      {/* Top row: Filtros + Sort + Pagination + Search */}
      <div className="flex items-center justify-between gap-4 pb-4">
        {/* Left: filter toggle + sort */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleFilters}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
              filtersExpanded || hasActiveFilters ? tc.btnActive : tc.btn
            }`}
          >
            <SlidersHorizontal size={14} />
            <span>{filtersLabel}</span>
          </button>

          {sortSlot}
        </div>

        {/* Right: pagination + search */}
        <div className="flex items-center gap-3 w-1/3">
          {paginationSlot}
          {searchSlot}
        </div>
      </div>

      {/* Expanded filter pills row */}
      <AnimatePresence>
        {filtersExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
            animate={{ opacity: 1, height: 'auto', overflow: 'visible', transitionEnd: { overflow: 'visible' } }}
            exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <div className="flex flex-wrap items-center gap-2 pb-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`border-b ${tc.divider}`} />

      {/* Results counter */}
      <div className="py-5">
        <p className={`${tc.resultsText} text-xs tracking-[0.3em] uppercase`}>
          {defaultResultsLabel}
        </p>
      </div>
    </div>
  );
}
