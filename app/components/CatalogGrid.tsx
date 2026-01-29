'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown } from 'lucide-react';
import { ProgramCard } from './ProgramCard';
import { Program } from '@/lib/strapi/types';

interface CatalogGridProps {
  programs: Program[];
}

export const CatalogGrid: React.FC<CatalogGridProps> = ({ programs }) => {
  return (
    <>
      {/* Programs Grid */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="popLayout">
          {programs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.map((program) => (
                <ProgramCard key={program.id} program={program} />
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-neutral-500"
            >
              <Search size={48} className="mb-4 opacity-20" />
              <p className="text-lg">No se encontraron programas con esos criterios.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Load More / Pagination Placeholder */}
      {programs.length > 0 && (
        <div className="mt-20 flex justify-center">
          <button className="group flex items-center gap-2 px-8 py-4 border border-white/20 hover:border-amber-500 hover:bg-amber-500/10 transition-all duration-300">
            <span className="text-sm font-medium tracking-widest uppercase">Cargar más programas</span>
            <ChevronDown size={16} className="group-hover:translate-y-1 transition-transform" />
          </button>
        </div>
      )}
    </>
  );
};
