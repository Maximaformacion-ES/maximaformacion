'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FontStyles } from '../../components/FontStyles';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { ProgramHeroSection } from '../../components/ProgramHeroSection';
import { ProgramTabs } from '../../components/ProgramTabs';
import { ProgramSidebar } from '../../components/ProgramSidebar';
import { ProgramCTASection } from '../../components/ProgramCTASection';
import ProGateWrapper from './ProGateWrapper';
import type { Program } from '@/lib/strapi/types';

interface ProgramDetailClientProps {
  program: Program | null;
}

export default function ProgramDetailClient({ program }: ProgramDetailClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!program) {
    return (
      <div className="min-h-screen bg-mx-bg text-mx-text overflow-x-hidden">
        <FontStyles />

        <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

        <main className="relative z-10 flex items-center justify-center min-h-screen px-6">
          <div className="text-center max-w-2xl">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6">
              404
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Programa no encontrado
            </h2>
            <p className="text-mx-text-muted mb-8 font-light">
              El programa que buscas no existe o ha sido eliminado.
            </p>
            <Link
              href="/programas"
              className="inline-flex items-center gap-3 bg-mx-orange text-white px-8 py-4 text-base font-medium rounded-full hover:bg-mx-orange-dark transition-colors duration-300"
            >
              Ver todos los programas
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mx-bg text-mx-text overflow-x-hidden">
      <FontStyles />

      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      <main className="relative z-10">
        <ProgramHeroSection 
          program={program}
          sidebar={<ProgramSidebar program={program} />}
          tabs={<ProgramTabs program={program} />}
        />

        <ProGateWrapper program={program}>
          {/* Sidebar on mobile — hidden on desktop since it's in the hero */}
          <section className="pb-16 px-6 md:px-12 bg-mx-bg lg:hidden">
            <div className="max-w-[1400px] mx-auto">
              <ProgramSidebar program={program} />
            </div>
          </section>
          <ProgramCTASection program={program} />
        </ProGateWrapper>
      </main>

      <Footer />
    </div>
  );
}
