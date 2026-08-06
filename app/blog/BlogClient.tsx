'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { m } from 'framer-motion';
import { FontStyles } from '../components/FontStyles';
import { MarketingHeader as Header } from '../components/MarketingHeader';
import { Footer } from '../components/Footer';
import { BlogHeader } from '../components/BlogHeader';
import { BlogFilterBar } from '../components/BlogFilterBar';
import { BlogGrid } from '../components/BlogGrid';
import type { BlogPost } from '@/lib/strapi/types';

interface BlogClientProps {
  initialPosts: BlogPost[];
  initialPage?: number;
}

const ITEMS_PER_PAGE = 9;

export default function BlogClient({ initialPosts, initialPage = 1 }: BlogClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(initialPage);
  const router = useRouter();
  const pathname = usePathname();

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
    const url = page <= 1 ? pathname : `${pathname}?page=${page}`;
    router.push(url, { scroll: false });
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pathname, router]);

  const categories = useMemo(() => {
    const unique = new Set<string>();
    for (const post of initialPosts) {
      if (post.category) unique.add(post.category);
    }
    return ['Todos', ...Array.from(unique).sort()];
  }, [initialPosts]);

  const filteredPosts = useMemo(() => {
    let result = initialPosts;

    if (activeFilter !== 'Todos') {
      result = result.filter((post) => post.category === activeFilter);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((post) =>
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [initialPosts, activeFilter, searchQuery]);

  // Reset to page 1 whenever the filtered set changes — clear ?page= from URL too.
  useEffect(() => {
    setCurrentPage(1);
    if (typeof window !== 'undefined' && window.location.search.includes('page=')) {
      router.replace(pathname, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / ITEMS_PER_PAGE));
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-mx-bg text-mx-text overflow-x-hidden">
      <FontStyles />

      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      <main className="pt-32 pb-24 px-6 md:px-12 max-w-[1800px] mx-auto relative z-10 overflow-x-hidden">
        <BlogHeader />

        <m.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <BlogFilterBar
            categories={categories}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            resultsCount={filteredPosts.length}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
          />
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <BlogGrid
            posts={paginatedPosts}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
          />
        </m.div>
      </main>

      <Footer />
    </div>
  );
}
