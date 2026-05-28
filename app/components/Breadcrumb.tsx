import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  /** Omit on the final (current page) item so it renders as plain text. */
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  /** Tailwind classes for the wrapper; defaults to a contained row that
   *  fits below the Header on most pages. */
  className?: string;
}

/**
 * Small inline trail (Inicio › Sección › Página actual) shown above the
 * hero on detail pages. Matches the JSON-LD breadcrumb that already
 * ships in `<head>` so screen readers and Google see the same path.
 */
export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={
        className ??
        'max-w-[1400px] mx-auto px-6 md:px-12 pt-24 md:pt-28'
      }
    >
      <ol className="flex items-center gap-1.5 text-label-sm md:text-label-md text-mx-text-muted flex-wrap">
        <li className="flex items-center">
          <Link
            href="/"
            aria-label="Inicio"
            className="flex items-center hover:text-mx-orange transition-colors"
          >
            <Home size={14} aria-hidden="true" />
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              <ChevronRight size={14} className="text-mx-text-muted/50 shrink-0" aria-hidden="true" />
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-mx-orange transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className="text-mx-text font-medium line-clamp-1 max-w-[60vw] md:max-w-md"
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
