'use client';

import { useState, useMemo } from 'react';
import { m } from 'framer-motion';
import { FontStyles } from '../components/FontStyles';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ResourcesHeader } from '../components/ResourcesHeader';
import { ResourcesFilterBar, type CategoryFilter } from '../components/ResourcesFilterBar';
import { ResourcesGrid } from '../components/ResourcesGrid';
import { ResourcesTopicTabs, type TopicTab, type TopicTabValue } from '../components/ResourcesTopicTabs';
import ProResourcesSection from './ProResourcesSection';
import type { Resource, ProResourceCard } from '@/lib/strapi/types';

interface RecursosClientProps {
  initialResources: Resource[];
  proResources?: ProResourceCard[];
  hasPro?: boolean;
}

export default function RecursosClient({
  initialResources,
  proResources = [],
  hasPro = false,
}: RecursosClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTopic, setActiveTopic] = useState<TopicTabValue>('Todos');
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  const topicTabs = useMemo<TopicTab[]>(() => {
    let total = 0;
    let r = 0;
    let f = 0;
    for (const x of initialResources) {
      total++;
      if (x.topic === 'R-Software') r++;
      else if (x.topic === 'Formación online') f++;
    }
    return [
      { value: 'Todos', label: 'Todos', description: 'Toda la biblioteca de recursos', count: total },
      {
        value: 'R-Software',
        label: 'R-Software',
        description: 'Estadística, ciencia de datos y machine learning con R',
        count: r,
      },
      {
        value: 'Formación online',
        label: 'Formación online',
        description: 'Moodle, e-learning y diseño instruccional',
        count: f,
      },
    ];
  }, [initialResources]);

  // Resources after topic filter only — used to compute available categories
  // (so the pills show counts relative to the current topic, and empty
  // categories are hidden).
  const topicScoped = useMemo(() => {
    if (activeTopic === 'Todos') return initialResources;
    return initialResources.filter((r) => r.topic === activeTopic);
  }, [initialResources, activeTopic]);

  const categoryFilters = useMemo<CategoryFilter[]>(() => {
    const tally = new Map<string, number>();
    for (const r of topicScoped) {
      tally.set(r.category, (tally.get(r.category) ?? 0) + 1);
    }
    const all: CategoryFilter[] = [{ value: 'Todos', count: topicScoped.length }];
    // Stable order matching the schema enum
    const order = ['Guías rápidas', 'TFM', 'Tutoriales', 'Infografías', 'E-books', 'Casos de éxito', 'Otros'];
    for (const name of order) {
      const c = tally.get(name);
      if (c && c > 0) all.push({ value: name, count: c });
    }
    return all;
  }, [topicScoped]);

  const filteredResources = useMemo(() => {
    let result = topicScoped;

    if (activeFilter !== 'Todos') {
      result = result.filter((r) => r.category === activeFilter);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.excerpt.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [topicScoped, activeFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-mx-bg text-mx-text overflow-x-hidden">
      <FontStyles />

      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      <main className="pt-32 pb-24 px-6 md:px-12 max-w-[1800px] mx-auto relative z-10 overflow-x-hidden">
        <ResourcesHeader />

        <ProResourcesSection resources={proResources} hasPro={hasPro} />

        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <ResourcesTopicTabs
            active={activeTopic}
            onChange={(v) => {
              setActiveTopic(v);
              setActiveFilter('Todos');
            }}
            tabs={topicTabs}
          />
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <ResourcesFilterBar
            categories={categoryFilters}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            resultsCount={filteredResources.length}
          />
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <ResourcesGrid resources={filteredResources} />
        </m.div>
      </main>

      <Footer />
    </div>
  );
}
