'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FontStyles } from '../components/FontStyles';
import { Header } from '../components/Header';
import { MaxymiaFooter } from '../components/MaxymiaFooter';

export default function MaxymiaNotFound() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="bg-[#0b1018] min-h-screen text-white selection:bg-[#527BE7]/30 overflow-x-hidden">
      <FontStyles />

      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      <main className="relative z-10 flex items-center justify-center min-h-screen px-6">
        <div className="text-center max-w-2xl">
          <p className="text-mx-blue text-label-lg tracking-[0.5em] uppercase mb-6">
            Error 404
          </p>
          <h1 className="text-display-md md:text-display-lg font-black mb-6 bg-gradient-to-r from-mx-blue via-purple-400 to-mx-orange bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-heading-md md:text-heading-lg font-bold mb-4">
            Página no encontrada
          </h2>
          <p className="text-white/50 mb-10 font-light leading-relaxed">
            El contenido que buscas no existe o ha sido movido.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/maxymia"
              className="inline-flex items-center gap-3 bg-mx-blue text-white px-8 py-4 text-body-md font-medium rounded-full hover:bg-mx-blue/80 transition-colors duration-300"
            >
              Volver a Maxymia
            </Link>
            <Link
              href="/maxymia"
              className="inline-flex items-center gap-3 border border-white/20 text-white px-8 py-4 text-body-md font-medium rounded-full hover:border-white/40 transition-colors duration-300"
            >
              Volver a Maxymia
            </Link>
          </div>
        </div>
      </main>

      <MaxymiaFooter />
    </div>
  );
}
