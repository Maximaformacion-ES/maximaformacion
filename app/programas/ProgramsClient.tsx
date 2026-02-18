'use client';

import React, { useState, useMemo, useReducer } from 'react';
import { m } from 'framer-motion';
import { FontStyles } from '../components/FontStyles';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { CatalogHeader } from '../components/CatalogHeader';
import { CatalogFilterBar } from '../components/CatalogFilterBar';
import { CatalogGrid } from '../components/CatalogGrid';
import type { Program, Topic } from '@/lib/strapi/types';

interface FilterState {
  activeFilter: string;
  searchQuery: string;
  selectedTopics: string[];
  currentPage: number;
}

type FilterAction =
  | { type: 'SET_FILTER'; payload: string }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_TOPICS'; payload: string[] }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'RESET_PAGE' };

function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case 'SET_FILTER':
      return { ...state, activeFilter: action.payload, currentPage: 1 };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload, currentPage: 1 };
    case 'SET_TOPICS':
      return { ...state, selectedTopics: action.payload, currentPage: 1 };
    case 'SET_PAGE':
      return { ...state, currentPage: action.payload };
    case 'RESET_PAGE':
      return { ...state, currentPage: 1 };
    default:
      return state;
  }
}

const initialFilterState: FilterState = {
  activeFilter: 'Todos',
  searchQuery: '',
  selectedTopics: [],
  currentPage: 1,
};

interface ProgramsClientProps {
  initialPrograms: Program[];
  availableTopics: Topic[];
}

export default function ProgramsClient({ initialPrograms, availableTopics }: ProgramsClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [filterState, dispatch] = useReducer(filterReducer, initialFilterState);
  const { activeFilter, searchQuery, selectedTopics, currentPage } = filterState;
  const ITEMS_PER_PAGE = 9;

  const setActiveFilter = (value: string) => dispatch({ type: 'SET_FILTER', payload: value });
  const setSearchQuery = (value: string) => dispatch({ type: 'SET_SEARCH', payload: value });
  const setSelectedTopics = (value: string[]) => dispatch({ type: 'SET_TOPICS', payload: value });
  const setCurrentPage = (value: number) => dispatch({ type: 'SET_PAGE', payload: value });

  const filteredPrograms = useMemo(() => {
    let result = initialPrograms;

    // Apply Category Filter
    if (activeFilter !== 'Todos') {
      const filterType = activeFilter === 'Master' ? 'Master' : 'Curso';
      result = result.filter(p => p.type === filterType);
    }

    // Apply Topic Filter
    if (selectedTopics.length > 0) {
      result = result.filter(p => p.topics?.some(t => selectedTopics.includes(t.name)));
    }

    // Apply Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q)) ||
        p.topics?.some(t => t.name.toLowerCase().includes(q))
      );
    }

    return result;
  }, [initialPrograms, activeFilter, searchQuery, selectedTopics]);

  const totalPages = Math.ceil(filteredPrograms.length / ITEMS_PER_PAGE);
  const paginatedPrograms = filteredPrograms.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
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
          <CatalogFilterBar
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            resultsCount={filteredPrograms.length}
            availableTopics={availableTopics}
            selectedTopics={selectedTopics}
            setSelectedTopics={setSelectedTopics}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
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
