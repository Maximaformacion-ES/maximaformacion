'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, BookOpen, Award, Crown } from 'lucide-react';
import type { Program } from '@/lib/strapi/types';

interface ProgramHeroSectionProps {
  program: Program;
  sidebar?: React.ReactNode;
  tabs?: React.ReactNode;
}

export const ProgramHeroSection: React.FC<ProgramHeroSectionProps> = ({ program, sidebar, tabs }) => {
  return (
    <section className="relative pt-28 pb-12 md:pt-32 md:pb-16 overflow-visible">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-black/60 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-black/50 z-10" />
        <img
          src={program.image}
          alt={program.title}
          className="w-full h-full object-cover opacity-70"
        />
      </div>

      <div className="relative z-20 max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left: Hero content */}
          <div className="lg:col-span-2">
            {/* Badges row */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-4 flex items-center gap-3 flex-wrap"
            >
              <span className={`inline-block px-3 py-1 text-[10px] font-black tracking-[0.2em] uppercase border ${
                program.type === 'Master'
                  ? 'border-amber-500 text-amber-500 bg-amber-500/5'
                  : 'border-white/20 text-white/50 bg-white/5'
              }`}>
                {program.type}
              </span>
              {program.isPro && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black tracking-wider uppercase bg-gradient-to-r from-amber-500 to-amber-600 text-black rounded-full">
                  <Crown size={10} /> PRO
                </span>
              )}
              {program.featured && (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                  <Award size={10} /> Destacado
                </span>
              )}
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight mb-3 max-w-3xl leading-tight"
            >
              {program.title}
            </motion.h1>

            {/* Topics badges */}
            {program.topics && program.topics.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="flex flex-wrap gap-2 mb-4"
              >
                {program.topics.map((topic) => (
                  <span
                    key={topic.id}
                    className="px-3 py-1 bg-white/10 backdrop-blur-md text-white/70 text-xs font-medium rounded-full"
                  >
                    {topic.name}
                  </span>
                ))}
              </motion.div>
            )}

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-base md:text-lg text-neutral-300 font-light mb-6 max-w-2xl"
            >
              {program.description}
            </motion.p>

            {/* Info pills */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex flex-wrap items-center gap-6 mb-8"
            >
              <div className="flex items-center gap-2 text-white">
                <Clock size={16} className="text-amber-500" />
                <span className="text-sm font-medium">{program.duration}</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <BookOpen size={16} className="text-amber-500" />
                <span className="text-sm font-medium">{program.ects}</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <Award size={16} className="text-amber-500" />
                <span className="text-sm font-medium">{program.modules.length} módulos</span>
              </div>
            </motion.div>

            {/* Tabs below hero text */}
            {tabs && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                {tabs}
              </motion.div>
            )}
          </div>

          {/* Right: Sidebar slot (renders inside hero on desktop) */}
          {sidebar && (
            <div className="lg:col-span-1 hidden lg:block">
              {sidebar}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
