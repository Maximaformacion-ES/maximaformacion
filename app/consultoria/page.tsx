'use client';

import React, { useState } from 'react';
import { FontStyles } from '../components/FontStyles';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ConsultoriaHeroSection } from '../components/ConsultoriaHeroSection';
import { ServicesGridSection } from '../components/ServicesGridSection';
import { FeaturesSection } from '../components/FeaturesSection';
import { MethodologySection } from '../components/MethodologySection';
import { ClientsSection } from '../components/ClientsSection';
import { ConsultoriaCTASection } from '../components/ConsultoriaCTASection';

export default function ConsultoriaPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <div className="bg-black min-h-screen text-white selection:bg-amber-500/30 overflow-x-hidden">
      <FontStyles />
      <div className="grain" />
      
      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      <main className="relative z-10">
        <ConsultoriaHeroSection />
        <ServicesGridSection />
        <FeaturesSection />
        <MethodologySection />
        <ClientsSection />
        <ConsultoriaCTASection />
      </main>

      <Footer />
    </div>
  );
}
