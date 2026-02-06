'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FontStyles } from '../components/FontStyles';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { CatalogHeader } from '../components/CatalogHeader';
import { CatalogFilterBar } from '../components/CatalogFilterBar';
import { CatalogGrid } from '../components/CatalogGrid';
import type { Program, Topic } from '@/lib/strapi/types';

interface ProgramsClientProps {
  initialPrograms: Program[];
  availableTopics: Topic[];
}

export default function ProgramsClient({ initialPrograms, availableTopics }: ProgramsClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

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

  return (
    <div className="min-h-screen bg-mx-bg text-mx-text overflow-x-hidden">
      <FontStyles />

      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      <main className="pt-32 pb-24 px-6 md:px-12 max-w-[1800px] mx-auto relative z-10">
        <CatalogHeader />

        <motion.div
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
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <CatalogGrid programs={filteredPrograms} />
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
