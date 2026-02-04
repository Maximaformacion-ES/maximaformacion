'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Globe, Monitor, Award } from 'lucide-react';
import '../styles/markdown.css';
import type { Program } from '@/lib/strapi/types';
import { markdownToHtml } from '@/lib/markdown';

// Component to render markdown content with consistent styling
function MarkdownContent({ content, className = '' }: { content: string; className?: string }) {
  const [html, setHtml] = useState<string>('');

  useEffect(() => {
    if (content) {
      markdownToHtml(content).then(setHtml);
    }
  }, [content]);

  if (!html) return null;

  return (
    <div
      className={`markdown-content ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

interface ProgramOverviewProps {
  program: Program;
}

export const ProgramOverview: React.FC<ProgramOverviewProps> = ({ program }) => {
  const features = [
    { icon: Monitor, label: 'Modalidad', value: program.format },
    { icon: Globe, label: 'Idioma', value: program.language },
    { icon: Calendar, label: 'Inicio', value: program.startDate },
    { icon: Award, label: 'Certificación', value: program.certification },
  ];

  return (
    <section className="py-24 md:py-32 px-6 md:px-12 bg-[#0a0a0a]">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
              SOBRE EL <span className="text-stroke">PROGRAMA</span>
            </h2>
            <MarkdownContent
              content={program.longDescription}
              className="text-lg text-neutral-400 font-light leading-relaxed mb-6"
            />
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-2 gap-6"
          >
            {features.map((feature, i) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-[#111] border border-white/10 hover:border-amber-500/30 transition-colors"
              >
                <feature.icon className="text-amber-500 mb-4" size={24} />
                <div className="text-xs text-neutral-500 uppercase tracking-widest mb-2">
                  {feature.label}
                </div>
                <div className="text-white font-bold">{feature.value}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Objectives */}
        {program.objectives && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-16 pt-16 border-t border-white/10"
          >
            <h3 className="text-2xl font-bold mb-8">Objetivos del Programa</h3>
            <MarkdownContent
              content={program.objectives}
              className="text-neutral-300 font-light [&_ul]:grid [&_ul]:md:grid-cols-2 [&_ul]:gap-4 [&_li]:flex [&_li]:items-start [&_li]:gap-4 [&_li]:before:content-[''] [&_li]:before:w-1.5 [&_li]:before:h-1.5 [&_li]:before:rounded-full [&_li]:before:bg-amber-500 [&_li]:before:mt-2 [&_li]:before:shrink-0 [&_ul]:list-none [&_ul]:pl-0"
            />
          </motion.div>
        )}
      </div>
    </section>
  );
};
