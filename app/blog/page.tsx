'use client';

import React, { useState, useEffect } from 'react';
import { FontStyles } from '../components/FontStyles';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { BlogHeader } from '../components/BlogHeader';
import { BlogFilterBar } from '../components/BlogFilterBar';
import { BlogGrid } from '../components/BlogGrid';
import { ALL_BLOG_POSTS, BlogPost } from '../data/blogs';

export default function BlogPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>(ALL_BLOG_POSTS);

  useEffect(() => {
    let result = ALL_BLOG_POSTS;
    
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
    
    setFilteredPosts(result);
  }, [activeFilter, searchQuery]);

  return (
    <div className="bg-black min-h-screen text-white selection:bg-amber-500/30 overflow-x-hidden">
      <FontStyles />
      
      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      <main className="pt-32 pb-24 px-6 md:px-12 max-w-[1800px] mx-auto relative z-10">
        <BlogHeader />
        
        <BlogFilterBar
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          resultsCount={filteredPosts.length}
        />

        <BlogGrid posts={filteredPosts} />
      </main>

      <Footer />
    </div>
  );
}
