'use client';

import React from 'react';
import Image from 'next/image';
import { m } from 'framer-motion';
import { Clock, BookOpen, Award, Crown } from 'lucide-react';
import type { Program } from '@/lib/strapi/types';
import { BrochureDownloadButton } from './BrochureDownloadButton';

interface ProgramHeroSectionProps {
  program: Program;
  sidebar?: React.ReactNode;
  tabs?: React.ReactNode;
  /** Extra content rendered in the LEFT column, below the tabs (e.g.
   *  teachers + FAQ). MF-17: the whole page is one 2-column grid — all
   *  content on the left, the purchase card on the right spanning the
   *  full height — so these sections live inside the hero's left column
   *  instead of as separate full-width sections below. */
  belowContent?: React.ReactNode;
  /** Optional breadcrumb rendered inside the hero, right under the
   *  fixed header. Sits on top of the hero's background image so the
   *  image starts at the very top of the section instead of below an
   *  extra gap. Pass it as a node so callers can configure labels and
   *  styling without this component knowing about the trail. */
  breadcrumb?: React.ReactNode;
}

export const ProgramHeroSection: React.FC<ProgramHeroSectionProps> = ({
  program,
  sidebar,
  tabs,
  belowContent,
  breadcrumb,
}) => {
  // The hero always clears the fixed header. When a breadcrumb is
  // supplied, it sits at the top of the content area below the header
  // and the badges/title shift down by mb-4, so the image stays as the
  // visual backdrop from the top edge.
  return (
    <section className="relative pt-24 md:pt-28 pb-12 md:pb-16 overflow-visible">
      {/* Background banner image: full width with the height following the
          image's own aspect ratio (h-auto — no vertical stretching to fill
          the now-tall section), capped and centered on very large screens.
          It sits behind the hero text at the top; the content below has
          solid backgrounds that cover the rest. */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-0 w-full max-w-[1920px] overflow-hidden">
        <Image
          src={program.image}
          alt={program.title}
          className="w-full h-auto opacity-70"
          width={1920}
          height={1080}
          sizes="100vw"
          unoptimized
          priority
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-linear-to-r from-[rgba(255,252,248,0.95)] via-[rgba(255,252,248,0.82)] to-[rgba(255,252,248,0.55)]" />
        <div className="absolute inset-0 bg-linear-to-t from-mx-bg via-[rgba(255,252,248,0.2)] to-transparent" />
      </div>

      <div className="relative z-20 max-w-[1400px] mx-auto px-6 md:px-12">
        {breadcrumb && <div className="mb-4 md:mb-6">{breadcrumb}</div>}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left: Hero content. Spans the full width when no sidebar is
              passed (MF-17 moved the purchase sidebar out of the hero into
              the 2-column content layout below). */}
          <div className={sidebar ? 'lg:col-span-2' : 'lg:col-span-3'}>
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
              className="text-[32px] text-balance md:text-display-sm 2xl:text-display-sm font-black tracking-tight mb-3 max-w-3xl leading-tight text-mx-blue"
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

            {/* Temario download — placed right after the short description
                (MF-17). Gated behind a lead-capture form (MF-18): opens the
                Nombre+email modal and delivers the PDF on success. */}
            <BrochureDownloadButton program={program} />

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

            {/* Extra content (teachers, FAQ) stacked below the tabs, still
                inside the left column so the right-hand card spans it all. */}
            {belowContent}
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
