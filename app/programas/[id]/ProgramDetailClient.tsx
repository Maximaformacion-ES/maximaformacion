'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FontStyles } from '../../components/FontStyles';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { ProgramHeroSection } from '../../components/ProgramHeroSection';
import { ProgramTabs } from '../../components/ProgramTabs';
import { ProgramSidebar, SIDEBAR_CTA_ANCHOR_ID } from '../../components/ProgramSidebar';
import { ProgramFAQSection } from '../../components/ProgramFAQSection';
import { ProgramCTASection } from '../../components/ProgramCTASection';
import { ProgramMobileCTA } from '../../components/ProgramMobileCTA';
import { ProgramTeachers } from '../../components/ProgramTeachers';
import { TrustSeals } from '../../components/TrustSeals';
import ProGateWrapper from './ProGateWrapper';
import { Breadcrumb } from '../../components/Breadcrumb';
import type { Program } from '@/lib/strapi/types';
import type { ProgramRichHtml } from './page';
import type { ServerUserState } from '@/lib/auth/server-user-state';

interface ProgramDetailClientProps {
  program: Program | null;
  richHtml: ProgramRichHtml;
  initialUserState?: ServerUserState;
}

export default function ProgramDetailClient({
  program,
  richHtml,
  initialUserState,
}: ProgramDetailClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!program) {
    return (
    <div className="min-h-screen bg-mx-bg text-mx-text overflow-x-clip">
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
    <div className="min-h-screen bg-mx-bg text-mx-text overflow-x-clip">
      <FontStyles />

      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      <main className="relative z-10">
        {/* MF-17: single page-wide 2-column layout. The hero hosts the grid:
            LEFT column = all the program content (hero text + tabs + teachers
            + FAQ), RIGHT column = the purchase card, pinned (sticky) and
            spanning the full height of the left column. On mobile the columns
            stack, the card column is hidden, and the fixed bottom bar
            (ProgramMobileCTA) is the only purchase affordance. */}
        <ProgramHeroSection
          program={program}
          breadcrumb={
            <Breadcrumb
              items={[
                { label: 'Programas', href: '/programas' },
                { label: program.title },
              ]}
              className=""
            />
          }
          sidebar={
            <ProgramSidebar
              program={program}
              stickyAnchorId={SIDEBAR_CTA_ANCHOR_ID}
              initialUserState={initialUserState}
            />
          }
          tabs={<ProgramTabs program={program} richHtml={richHtml} />}
          belowContent={
            <>
              <ProgramTeachers program={program} />
              <ProgramFAQSection program={program} />
              {/* Certificaciones en el MISMO contenedor (lg:col-span-2) que
                  las FAQ. Componente compartido con la ficha de Maxymia. */}
              <TrustSeals badges={program.badges} />
            </>
          }
        />

        {/* Closing CTA stays full-width below the grid. Still gated: for
            isPro programs without access ProGateWrapper swaps it for the
            upgrade gate. */}
        <ProGateWrapper program={program} initialUserState={initialUserState}>
          <ProgramCTASection program={program} />
        </ProGateWrapper>
      </main>

      <Footer />

      {/* Sticky mobile purchase bar */}
      <ProgramMobileCTA program={program} initialUserState={initialUserState} />
      {/* Bottom spacing so footer isn't hidden behind the sticky bar */}
      <div className="h-20 lg:hidden" />
    </div>
  );
}
