'use client';

import React from 'react';
import { m } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export const ConsultoriaCTASection: React.FC = () => {
  return (
    <section className="py-32 px-6 md:px-12 bg-mx-blue">
      <div className="max-w-5xl mx-auto text-center">
        <m.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-mx-bg text-display-sm md:text-display-md lg:text-display-md font-black mb-8 text-balance">
              Toma decisiones concluyentes basadas en datos
            </h2>
          <p className="text-mx-bg text-heading-sm md:text-heading-md font-light mb-12 max-w-3xl mx-auto leading-relaxed">
              Descubre el poder de los datos que genera tu negocio
            </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                href="/contacto"
              className="group bg-mx-orange text-white px-10 py-5 rounded-full text-body-md font-bold tracking-wide transition-all duration-300 flex items-center gap-3"
              >
                Consulta gratuita
                <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
              <Link
                href="/programas"
              className="group border border-mx-bg/20 text-mx-bg px-10 py-5 rounded-full text-body-md font-light tracking-wide hover:bg-mx-bg/10 hover:border-mx-bg/40 transition-all duration-300 flex items-center gap-3"
              >
                Ver formación
                <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            </div>
        </m.div>
      </div>
    </section>
  );
};
