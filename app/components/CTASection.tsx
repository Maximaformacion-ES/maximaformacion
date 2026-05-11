'use client';

import React from 'react';
import { m } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { StyledTitle } from './StyledTitle';

interface CTASectionProps {
  overline?: string;
  title?: string;
  description?: string;
}

export const CTASection: React.FC<CTASectionProps> = ({
  overline = '¿Listo para empezar?',
  title = 'TU PRÓXIMO {CAPÍTULO} EMPIEZA HOY',
  description = 'Habla con nuestro equipo de asesores académicos y encuentra el programa perfecto para tus objetivos profesionales.',
}) => {
  return (
    <section className="relative py-16 md:py-48 bg-mx-bg overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-mx-orange/5 rounded-full blur-[200px]" />
      </div>

      <div className="max-w-[1200px] mx-auto px-6 md:px-12 relative text-center">
        <m.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-mx-orange text-label-sm md:text-label-md xl:text-label-lg leading-label tracking-[0.3em] uppercase mb-6"
        >
          {overline}
        </m.p>

        <m.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-mx-blue text-heading-lg md:text-display-sm lg:text-display-md font-black tracking-display leading-[1] mb-8"
        >
          <StyledTitle text={title} />
        </m.h2>

        <m.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-mx-text-muted text-body-sm md:text-body-md xl:text-body-lg font-light max-w-2xl mx-auto mb-12 leading-body"
        >
          {description}
        </m.p>

        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <m.a
            href="/contacto"
            className="group flex items-center justify-center gap-3 bg-mx-orange text-white px-6 py-3 text-label-sm md:text-label-md font-medium rounded-full hover:bg-mx-orange/90 transition duration-300"
            
            whileTap={{ scale: 0.98 }}
          >
            Solicitar Información
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </m.a>
          <m.a
            href="tel:+34635659391"
            className="flex items-center justify-center gap-3 border border-mx-orange text-mx-orange px-6 py-3 text-label-sm md:text-label-md font-light rounded-full hover:bg-mx-orange/10 hover:border-mx-orange transition duration-300"
            
            whileTap={{ scale: 0.98 }}
          >
            Agendar Llamada
          </m.a>
        </m.div>
      </div>
    </section>
  );
};
