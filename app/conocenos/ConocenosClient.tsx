'use client';

import React, { useState } from 'react';
import { FontStyles } from '../components/FontStyles';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { AboutHeroSection } from '../components/AboutHeroSection';
import { StorySection } from '../components/StorySection';
import { MissionVisionSection } from '../components/MissionVisionSection';
import { TeamSection } from '../components/TeamSection';
import { AboutCTASection } from '../components/AboutCTASection';
import type { HeroSection } from '@/lib/strapi/types';

interface ConocenosClientProps {
  heroData?: HeroSection | null;
}

export default function ConocenosClient({ heroData }: ConocenosClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-mx-bg text-mx-text overflow-x-hidden">
      <FontStyles />

      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      <main className="relative z-10">
        <AboutHeroSection data={heroData || undefined} />
        <StorySection />
        <MissionVisionSection />
        <TeamSection />
        <AboutCTASection />
      </main>

      <Footer />
    </div>
  );
}
