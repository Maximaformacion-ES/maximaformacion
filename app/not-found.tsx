'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FontStyles } from './components/FontStyles';
import { MarketingHeader as Header } from './components/MarketingHeader';
import { Footer } from './components/Footer';

export default function NotFound() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="bg-black min-h-screen text-white selection:bg-amber-500/30 overflow-x-hidden">
      <FontStyles />
      <div className="grain" />

      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      <main className="relative z-10 flex items-center justify-center min-h-screen px-6">
        <div className="text-center max-w-2xl">
          <p className="text-amber-500 text-label-lg leading-label tracking-[0.5em] uppercase mb-6">
            Error 404
          </p>
          <h1 className="text-display-md md:text-display-lg font-black mb-6 leading-display tracking-display">
            404
          </h1>
          <h2 className="text-heading-md md:text-heading-lg font-bold mb-4 leading-heading">
            Página no encontrada
          </h2>
          <p className="text-neutral-400 mb-10 font-light leading-body text-body-md">
            La página que buscas no existe o ha sido movida.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 text-body-md font-medium rounded-full hover:bg-amber-500 hover:text-white transition-colors duration-300"
          >
            Volver al inicio
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
