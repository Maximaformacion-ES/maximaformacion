'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export const ConsultoriaCTASection: React.FC = () => {
  return (
    <section className="py-32 px-6 md:px-12 bg-gradient-to-b from-black via-neutral-950 to-black">
      <div className="max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter mb-8">
            Toma decisiones concluyentes basadas en datos
          </h2>
          <p className="text-white/70 text-xl md:text-2xl font-light mb-12 max-w-3xl mx-auto leading-relaxed">
            Descubre el poder de los datos que genera tu negocio
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              href="/contacto"
              className="group bg-white text-black px-10 py-5 rounded-full text-base font-bold tracking-wide hover:bg-amber-500 hover:text-white transition-all duration-300 flex items-center gap-3"
            >
              Consulta gratuita
              <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
            <Link
              href="/programas"
              className="group border border-white/30 text-white px-10 py-5 rounded-full text-base font-light tracking-wide hover:bg-white/10 transition-all duration-300 flex items-center gap-3"
            >
              Ver formación
              <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
