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
  leadingSlot,
  sortSlot,
  paginationSlot,
  searchSlot,
  secondaryRow,
  resultsCount,
  resultsLabel,
  children,
}: FilterBarProps) {
  const tc = themeClasses[variant];

  const defaultResultsLabel = resultsLabel
    ?? `Mostrando ${resultsCount} resultados`;

  return (
    <div>
      {/* Search on top for mobile */}
      {searchSlot && (
        <div className="md:hidden pb-4">
          {searchSlot}
        </div>
      )}

      {/* Top row: (leading) + Filtros + Sort + Pagination + Search */}
      <div className="flex items-center justify-between gap-4 pb-4">
        {/* Left: optional leading slot + filter toggle + sort */}
        <div className="flex flex-wrap items-center gap-2">
          {leadingSlot}
          <button
            onClick={onToggleFilters}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-body-sm transition-all ${
              filtersExpanded || hasActiveFilters ? tc.btnActive : tc.btn
            }`}
          >
            <SlidersHorizontal size={14} />
            <span>{filtersLabel}</span>
          </button>

          {sortSlot}
        </div>

        {/* Right: pagination + search (hidden on mobile, search shown above) */}
        <div className="hidden md:flex items-center gap-3 w-1/3">
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

      {/* Secondary row (e.g. category chips) */}
      {secondaryRow && <div className="pb-4">{secondaryRow}</div>}

      <div className={`border-b ${tc.divider}`} />

      {/* Results counter */}
      <div className="py-5">
        <p className={`${tc.resultsText} text-label-md tracking-[0.3em] uppercase`}>
          {defaultResultsLabel}
        </p>
      </div>
    </div>
  );
}
