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

export default function ConocenosPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <div className="bg-black min-h-screen text-white selection:bg-amber-500/30 overflow-x-hidden">
      <FontStyles />
      
      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      <main className="relative z-10">
        <AboutHeroSection />
        <StorySection />
        <MissionVisionSection />
        <TeamSection />
        <AboutCTASection />
      </main>

      <Footer />
    </div>
  );
}
