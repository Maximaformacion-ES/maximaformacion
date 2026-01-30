'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';
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
    <div className="sticky top-24 z-30 bg-black/80 backdrop-blur-md py-6 mb-12 border-b border-white/10">
      {/* Row 1: Type filters + Topic trigger + Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-3 py-1.5 md:px-6 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                activeFilter === cat
                  ? 'bg-amber-500 text-white'
                  : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
              }`}
            >
              {cat}
            </button>
          ))}

          {availableTopics.length > 0 && (
            <>
              <div className="w-px h-6 bg-white/10 mx-1" />
              <TopicFilterTrigger
                isOpen={topicsOpen}
                toggle={() => setTopicsOpen(!topicsOpen)}
                selectedCount={selectedTopics.length}
              />
            </>
          )}
        </div>

        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-amber-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Buscar programa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-full pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition-colors text-white placeholder:text-neutral-600"
          />
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

      {/* Results Count */}
      <div className="mt-4 text-xs text-neutral-500 font-mono">
        MOSTRANDO {resultsCount} RESULTADOS
      </div>
    </div>
  );
};
