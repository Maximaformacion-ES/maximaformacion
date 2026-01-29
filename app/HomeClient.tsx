'use client';

import React, { useState } from 'react';
import { FontStyles } from './components/FontStyles';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { StatsSection } from './components/StatsSection';
import { CoursesSection } from './components/CoursesSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { CTASection } from './components/CTASection';
import { Footer } from './components/Footer';
import type { Program } from '@/lib/strapi/types';

interface HomeClientProps {
  programs: Program[];
}

export default function HomeClient({ programs }: HomeClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <FontStyles />

      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      <HeroSection />
      <StatsSection />
      <CoursesSection programs={programs} />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
