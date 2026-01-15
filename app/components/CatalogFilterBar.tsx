'use client';

import React from 'react';
import { Search } from 'lucide-react';

interface CatalogFilterBarProps {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  resultsCount: number;
}

export const CatalogFilterBar: React.FC<CatalogFilterBarProps> = ({
  activeFilter,
  setActiveFilter,
  searchQuery,
  setSearchQuery,
  resultsCount,
}) => {
  const categories = ['Todos', 'Master', 'Curso'];

  return (
    <div className="sticky top-24 z-30 bg-black/80 backdrop-blur-md py-6 mb-12 border-b border-white/10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                activeFilter === cat 
                  ? 'bg-amber-500 text-white' 
                  : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
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
      
      {/* Results Count */}
      <div className="mt-4 text-xs text-neutral-500 font-mono">
        MOSTRANDO {resultsCount} RESULTADOS
      </div>
    </div>
  );
};
