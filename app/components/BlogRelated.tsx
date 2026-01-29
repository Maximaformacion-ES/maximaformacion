'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { BlogPost, getRelatedPosts } from '../data/blogs';

interface BlogRelatedProps {
  currentPostId: number;
}

export const BlogRelated: React.FC<BlogRelatedProps> = ({ currentPostId }) => {
  const relatedPosts = getRelatedPosts(currentPostId, 3);

  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <section className="py-24 md:py-32 px-6 md:px-12 bg-black">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-black tracking-tight mb-12"
        >
          ARTÍCULOS <span className="text-stroke">RELACIONADOS</span>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {relatedPosts.map((post, idx) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group relative bg-[#0a0a0a] border border-white/10 hover:border-amber-500/50 transition-colors duration-500 overflow-hidden"
            >
              {/* Featured Image */}
              <div className="relative h-48 overflow-hidden bg-neutral-900">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/80 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-widest">
                  {post.category}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-amber-500 transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-neutral-400 text-sm font-light mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 text-sm font-medium group/link"
                >
                  Leer más
                  <ArrowUpRight size={16} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                </Link>
              </div>

              {/* Hover Bar */}
              <div className="absolute bottom-0 left-0 h-1 bg-amber-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-in-out origin-left" />
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};
