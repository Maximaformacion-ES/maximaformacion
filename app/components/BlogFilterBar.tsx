'use client';

import React from 'react';
import { Search } from 'lucide-react';

interface BlogFilterBarProps {
  categories: string[];
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  resultsCount: number;
}

export const BlogFilterBar: React.FC<BlogFilterBarProps> = ({
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

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-5 py-2 rounded-full text-body-sm font-medium transition-all duration-300 whitespace-nowrap cursor-pointer ${
                activeFilter === cat
                  ? 'bg-mx-orange text-white'
                  : 'bg-mx-card text-mx-text-muted border border-mx-border hover:border-mx-orange/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72 group">
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

      {/* Results Count */}
      <div className="mt-3 text-label-sm md:text-label-md text-mx-text-muted font-medium tracking-wider uppercase">
        Mostrando {resultsCount} resultados
      </div>
    </div>
  );
};
