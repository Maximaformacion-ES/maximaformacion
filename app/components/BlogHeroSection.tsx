'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { m, useScroll, useTransform } from 'framer-motion';
import { Clock, Calendar, Award } from 'lucide-react';
import type { BlogPost } from '@/lib/strapi/types';

interface BlogHeroSectionProps {
  post: BlogPost;
}

export const BlogHeroSection: React.FC<BlogHeroSectionProps> = ({ post }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <section ref={containerRef} className="relative h-dvh flex items-center justify-center overflow-hidden">
      <m.div
        style={{ y }}
        className="absolute inset-0 z-0 h-[120%]"
      >
        {/* Vignette overlay */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background: 'radial-gradient(ellipse 90% 60% at center, transparent 0%, rgba(255,252,248,0.3) 50%, rgba(255,252,248,0.8) 80%, var(--color-mx-bg) 100%)'
          }}
        />
        {/* Top fade */}
        <div className="absolute inset-x-0 top-0 h-[20%] bg-gradient-to-b from-mx-bg via-mx-bg/40 via-50% to-transparent z-10" />
        {/* Bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-[25%] bg-gradient-to-t from-mx-bg via-mx-bg/40 via-50% to-transparent z-10" />
        {/* Image with noise and tint */}
        <div className="noise w-full h-full relative">
          <Image
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover opacity-20"
            fill
            sizes="100vw"
            unoptimized
          />
          {/* Color tint overlay */}
          <div
            className="absolute inset-0 mix-blend-color"
            style={{ backgroundColor: 'var(--color-mx-blue)', opacity: 0.15 }}
          />
        </div>
      </m.div>

      <m.div
        style={{ opacity }}
        className="relative z-20 text-center px-6 max-w-5xl mx-auto"
      >
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-6 flex items-center justify-center gap-4"
        >
          <span className="inline-block px-4 py-1.5 text-label-md font-medium tracking-wider uppercase bg-mx-blue text-white rounded-full">
            {post.category}
          </span>
          {post.featured && (
            <span className="inline-flex items-center gap-1.5 text-label-md font-bold text-mx-orange uppercase tracking-widest">
              <Award size={12} /> Destacado
            </span>
          )}
        </m.div>

        <m.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-heading-md md:text-display-sm lg:text-display-md font-black text-mx-blue mb-6 md:mb-8 leading-tight"
        >
          {post.title}
        </m.h1>

        <m.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-body-md md:text-heading-sm text-mx-text-muted font-light mb-8 md:mb-12 max-w-3xl mx-auto"
        >
          {post.excerpt}
        </m.p>

        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-4 md:gap-8"
        >
          <div className="flex items-center gap-3 text-mx-text">
            <Calendar size={20} className="text-mx-orange" />
            <div className="text-left">
              <div className="text-label-md text-mx-text-muted uppercase tracking-widest">Publicado</div>
              <div className="text-body-md font-bold">{formatDate(post.publishedAt)}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-mx-text">
            <Clock size={20} className="text-mx-orange" />
            <div className="text-left">
              <div className="text-label-md text-mx-text-muted uppercase tracking-widest">Tiempo de lectura</div>
              <div className="text-body-md font-bold">{post.readTime}</div>
            </div>
          </div>
        </m.div>
      </m.div>
    </section>
  );
};
