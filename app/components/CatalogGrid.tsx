'use client';

import React from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Search, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';
import { ProgramCard } from './ProgramCard';
import { Program } from '@/lib/strapi/types';

interface CatalogGridProps {
  programs: Program[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const CatalogGrid: React.FC<CatalogGridProps> = ({
  programs,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const handlePageChange = (page: number) => {
    onPageChange(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis-start' | 'ellipsis-end')[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);

    if (currentPage > 3) pages.push('ellipsis-start');

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    if (currentPage < totalPages - 2) pages.push('ellipsis-end');

    pages.push(totalPages);

    return pages;
  };

  return (
    <>
      {/* Programs Grid */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="popLayout">
          {programs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8 xl:gap-10">
              {programs.map((program) => (
                <ProgramCard key={program.documentId} program={program} />
              ))}
            </div>
          ) : (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-mx-text-muted"
            >
              <Search size={48} className="mb-4 opacity-60 text-mx-orange" />
              <p className="text-body-sm md:text-body-md">No se encontraron programas con esos criterios.</p>
            </m.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-16 flex items-center justify-center gap-2">
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="p-2.5 rounded-full border border-mx-border hover:border-mx-orange hover:bg-mx-orange/10 transition-all duration-300 disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronsLeft size={18} />
          </button>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2.5 rounded-full border border-mx-border hover:border-mx-orange hover:bg-mx-orange/10 transition-all duration-300 disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronLeft size={18} />
          </button>

          {getPageNumbers().map((page) =>
            typeof page === 'string' ? (
              <span key={page} className="px-2 text-mx-text-muted">
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-10 h-10 rounded-full text-body-sm font-medium transition-all duration-300 ${
                  currentPage === page
                    ? 'bg-mx-orange text-white'
                    : 'border border-mx-border hover:border-mx-orange hover:bg-mx-orange/10'
                }`}
              >
                {page}
              </button>
            )
          )}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2.5 rounded-full border border-mx-border hover:border-mx-orange hover:bg-mx-orange/10 transition-all duration-300 disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronRight size={18} />
          </button>
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2.5 rounded-full border border-mx-border hover:border-mx-orange hover:bg-mx-orange/10 transition-all duration-300 disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronsRight size={18} />
          </button>
        </div>
      )}
    </>
  );
};
