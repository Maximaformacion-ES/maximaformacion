'use client';

import { useState, type ReactNode } from 'react';
import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';
import { FontStyles } from '@/app/components/FontStyles';

export function ResourceCategoryLandingShell({ children }: { children: ReactNode }) {
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
