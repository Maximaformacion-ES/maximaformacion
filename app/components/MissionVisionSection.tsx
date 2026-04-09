'use client';

import React from 'react';
import { m } from 'framer-motion';
import { Target, Eye, ShieldCheck } from 'lucide-react';

export const MissionVisionSection: React.FC = () => {
  return (
    <section className="pb-24 md:pb-36 xl:pb-52 bg-mx-bg px-4 md:px-6 xl:px-12">
      <div className="max-w-4xl mx-auto">
        {/* Section header */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-20"
        >
          <span className="text-mx-orange text-label-sm md:text-label-md xl:text-label-lg font-medium tracking-[0.3em] md:tracking-[0.5em] uppercase mb-4 block">
            Lo que nos define
          </span>
        </m.div>

        <div className="space-y-10 md:space-y-16">
          {/* Misión */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-5">
              <Target className="text-mx-orange" size={22} />
              <h3 className="text-heading-sm md:text-heading-md font-black text-mx-text uppercase tracking-wide">Misión</h3>
            </div>
            <p className="text-body-sm md:text-body-md text-mx-text-muted font-light leading-relaxed max-w-2xl mx-auto">
              Ofrecer formación online rigurosa y práctica que{' '}
              <span className="text-mx-text font-medium">transforme la vida profesional</span>{' '}
              de nuestros alumnos, proporcionándoles herramientas y conocimientos que generen un impacto real en sus carreras.
            </p>
          </m.div>

          <div className="w-16 h-px bg-mx-border mx-auto" />

          {/* Visión */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-5">
              <Eye className="text-mx-orange" size={22} />
              <h3 className="text-heading-sm md:text-heading-md font-black text-mx-text uppercase tracking-wide">Visión</h3>
            </div>
            <p className="text-body-sm md:text-body-md text-mx-text-muted font-light leading-relaxed max-w-2xl mx-auto">
              Ser el{' '}
              <span className="text-mx-text font-medium">referente en formación especializada de habla hispana</span>,
              liderando la innovación pedagógica y estableciendo nuevos estándares de calidad educativa online.
            </p>
          </m.div>

          <div className="w-16 h-px bg-mx-border mx-auto" />

          {/* Valores */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <ShieldCheck className="text-mx-orange" size={22} />
              <h3 className="text-heading-sm md:text-heading-md font-black text-mx-text uppercase tracking-wide">Valores</h3>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {['Cercanía', 'Rigor académico', 'Innovación constante', 'Compromiso con el alumno'].map(
                (valor) => (
                  <span
                    key={valor}
                    className="px-5 py-2.5 border border-mx-border rounded-full text-mx-text text-body-sm font-medium hover:border-mx-orange/50 hover:bg-mx-orange/5 transition-all duration-300"
                  >
                    {valor}
                  </span>
                )
              )}
            </div>
          </m.div>
        </div>
      </div>
    </section>
  );
};
