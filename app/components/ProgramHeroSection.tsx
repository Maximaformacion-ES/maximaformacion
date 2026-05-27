'use client';

import React from 'react';
import Image from 'next/image';
import { m } from 'framer-motion';
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
        <div className="absolute inset-0 bg-linear-to-r from-[rgba(255,252,248,0.95)] via-[rgba(255,252,248,0.82)] to-[rgba(255,252,248,0.55)] z-10" />
        <div className="absolute inset-0 bg-linear-to-t from-mx-bg via-[rgba(255,252,248,0.2)] to-transparent z-10" />
        <Image
          src={program.image}
          alt={program.title}
          className="w-full h-full object-cover opacity-70"
          fill
          sizes="100vw"
          unoptimized
          priority
          fetchPriority="high"
        />
      </div>

      <div className="relative z-20 max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left: Hero content */}
          <div className="lg:col-span-2">
            {/* Badges row */}
            <m.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-4 flex items-center gap-3 flex-wrap"
            >
              <span className={`inline-block px-3 py-1 text-label-sm font-black tracking-[0.2em] uppercase rounded-full ${
                program.type === 'Master'
                  ? 'bg-mx-blue text-white'
                  : 'bg-mx-orange text-white'
              }`}>
                {program.type}
              </span>
              {program.isPro && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-label-sm font-black tracking-wider uppercase bg-gradient-to-r from-[#f7a000] via-[#f7c948] to-[#f7a000] text-white rounded-full shadow-lg shadow-[#f7a000]/30">
                  <Crown size={10} /> PRO
                </span>
              )}
              {program.featured && (
                <span className="inline-flex items-center gap-1.5 text-label-sm font-bold text-mx-orange uppercase tracking-widest">
                  <Award size={10} /> Destacado
                </span>
              )}
            </m.div>

            {/* Title */}
            <m.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-[32px] text-balance md:text-display-sm 2xl:text-display-md font-black tracking-tight mb-3 max-w-3xl leading-tight text-mx-text"
            >
              {program.title}
            </m.h1>

            {/* Topics badges */}
            {program.topics && program.topics.length > 0 && (
              <m.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="flex flex-wrap gap-2 mb-4"
              >
                {program.topics.map((topic) => (
                  <span
                    key={topic.id}
                    className="px-3 py-1 bg-mx-text/10 backdrop-blur-md text-mx-text-muted text-label-sm md:text-label-md font-medium rounded-full"
                  >
                    {topic.name}
                  </span>
                ))}
              </m.div>
            )}

            {/* Description */}
            <m.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-body-sm md:text-body-md xl:text-body-lg text-mx-text-muted font-light mb-6 max-w-2xl"
            >
              {program.description}
            </m.p>

            {/* Info pills */}
            <m.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex flex-wrap items-center gap-6 mb-8"
            >
              {(program.durationLabel || program.duration) && (
                <div className="flex items-center gap-2 text-mx-text">
                  <Clock size={16} className="text-mx-orange" />
                  <span className="text-body-sm font-medium">
                    {program.durationLabel || `${program.duration} horas`}
                  </span>
                </div>
              )}
              {program.ects > 0 && (
                <div className="flex items-center gap-2 text-mx-text">
                  <BookOpen size={16} className="text-mx-orange" />
                  <span className="text-body-sm font-medium">{program.ects} créditos</span>
                </div>
              )}
              {program.modules.length > 0 && (
                <div className="flex items-center gap-2 text-mx-text">
                  <Award size={16} className="text-mx-orange" />
                  <span className="text-body-sm font-medium">{program.modules.length} módulos</span>
                </div>
              )}
            </m.div>

            {/* Tabs below hero text */}
            {tabs && (
              <m.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                {tabs}
              </m.div>
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
