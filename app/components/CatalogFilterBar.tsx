'use client';

import React, { useState } from 'react';
import { Search, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';
import { TopicFilterTrigger, TopicBadgesRow } from './TopicFilter';
import type { Topic } from '@/lib/strapi/types';

interface CatalogFilterBarProps {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  resultsCount: number;
  availableTopics: Topic[];
  selectedTopics: string[];
  setSelectedTopics: (topics: string[]) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const CatalogFilterBar: React.FC<CatalogFilterBarProps> = ({
  activeFilter,
  setActiveFilter,
  searchQuery,
  setSearchQuery,
  resultsCount,
  availableTopics,
  selectedTopics,
  setSelectedTopics,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const categories = ['Todos', 'Master', 'Curso'];
  const [topicsOpen, setTopicsOpen] = useState(false);

  const toggleTopic = (name: string) => {
    if (selectedTopics.includes(name)) {
      setSelectedTopics(selectedTopics.filter((t) => t !== name));
    } else {
      setSelectedTopics([...selectedTopics, name]);
    }
  };

  return (
    <div className="sticky top-24 z-30 bg-mx-bg/80 backdrop-blur-md py-6 mb-12 border-b border-mx-border">
      {/* Row 1: Type filters + Topic trigger + Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-3 py-1.5 md:px-6 md:py-2 rounded-full text-label-md md:text-body-sm font-medium transition-all duration-300 whitespace-nowrap ${
                activeFilter === cat
                  ? 'bg-mx-orange text-white'
                  : 'bg-mx-card text-mx-text-muted border border-mx-border hover:border-mx-orange/50'
              }`}
            >
              {cat}
            </button>
          ))}

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
        </div>

        <div className="flex items-center gap-4">
          {/* Pagination inline - desktop only */}
          {totalPages > 1 && (
            <div className="hidden md:flex items-center gap-1">
              <button
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-full border border-mx-border hover:border-mx-orange hover:bg-mx-orange/10 transition-all disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronsLeft size={14} />
              </button>
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-full border border-mx-border hover:border-mx-orange hover:bg-mx-orange/10 transition-all disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-label-md text-mx-text-muted px-2 whitespace-nowrap">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-full border border-mx-border hover:border-mx-orange hover:bg-mx-orange/10 transition-all disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronRight size={14} />
              </button>
              <button
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-full border border-mx-border hover:border-mx-orange hover:bg-mx-orange/10 transition-all disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronsRight size={14} />
              </button>
            </div>
          )}

          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-mx-text-muted group-focus-within:text-mx-orange transition-colors" size={18} />
            <input
              type="text"
              placeholder="Buscar programa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-mx-card border border-mx-border rounded-full pl-10 pr-4 py-2.5 text-body-sm focus:outline-none focus:border-mx-orange transition-colors text-mx-text placeholder:text-mx-text-muted/50"
            />
          </div>
        </div>
      </div>

      {/* Row 2: Collapsible topic badges */}
      {availableTopics.length > 0 && (
        <TopicBadgesRow
          isOpen={topicsOpen}
          topics={availableTopics}
          selectedTopics={selectedTopics}
          onToggle={toggleTopic}
        />
      )}

      {/* Results Count + Mobile Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-label-md text-mx-text-muted">
          MOSTRANDO {resultsCount} RESULTADOS
        </span>

        {/* Pagination - mobile only */}
        {totalPages > 1 && (
          <div className="flex md:hidden items-center gap-1">
            <button
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-full border border-mx-border hover:border-mx-orange hover:bg-mx-orange/10 transition-all disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronsLeft size={14} />
            </button>
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-full border border-mx-border hover:border-mx-orange hover:bg-mx-orange/10 transition-all disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-label-md text-mx-text-muted px-2 whitespace-nowrap">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-full border border-mx-border hover:border-mx-orange hover:bg-mx-orange/10 transition-all disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight size={14} />
            </button>
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-full border border-mx-border hover:border-mx-orange hover:bg-mx-orange/10 transition-all disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronsRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
