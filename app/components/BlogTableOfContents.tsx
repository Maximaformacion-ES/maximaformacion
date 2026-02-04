'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { List } from 'lucide-react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface BlogTableOfContentsProps {
  contentHtml: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function extractHeadings(html: string): TocItem[] {
  const regex = /<h([2-3])[^>]*>(.*?)<\/h[2-3]>/gi;
  const headings: TocItem[] = [];
  let match;

  while ((match = regex.exec(html)) !== null) {
    const level = parseInt(match[1], 10);
    const text = match[2].replace(/<[^>]*>/g, '').trim();
    if (text) {
      headings.push({
        id: slugify(text),
        text,
        level,
      });
    }
  }

  return headings;
}

export const BlogTableOfContents: React.FC<BlogTableOfContentsProps> = ({ contentHtml }) => {
  const [activeId, setActiveId] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const sectionRef = useRef<HTMLElement | null>(null);

  // Add IDs to headings in the DOM and extract them for the TOC
  useEffect(() => {
    const container = document.querySelector('.blog-html-content');
    if (!container) return;

    const domHeadings = container.querySelectorAll('h2, h3');
    const items: TocItem[] = [];
    domHeadings.forEach((heading, index) => {
      const text = (heading.textContent || '').trim();
      if (!text) return;
      const id = `heading-${index}-${slugify(text)}`;
      heading.id = id;
      items.push({
        id,
        text,
        level: heading.tagName === 'H2' ? 2 : 3,
      });
    });
    setHeadings(items);
  }, [contentHtml]);

  // Track visibility of blog content section and active heading
  useEffect(() => {
    const section = document.getElementById('blog-content-section');
    sectionRef.current = section;

    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0, rootMargin: '-100px 0px 0px 0px' }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Track active heading on scroll
  const handleScroll = useCallback(() => {
    if (!isVisible) return;

    const headingElements = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[];

    if (headingElements.length === 0) return;

    let current = headingElements[0].id;
    for (const el of headingElements) {
      const rect = el.getBoundingClientRect();
      if (rect.top <= 120) {
        current = el.id;
      }
    }
    setActiveId(current);
  }, [headings, isVisible]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  if (headings.length < 2) return null;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <motion.nav
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 20 }}
      transition={{ duration: 0.4 }}
      className="m-8"
      style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
    >
      <div className="flex items-center gap-2 mb-4">
        <List className="w-4 h-4 text-amber-500" />
        <span className="text-amber-500 text-xs tracking-[0.3em] uppercase font-medium">
          Índice
        </span>
      </div>

      <ul className="space-y-1">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              onClick={(e) => handleClick(e, heading.id)}
              className={`
                block py-1.5 text-sm transition-all duration-200 border-l-2
                ${heading.level === 3 ? 'pl-6' : 'pl-4'}
                ${
                  activeId === heading.id
                    ? 'border-amber-500 text-amber-500 font-medium'
                    : 'border-transparent text-neutral-500 hover:text-neutral-300 hover:border-white/20'
                }
              `}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </motion.nav>
  );
};
