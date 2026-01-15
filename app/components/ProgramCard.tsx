'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, BookOpen, Award, ArrowUpRight } from 'lucide-react';
import { Program } from '../data/programs';

interface ProgramCardProps {
  program: Program;
}

export const ProgramCard: React.FC<ProgramCardProps> = ({ program }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      className="group relative bg-[#0a0a0a] border border-white/10 rounded-none overflow-hidden hover:border-amber-500/50 transition-colors duration-500 flex flex-col min-h-[420px]"
    >
      {/* Card Content */}
      <div className="p-10 h-full flex flex-col">
        {/* Header Tags */}
        <div className="flex items-center justify-between mb-8">
          <span className={`px-4 py-1.5 text-[10px] font-black tracking-[0.2em] uppercase border ${
            program.type === 'Master' 
              ? 'border-amber-500 text-amber-500 bg-amber-500/5' 
              : 'border-white/20 text-white/50 bg-white/5'
          }`}>
            {program.type}
          </span>
          {program.featured && (
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber-500 uppercase tracking-widest">
              <Award size={12} /> Destacado
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-3xl font-bold text-white mb-auto group-hover:text-amber-500 transition-colors duration-300 leading-tight">
          {program.title}
        </h3>

        {/* Metadata */}
        <div className="pt-8 mt-8 border-t border-white/5 flex items-center justify-between text-neutral-500">
          <div className="flex gap-6">
            <span className="flex items-center gap-2 text-xs font-bold">
              <Clock size={14} /> {program.duration}
            </span>
            <span className="flex items-center gap-2 text-xs font-bold">
              <BookOpen size={14} /> {program.ects}
            </span>
          </div>
          <a 
            href={`/programas/${program.id}`}
            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-amber-500 group-hover:border-amber-500 transition-all duration-500"
          >
            <ArrowUpRight size={16} className="text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>
      </div>
      
      {/* Hover Overlay Action - Bottom Bar */}
      <div className="absolute bottom-0 left-0 h-1 bg-amber-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-in-out origin-left" />
    </motion.div>
  );
};
