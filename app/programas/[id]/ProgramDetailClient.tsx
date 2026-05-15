'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FontStyles } from '../../components/FontStyles';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { ProgramHeroSection } from '../../components/ProgramHeroSection';
import { ProgramTabs } from '../../components/ProgramTabs';
import { ProgramSidebar } from '../../components/ProgramSidebar';
import { ProgramFAQSection } from '../../components/ProgramFAQSection';
import { ProgramCTASection } from '../../components/ProgramCTASection';
import { ProgramMobileCTA } from '../../components/ProgramMobileCTA';
import { ProgramTeachers } from '../../components/ProgramTeachers';
import ProGateWrapper from './ProGateWrapper';
import type { Program } from '@/lib/strapi/types';
import type { ProgramRichHtml } from './page';

interface ProgramDetailClientProps {
  program: Program | null;
  richHtml: ProgramRichHtml;
}

export default function ProgramDetailClient({ program, richHtml }: ProgramDetailClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!program) {
    return (
      <div className="min-h-screen bg-mx-bg text-mx-text overflow-x-hidden">
        <FontStyles />

        <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

        <main className="relative z-10 flex items-center justify-center min-h-screen px-6">
          <div className="text-center max-w-2xl">
            <h1 className="text-display-sm md:text-display-md font-black mb-6">
              404
            </h1>
            <h2 className="text-heading-sm md:text-heading-md xl:text-heading-lg font-bold mb-4">
              Programa no encontrado
            </h2>
            <p className="text-body-sm md:text-body-md text-mx-text-muted mb-8 font-light">
              El programa que buscas no existe o ha sido eliminado.
            </p>
            <Link
              href="/programas"
              className="inline-flex items-center gap-3 bg-mx-orange text-white px-8 py-4 text-label-sm md:text-label-md font-medium rounded-full hover:bg-mx-orange-dark transition-colors duration-300"
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
          tabs={<ProgramTabs program={program} richHtml={richHtml} />}
        />

        <ProGateWrapper program={program}>
          {/* Sidebar on mobile — hidden on desktop since it's in the hero */}
          <section className="pb-16 px-6 md:px-12 bg-mx-bg lg:hidden">
            <div className="max-w-[1400px] mx-auto">
              <ProgramSidebar program={program} />
            </div>
          </section>
          <ProgramTeachers program={program} />
          <ProgramFAQSection program={program} />
          <ProgramCTASection program={program} />
        </ProGateWrapper>
      </main>

      <Footer />

      {/* Sticky mobile purchase bar */}
      <ProgramMobileCTA program={program} />
      {/* Bottom spacing so footer isn't hidden behind the sticky bar */}
      <div className="h-20 lg:hidden" />
    </div>
  );
}
