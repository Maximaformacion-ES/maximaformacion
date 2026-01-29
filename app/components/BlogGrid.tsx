'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { BlogCard } from './BlogCard';
import type { BlogPost } from '@/lib/strapi/types';

interface BlogGridProps {
  posts: BlogPost[];
}

export const BlogGrid: React.FC<BlogGridProps> = ({ posts }) => {
  return (
    <>
      {/* Blog Posts Grid */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="popLayout">
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-neutral-500"
            >
              <Search size={48} className="mb-4 opacity-20" />
              <p className="text-lg">No se encontraron artículos con esos criterios.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Load More / Pagination Placeholder */}
      {posts.length > 0 && (
        <div className="mt-20 flex justify-center">
          <button className="group flex items-center gap-2 px-8 py-4 border border-white/20 hover:border-amber-500 hover:bg-amber-500/10 transition-all duration-300">
            <span className="text-sm font-medium tracking-widest uppercase">Cargar más artículos</span>
          </button>
        </div>
      )}
    </>
  );
};
