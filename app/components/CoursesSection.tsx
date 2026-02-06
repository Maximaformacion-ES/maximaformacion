'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { ProgramCard } from './ProgramCard';
import { renderStyledTitle } from './StyledTitle';
import type { Program } from '@/lib/strapi/types';

// Generate a consistent rating between 4 and 5 based on program id
function generateRating(id: number): number {
  const seed = (id * 7919) % 100;
  return 4 + (seed / 100);
}

// Generate consistent student count
function generateStudents(id: number): string {
  const seed = (id * 3571) % 30 + 10;
  return `${(seed / 10).toFixed(1)}K`;
}

interface CoursesSectionProps {
  programs: Program[];
  overline?: string;
  title?: string;
}

export const CoursesSection: React.FC<CoursesSectionProps> = ({
  programs,
  overline = 'Programas Destacados',
  title = 'MÁSTERS & {ESPECIALIZACIONES}',
}) => {
  // Sort by rating (highest first) and take top 6
  const sortedPrograms = [...programs]
    .map(p => ({ program: p, rating: generateRating(p.id) }))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);

  return (
    <section id="masters" className="relative py-24 md:py-32 bg-mx-bg">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-mx-orange text-sm tracking-[0.3em] uppercase mb-4"
            >
              {overline}
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-mx-blue text-4xl md:text-6xl lg:text-7xl font-black tracking-tight"
            >
              {renderStyledTitle(title, "blue")}
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link
              href="/programas"
              className="mt-8 md:mt-0 flex items-center gap-2 text-mx-text-muted hover:text-mx-orange transition-colors group"
            >
              Ver todos los programas
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Course Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {sortedPrograms.map((item, i) => (
            <ProgramCard
              key={item.program.id}
              program={item.program}
              rating={item.rating}
              students={generateStudents(item.program.id)}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
