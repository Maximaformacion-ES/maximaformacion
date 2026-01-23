'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { FontStyles } from '../components/FontStyles';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { CatalogHeader } from '../components/CatalogHeader';
import { CatalogFilterBar } from '../components/CatalogFilterBar';
import { CatalogGrid } from '../components/CatalogGrid';
import type { Program } from '@/lib/strapi/types';

interface ProgramsClientProps {
  initialPrograms: Program[];
}

export default function ProgramsClient({ initialPrograms }: ProgramsClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPrograms = useMemo(() => {
    let result = initialPrograms;

    // Apply Category Filter
    if (activeFilter !== 'Todos') {
      const filterType = activeFilter === 'Master' ? 'Master' : 'Curso';
      result = result.filter(p => p.type === filterType);
    }

    // Apply Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [initialPrograms, activeFilter, searchQuery]);

  return (
    <div className="bg-black min-h-screen text-white selection:bg-amber-500/30 overflow-x-hidden">
      <FontStyles />

      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      <main className="pt-32 pb-24 px-6 md:px-12 max-w-[1800px] mx-auto relative z-10">
        <CatalogHeader />

        <CatalogFilterBar
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          resultsCount={filteredPrograms.length}
        />

        <CatalogGrid programs={filteredPrograms} />
      </main>

      <Footer />
    </div>
  );
}
