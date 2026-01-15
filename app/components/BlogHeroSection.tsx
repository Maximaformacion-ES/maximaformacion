'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Clock, Calendar, Award } from 'lucide-react';
import { BlogPost } from '../data/blogs';

interface BlogHeroSectionProps {
  post: BlogPost;
}

export const BlogHeroSection: React.FC<BlogHeroSectionProps> = ({ post }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <section ref={containerRef} className="relative h-screen flex items-center justify-center overflow-hidden">
      <motion.div 
        style={{ y }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/60 to-black z-10" />
        <img 
          src={post.image} 
          alt={post.title}
          className="w-full h-full object-cover"
        />
      </motion.div>
      
      <motion.div 
        style={{ opacity }}
        className="relative z-20 text-center px-6 max-w-5xl mx-auto"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-6"
        >
          <span className="inline-block px-4 py-1.5 text-xs font-black tracking-[0.2em] uppercase border border-amber-500 text-amber-500 bg-amber-500/5">
            {post.category}
          </span>
          {post.featured && (
            <span className="ml-4 inline-flex items-center gap-1.5 text-xs font-bold text-amber-500 uppercase tracking-widest">
              <Award size={12} /> Destacado
            </span>
          )}
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter mb-8 leading-tight"
        >
          {post.title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-xl md:text-2xl text-neutral-300 font-light mb-12 max-w-3xl mx-auto"
        >
          {post.excerpt}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-8"
        >
          <div className="flex items-center gap-3 text-white">
            <Calendar size={20} className="text-amber-500" />
            <div className="text-left">
              <div className="text-xs text-neutral-400 uppercase tracking-widest">Publicado</div>
              <div className="text-lg font-bold">{formatDate(post.publishedAt)}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-white">
            <Clock size={20} className="text-amber-500" />
            <div className="text-left">
              <div className="text-xs text-neutral-400 uppercase tracking-widest">Tiempo de lectura</div>
              <div className="text-lg font-bold">{post.readTime}</div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};
