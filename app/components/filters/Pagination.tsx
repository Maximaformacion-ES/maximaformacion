'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { themeClasses } from './types';
import type { PaginationProps } from './types';

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  variant = 'dark',
}: PaginationProps) {
  const tc = themeClasses[variant];

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`w-9 h-9 rounded-full flex items-center justify-center ${tc.paginationBtn} disabled:opacity-30 disabled:cursor-not-allowed transition-all`}
      >
        <ChevronLeft size={16} />
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-9 h-9 rounded-full flex items-center justify-center text-body-sm font-medium transition-all ${
            page === currentPage
              ? tc.paginationActive
              : tc.paginationBtn
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`w-9 h-9 rounded-full flex items-center justify-center ${tc.paginationBtn} disabled:opacity-30 disabled:cursor-not-allowed transition-all`}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
