'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import type { BlogPost } from '@/lib/strapi/types';

interface BlogRelatedClientProps {
  posts: BlogPost[];
}

export const BlogRelatedClient: React.FC<BlogRelatedClientProps> = ({ posts }) => {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="py-20 md:py-28 px-6 md:px-12 bg-mx-bg">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <span className="text-mx-orange text-sm font-medium tracking-[0.5em] uppercase mb-4 block">
            Sigue leyendo
          </span>
          <h2 className="text-mx-blue text-3xl md:text-5xl font-black">
            Artículos relacionados
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post, idx) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group relative bg-mx-bg border border-mx-border rounded-xl hover:border-mx-orange/50 transition-all duration-300 overflow-hidden"
            >
              {/* Featured Image */}
              <div className="relative h-48 overflow-hidden rounded-t-xl">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-mx-blue text-white text-xs font-medium rounded-full">
                  {post.category}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-mx-text mb-3 group-hover:text-mx-blue transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-mx-text-muted text-sm font-light mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-2 text-mx-orange hover:text-mx-blue text-sm font-medium group/link transition-colors"
                >
                  Leer más
                  <ArrowUpRight size={16} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};
