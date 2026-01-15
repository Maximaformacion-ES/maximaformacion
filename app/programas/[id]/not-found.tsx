'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FontStyles } from '../../components/FontStyles';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';

export default function NotFound() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <div className="bg-black min-h-screen text-white selection:bg-amber-500/30 overflow-x-hidden">
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
          <p className="text-neutral-400 mb-8 font-light">
            El programa que buscas no existe o ha sido eliminado.
          </p>
          <Link
            href="/programas"
            className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 text-base font-medium rounded-full hover:bg-amber-500 hover:text-white transition-colors duration-300"
          >
            Ver todos los programas
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
