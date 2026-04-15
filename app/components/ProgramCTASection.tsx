'use client';

import React from 'react';
import { m } from 'framer-motion';
import { Phone, Mail, ArrowRight } from 'lucide-react';
import type { Program } from '@/lib/strapi/types';

interface ProgramCTASectionProps {
  program: Program;
}

export const ProgramCTASection: React.FC<ProgramCTASectionProps> = ({ program }) => {
  const isMaster = program.type === 'Master';

  return (
    <section className="py-24 md:py-32 px-6 md:px-12 bg-mx-bg">
      <div className="max-w-[1200px] mx-auto text-center">
        <m.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-mx-blue text-heading-md md:text-display-sm xl:text-display-md font-black tracking-tight mb-8">
            {isMaster ? (
              <>¿INTERESADO EN ESTE <span className="text-stroke text-mx-orange">MÁSTER?</span></>
            ) : (
              <>¿LISTO PARA <span className="text-stroke text-mx-orange">COMENZAR?</span></>
            )}
          </h2>
          <p className="text-body-sm md:text-body-md xl:text-body-lg text-mx-text-muted font-light mb-12 max-w-2xl mx-auto">
            {isMaster
              ? 'Solicita información sin compromiso. Te informaremos sobre precios, plazos y opciones de financiación adaptadas a tu país.'
              : 'Únete a cientos de profesionales que ya están transformando su carrera con este programa.'}
          </p>
        </m.div>

        {isMaster && (
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mb-12"
          >
            <a
              href={`mailto:cursos@maximaformacion.es?subject=${encodeURIComponent(`Consulta sobre ${program.title}`)}`}
              className="inline-flex items-center gap-3 bg-mx-orange text-white px-8 py-4 text-body-sm md:text-body-md font-medium rounded-lg hover:bg-mx-orange-dark transition-all duration-300"
            >
              <Mail size={18} />
              Solicitar información
              <ArrowRight size={18} />
            </a>
          </m.div>
        )}

        {/* Contact Info */}
        <m.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="flex flex-col md:flex-row items-center justify-center gap-8 text-body-sm md:text-body-md text-mx-text-muted"
        >
          <a href="mailto:cursos@maximaformacion.es" className="flex items-center gap-3 hover:text-mx-orange transition-colors">
            <Mail size={18} />
            cursos@maximaformacion.es
          </a>
          <a href="tel:+34635659391" className="flex items-center gap-3 hover:text-mx-orange transition-colors">
            <Phone size={18} />
            +34 635 65 93 91
          </a>
        </m.div>
      </div>
    </section>
  );
};
