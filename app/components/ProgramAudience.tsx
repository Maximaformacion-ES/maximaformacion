'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Briefcase } from 'lucide-react';
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

interface ProgramAudienceProps {
  program: Program;
}

export const ProgramAudience: React.FC<ProgramAudienceProps> = ({ program }) => {
  return (
    <section className="py-24 md:py-32 px-6 md:px-12 bg-[#0a0a0a]">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Target Audience */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <Users className="text-amber-500" size={32} />
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                ¿PARA QUIÉN ES <span className="text-stroke">ESTE PROGRAMA?</span>
              </h2>
            </div>
            <MarkdownContent
              content={program.audience}
              className="text-neutral-300 font-light [&_ul]:space-y-4 [&_li]:flex [&_li]:items-start [&_li]:gap-4 [&_li]:before:content-[''] [&_li]:before:w-1.5 [&_li]:before:h-1.5 [&_li]:before:rounded-full [&_li]:before:bg-amber-500 [&_li]:before:mt-2 [&_li]:before:shrink-0 [&_ul]:list-none [&_ul]:pl-0"
            />
          </motion.div>

          {/* Career Outcomes */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <Briefcase className="text-amber-500" size={32} />
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                SALIDAS <span className="text-stroke">PROFESIONALES</span>
              </h2>
            </div>
            <MarkdownContent
              content={program.careers}
              className="text-neutral-300 font-light [&_ul]:space-y-4 [&_li]:flex [&_li]:items-start [&_li]:gap-4 [&_li]:before:content-[''] [&_li]:before:w-1.5 [&_li]:before:h-1.5 [&_li]:before:rounded-full [&_li]:before:bg-amber-500 [&_li]:before:mt-2 [&_li]:before:shrink-0 [&_ul]:list-none [&_ul]:pl-0"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
