'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export const InnovacionCTASection: React.FC = () => {
  return (
    <section className="py-20 md:py-32 px-6 md:px-12" style={{ backgroundColor: '#016157' }}>
      <div className="max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-white text-3xl md:text-6xl lg:text-7xl font-black mb-8">
            No te quedes con dudas
          </h2>
          <p className="text-white/70 text-lg md:text-2xl font-light mb-10 md:mb-12 max-w-3xl mx-auto leading-relaxed">
            ¿Necesitas ayuda con tu proyecto? Contacta con nosotros y descubre cómo podemos
            transformar tus ideas en soluciones tecnológicas innovadoras.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              href="/contacto"
              className="group bg-mx-orange text-white px-10 py-5 rounded-full text-base font-bold tracking-wide hover:bg-mx-orange-dark transition-all duration-300 flex items-center gap-3"
            >
              Contacta con nosotros
              <ArrowUpRight
                size={20}
                className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
              />
            </Link>
            <a
              href="https://biomaximainnovacion.es/"
              target="_blank"
              rel="noopener noreferrer"
              className="group border border-white/20 text-white px-10 py-5 rounded-full text-base font-light tracking-wide hover:bg-white/10 hover:border-white/40 transition-all duration-300 flex items-center gap-3"
            >
              Visitar Biomáxima
              <ArrowUpRight
                size={20}
                className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
              />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
