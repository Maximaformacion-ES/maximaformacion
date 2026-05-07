'use client';

import { useEffect, useMemo, useState } from 'react';
import { m } from 'framer-motion';
import { FontStyles } from '../components/FontStyles';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { BlogHeader } from '../components/BlogHeader';
import { BlogFilterBar } from '../components/BlogFilterBar';
import { BlogGrid } from '../components/BlogGrid';
import type { BlogPost } from '@/lib/strapi/types';

interface BlogClientProps {
  initialPosts: BlogPost[];
}

const PAGE_SIZE = 9;

export default function BlogClient({ initialPosts }: BlogClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const categories = useMemo(() => {
    const unique = new Set<string>();
    for (const post of initialPosts) {
      if (post.category) unique.add(post.category);
    }
    return ['Todos', ...Array.from(unique).sort()];
  }, [initialPosts]);

  const filteredPosts = useMemo(() => {
    let result = initialPosts;

    if (activeFilter !== 'Todos') {
      result = result.filter((post) => post.category === activeFilter);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((post) =>
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [initialPosts, activeFilter, searchQuery]);

  // Reset pagination whenever the filtered set changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeFilter, searchQuery]);

  const displayedPosts = filteredPosts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPosts.length;

  return (
    <div className="min-h-screen bg-mx-bg text-mx-text overflow-x-hidden">
      <FontStyles />

      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      <main className="pt-32 pb-24 px-6 md:px-12 max-w-[1800px] mx-auto relative z-10 overflow-x-hidden">
        <BlogHeader />

        <m.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <BlogFilterBar
            categories={categories}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            resultsCount={filteredPosts.length}
          />
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <BlogGrid
            posts={displayedPosts}
            hasMore={hasMore}
            onLoadMore={() => setVisibleCount((c) => c + PAGE_SIZE)}
          />
        </m.div>
      </main>

      <Footer />
    </div>
  );
}
