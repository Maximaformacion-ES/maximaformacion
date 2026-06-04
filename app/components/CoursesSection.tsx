'use client';

import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronDown, Sparkles, BarChart3, MonitorPlay, Activity, GraduationCap, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { ProgramCard } from './ProgramCard';
import { StyledTitle } from './StyledTitle';
import { SUBJECT_AREAS, type SubjectAreaKey } from '@/lib/subject-areas';
import type { Program } from '@/lib/strapi/types';

// How many course cards to surface per area on the home. The goal is to
// communicate coverage of the area, not to dump the full catalog — the rest
// live behind the "Ver los N cursos" link to /programas/area/[slug].
const MAX_CARDS_PER_AREA = 3;

// Presentation metadata for each area: home-facing name, icon and the gradient
// accent colour. The colour fills a left-to-right band fading to transparent
// (matches the Figma frame 256:291). Name + icon carry the meaning; colour is
// only an accent, for accessibility.
const AREA_PRESENTATION: Record<
  SubjectAreaKey,
  { name: string; icon: LucideIcon; accent: string }
> = {
  'Inteligencia Artificial': { name: 'Inteligencia Artificial', icon: Sparkles, accent: '#F7A000' },
  'Ciencia de Datos': { name: 'Data Science', icon: BarChart3, accent: '#527BE7' },
  'Moodle / Exelearning / H5P': { name: 'E-Learning', icon: MonitorPlay, accent: '#AD46FF' },
  'Salud basada en datos': { name: 'Salud', icon: Activity, accent: '#00BC7D' },
  'Educación': { name: 'Educación', icon: GraduationCap, accent: '#F43F5E' },
};

interface CoursesSectionProps {
  programs: Program[];
  overline?: string;
  title?: string;
}

export const CoursesSection: React.FC<CoursesSectionProps> = ({
  programs,
  overline = 'Áreas de Formación',
  title = 'FORMACIÓN POR {ÁREAS}',
}) => {
  // Group programs by subjectArea, preserving the canonical SUBJECT_AREAS
  // order. Areas with no courses are skipped, so a not-yet-populated area
  // (e.g. Educación until courses are tagged in Strapi) simply doesn't render.
  const byArea = new Map<SubjectAreaKey, Program[]>();
  for (const p of programs) {
    if (!p.subjectArea) continue;
    const key = p.subjectArea as SubjectAreaKey;
    if (!byArea.has(key)) byArea.set(key, []);
    byArea.get(key)!.push(p);
  }

  const areas = SUBJECT_AREAS.map((area) => ({
    area,
    presentation: AREA_PRESENTATION[area.key],
    courses: (byArea.get(area.key) ?? []).sort((a, b) =>
      a.title.localeCompare(b.title, 'es')
    ),
  })).filter((a) => a.courses.length > 0);

  // Each area is independently collapsible; the first one starts expanded.
  const [openKeys, setOpenKeys] = useState<Set<SubjectAreaKey>>(() =>
    areas.length ? new Set([areas[0].area.key]) : new Set()
  );
  const toggleArea = (key: SubjectAreaKey) =>
    setOpenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <section id="masters" className="relative py-16 md:py-32 bg-mx-bg">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-16">
          <div>
            <m.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-mx-orange text-label-sm md:text-label-md xl:text-label-lg leading-label tracking-[0.3em] uppercase mb-4"
            >
              {overline}
            </m.p>
            <m.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-mx-blue text-heading-md md:text-heading-md xl:text-display-md font-black tracking-display leading-display"
            >
              <StyledTitle text={title} color="blue" />
            </m.h2>
          </div>

          <m.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link
              href="/programas"
              className="mt-8 md:mt-0 flex items-center gap-2 text-mx-text-muted hover:text-mx-orange transition-colors group text-body-sm md:text-body-md"
            >
              Ver todos los programas
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </m.div>
        </div>

        {/* One collapsible block per area */}
        <div className="space-y-12">
          {areas.map(({ area, presentation, courses }) => {
            const Icon = presentation.icon;
            const isOpen = openKeys.has(area.key);
            const panelId = `area-panel-${area.slug}`;
            return (
              <m.div
                key={area.key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6 }}
                className="flex flex-col gap-8"
              >
                {/* Area header: gradient band (title) with the
                    "Ver los N cursos" link centered alongside it. */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => toggleArea(area.key)}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    className="flex-1 min-w-0 flex items-center gap-2 px-6 py-1 text-left"
                    style={{ backgroundImage: `linear-gradient(to right, ${presentation.accent}, ${presentation.accent}00)` }}
                  >
                    <Icon size={18} className="text-white shrink-0" aria-hidden />
                    <h3 className="text-white font-black uppercase tracking-[-0.7px] text-[22px] sm:text-[28px] leading-[42px] truncate">
                      {presentation.name}
                    </h3>
                    <ChevronDown
                      size={20}
                      className={`text-white shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                      aria-hidden
                    />
                  </button>

                  <Link
                    href={`/programas/area/${area.slug}`}
                    className="shrink-0 flex items-center gap-2 text-mx-blue text-body-sm font-black whitespace-nowrap hover:opacity-70 transition-opacity group"
                  >
                    Ver los {courses.length} {courses.length === 1 ? 'curso' : 'cursos'}
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                {/* Area course cards (capped) — collapsible */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <m.div
                      id={panelId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pt-1">
                        {courses.slice(0, MAX_CARDS_PER_AREA).map((program, i) => (
                          <ProgramCard key={program.documentId ?? program.slug} program={program} index={i} />
                        ))}
                      </div>
                    </m.div>
                  )}
                </AnimatePresence>
              </m.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
