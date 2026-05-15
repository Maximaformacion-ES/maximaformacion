'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { m, AnimatePresence } from 'framer-motion';
import { Search, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';
import { BlogCard } from './BlogCard';
import type { BlogPost } from '@/lib/strapi/types';

interface BlogGridProps {
  posts: BlogPost[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const BlogGrid: React.FC<BlogGridProps> = ({
  posts,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Build href for a given page preserving any other query params. Real
  // <Link href> in the initial HTML so Googlebot can follow paginated
  // URLs (SEO audit asked for this); the onClick intercepts to keep the
  // existing client-side pagination behaviour for real users.
  const hrefForPage = (page: number) => {
    const sp = new URLSearchParams(searchParams?.toString() ?? '');
    if (page <= 1) sp.delete('page'); else sp.set('page', String(page));
    const qs = sp.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  const handlePageChange = (e: React.MouseEvent, page: number) => {
    e.preventDefault();
    onPageChange(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
      {/* Blog Posts Grid */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="popLayout">
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-mx-text-muted"
            >
              <Search size={48} className="mb-4 opacity-20" />
              <p className="text-body-sm md:text-body-md">No se encontraron artículos con esos criterios.</p>
            </m.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pagination — real <Link> anchors with hrefs in the initial HTML
          so Googlebot can follow them and discover every paginated post. */}
      {totalPages > 1 && (
        <nav className="mt-16 flex items-center justify-center gap-2" aria-label="Paginación de artículos">
          {currentPage > 1 ? (
            <Link
              href={hrefForPage(1)}
              aria-label="Primera página"
              onClick={(e) => handlePageChange(e, 1)}
              className="p-2.5 rounded-full border border-mx-border hover:border-mx-orange hover:bg-mx-orange/10 transition-all duration-300"
            >
              <ChevronsLeft size={18} />
            </Link>
          ) : (
            <span className="p-2.5 rounded-full border border-mx-border opacity-30 pointer-events-none">
              <ChevronsLeft size={18} />
            </span>
          )}
          {currentPage > 1 ? (
            <Link
              href={hrefForPage(currentPage - 1)}
              aria-label="Página anterior"
              rel="prev"
              onClick={(e) => handlePageChange(e, currentPage - 1)}
              className="p-2.5 rounded-full border border-mx-border hover:border-mx-orange hover:bg-mx-orange/10 transition-all duration-300"
            >
              <ChevronLeft size={18} />
            </Link>
          ) : (
            <span className="p-2.5 rounded-full border border-mx-border opacity-30 pointer-events-none">
              <ChevronLeft size={18} />
            </span>
          )}

          {getPageNumbers().map((page) =>
            typeof page === 'string' ? (
              <span key={page} className="px-2 text-mx-text-muted">
                ...
              </span>
            ) : currentPage === page ? (
              <span
                key={page}
                aria-current="page"
                className="w-10 h-10 rounded-full text-body-sm font-medium bg-mx-orange text-white inline-flex items-center justify-center"
              >
                {page}
              </span>
            ) : (
              <Link
                key={page}
                href={hrefForPage(page)}
                onClick={(e) => handlePageChange(e, page)}
                className="w-10 h-10 rounded-full text-body-sm font-medium transition-all duration-300 border border-mx-border hover:border-mx-orange hover:bg-mx-orange/10 inline-flex items-center justify-center"
              >
                {page}
              </Link>
            )
          )}

          {currentPage < totalPages ? (
            <Link
              href={hrefForPage(currentPage + 1)}
              aria-label="Página siguiente"
              rel="next"
              onClick={(e) => handlePageChange(e, currentPage + 1)}
              className="p-2.5 rounded-full border border-mx-border hover:border-mx-orange hover:bg-mx-orange/10 transition-all duration-300"
            >
              <ChevronRight size={18} />
            </Link>
          ) : (
            <span className="p-2.5 rounded-full border border-mx-border opacity-30 pointer-events-none">
              <ChevronRight size={18} />
            </span>
          )}
          {currentPage < totalPages ? (
            <Link
              href={hrefForPage(totalPages)}
              aria-label="Última página"
              onClick={(e) => handlePageChange(e, totalPages)}
              className="p-2.5 rounded-full border border-mx-border hover:border-mx-orange hover:bg-mx-orange/10 transition-all duration-300"
            >
              <ChevronsRight size={18} />
            </Link>
          ) : (
            <span className="p-2.5 rounded-full border border-mx-border opacity-30 pointer-events-none">
              <ChevronsRight size={18} />
            </span>
          )}
        </nav>
      )}
    </>
  );
};
