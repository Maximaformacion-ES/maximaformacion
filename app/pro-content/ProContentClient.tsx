'use client';

import { useState } from 'react';
import Link from 'next/link';
import { m } from 'framer-motion';
import { FontStyles } from '../components/FontStyles';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import ProResourcesGrid from './ProResourcesGrid';
import type { ProResourceCard } from '@/lib/strapi/types';

interface ProContentClientProps {
  resources: ProResourceCard[];
  hasPro: boolean;
}

export default function ProContentClient({ resources, hasPro }: ProContentClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-mx-bg text-mx-text overflow-x-hidden">
      <FontStyles />

      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      <main className="pt-32 pb-24 px-6 md:px-12 max-w-[1800px] mx-auto relative z-10 overflow-x-hidden">
        <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="text-mx-orange text-xs tracking-[0.4em] uppercase">Contenido PRO</span>
            <span className="px-2 py-0.5 rounded-full bg-mx-orange/15 text-mx-orange text-[11px] font-semibold uppercase tracking-wider">
              Pro
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Recursos exclusivos PRO</h1>
          <p className="text-mx-text/60 max-w-2xl">
            Apps web, HTML interactivo, bases de datos y plantillas para suscriptores PRO.
            {!hasPro && (
              <>
                {' '}
                <Link href="/pricing" className="text-mx-orange underline underline-offset-2">
                  Hazte PRO
                </Link>{' '}
                para acceder a todo el contenido.
              </>
            )}
          </p>
        </m.div>

        <div className="mt-10">
          <ProResourcesGrid resources={resources} hasPro={hasPro} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
