'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export const AboutCTASection: React.FC = () => {
  return (
    <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 flex flex-col items-center justify-center text-center bg-mx-orange">
      <h2 className="text-white text-heading-lg sm:text-display-sm md:text-display-md font-black mb-6 sm:mb-8 max-w-4xl">
        ¿LISTO PARA COMENZAR TU TRANSFORMACIÓN?
      </h2>
      <Link
        href="/programas"
        className="bg-white text-mx-text px-6 py-3.5 sm:px-12 sm:py-5 rounded-full text-label-md sm:text-label-lg font-black tracking-[0.1em] sm:tracking-[0.2em] uppercase hover:bg-mx-bg transition-all duration-300 group flex items-center gap-2 sm:gap-3"
      >
        VER CATÁLOGO DE PROGRAMAS <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
      </Link>
    </section>
  );
};
