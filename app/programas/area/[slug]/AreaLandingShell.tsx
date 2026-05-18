'use client';

// Thin Client wrapper that owns the Header's mobile-menu state. The page's
// hero, intro and program grid live inside `children`, which is rendered
// server-side and passed unchanged through this component (App Router
// supports Server children inside Client parents).

import { useState, type ReactNode } from 'react';
import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';
import { FontStyles } from '@/app/components/FontStyles';

export function AreaLandingShell({ children }: { children: ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <>
      <FontStyles />
      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      {children}
      <Footer />
    </>
  );
}
