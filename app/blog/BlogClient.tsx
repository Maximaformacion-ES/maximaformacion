'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
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

export default function BlogClient({ initialPosts }: BlogClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = useMemo(() => {
    let result = initialPosts;

    // Apply Category Filter
    if (activeFilter !== 'Todos') {
      result = result.filter(post => post.category === activeFilter);
    }

    // Apply Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(post =>
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [initialPosts, activeFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-mx-bg text-mx-text overflow-x-hidden">
      <FontStyles />

      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      <main className="pt-32 pb-24 px-6 md:px-12 max-w-[1800px] mx-auto relative z-10 overflow-x-hidden">
        <BlogHeader />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <BlogFilterBar
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            resultsCount={filteredPosts.length}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <BlogGrid posts={filteredPosts} />
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
