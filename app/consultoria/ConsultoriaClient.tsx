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
import ConsultoriaFormCTA from '../components/ConsultoriaFormCTA';
import ConsultoriaFormModal from '../components/ConsultoriaFormModal';
import FloatingConsultCTA from '../components/FloatingConsultCTA';
import type { HeroSection, Logo } from '@/lib/strapi/types';

interface ConsultoriaClientProps {
  heroData?: HeroSection | null;
  logos?: Logo[];
}

export default function ConsultoriaClient({ heroData, logos = [] }: ConsultoriaClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="bg-mx-bg min-h-screen text-mx-text selection:bg-mx-orange/30 overflow-x-hidden">
      <FontStyles />

      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      <main className="relative z-10 flex flex-col gap-16 md:gap-24">
        <ConsultoriaHeroSection data={heroData || undefined} />
        <ServicesGridSection />
        <FeaturesSection />
        <MethodologySection />
        <ClientsSection logos={logos} />
        <ConsultoriaFormCTA onOpenForm={() => setIsFormOpen(true)} />
      </main>

      <FloatingConsultCTA />
      <Footer />

      <ConsultoriaFormModal open={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </div>
  );
}
