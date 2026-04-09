'use client';

import React from 'react';
import { m, AnimatePresence } from 'framer-motion';
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
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-mx-text-muted"
            >
              <Search size={48} className="mb-4 opacity-20" />
              <p className="text-body-sm md:text-body-md">No se encontraron artículos con esos criterios.</p>
            </m.div>
          )}
        </AnimatePresence>
      </div>

      {/* Load More */}
      {posts.length > 0 && (
        <div className="mt-16 flex justify-center">
          <button className="group flex items-center gap-2 px-8 py-4 border border-mx-border rounded-full hover:border-mx-orange hover:bg-mx-orange/5 transition-all duration-300 cursor-pointer">
            <span className="text-body-sm font-medium text-mx-text-muted group-hover:text-mx-orange tracking-wide">
              Cargar más artículos
            </span>
          </button>
        </div>
      )}
    </>
  );
};
