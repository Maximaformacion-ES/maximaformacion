'use client';

import React, { useState } from 'react';
import { FontStyles } from '../components/FontStyles';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { InnovacionHeroSection } from '../components/InnovacionHeroSection';
import { InnovacionAboutSection } from '../components/InnovacionAboutSection';
import { InnovacionServicesSection } from '../components/InnovacionServicesSection';
import { InnovacionSAPOSection } from '../components/InnovacionSAPOSection';
import { InnovacionProjectsSection } from '../components/InnovacionProjectsSection';
import { InnovacionCTASection } from '../components/InnovacionCTASection';
import type { HeroSection } from '@/lib/strapi/types';

interface InnovacionClientProps {
  heroData?: HeroSection | null;
}

export default function InnovacionClient({ heroData }: InnovacionClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="bg-black min-h-screen text-white selection:bg-amber-500/30 overflow-x-hidden">
      <FontStyles />

      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      <main className="relative z-10">
        <InnovacionHeroSection data={heroData || undefined} />
        <InnovacionAboutSection />
        <InnovacionServicesSection />
        <InnovacionSAPOSection />
        <InnovacionProjectsSection />
        <InnovacionCTASection />
      </main>

      <Footer />
    </div>
  );
}
