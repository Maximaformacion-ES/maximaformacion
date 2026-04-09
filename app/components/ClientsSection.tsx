'use client';

import React from 'react';
import { m } from 'framer-motion';

const clients = [
  { name: 'CSIC', logo: 'https://via.placeholder.com/150x80/ffffff/000000?text=CSIC' },
  { name: 'Mapfre', logo: 'https://via.placeholder.com/150x80/ffffff/000000?text=MAPFRE' },
  { name: 'Asebio', logo: 'https://via.placeholder.com/150x80/ffffff/000000?text=ASEBIO' },
  { name: 'Abbott', logo: 'https://via.placeholder.com/150x80/ffffff/000000?text=ABBOTT' },
  { name: 'RTVE', logo: 'https://via.placeholder.com/150x80/ffffff/000000?text=RTVE' },
  { name: 'Tuenti', logo: 'https://via.placeholder.com/150x80/ffffff/000000?text=TUENTI' }
];

export const ClientsSection: React.FC = () => {
  return (
    <section className="py-20 md:py-0 md:h-[70dvh] flex flex-col justify-center px-6 md:px-12 bg-mx-bg">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 lg:items-stretch">
          {/* Left: testimonial card */}
          <m.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-1/2"
          >
            <div
              className="h-full relative overflow-hidden p-10 md:p-14 rounded-2xl text-white flex flex-col justify-center"
              style={{ backgroundColor: 'var(--color-mx-blue)' }}
            >
              <span className="text-white/40 text-label-sm md:text-label-md font-medium tracking-[0.5em] uppercase mb-10 block">
                Confían en nosotros
              </span>
              <p className="text-white/90 text-body-sm md:text-body-md xl:text-body-lg font-light leading-relaxed italic mb-8">
                &ldquo;Gracias al equipo de Máxima Consultoría, optimizamos nuestros procesos de análisis de datos reduciendo significativamente los tiempos de decisión.&rdquo;
              </p>
              <div className="w-8 h-0.5 bg-white/20 mb-4" />
              <span className="text-white/50 text-body-sm font-medium uppercase tracking-wider">
                Director de Análisis — Centro de investigación
              </span>
            </div>
          </m.div>

          {/* Right: header + client logos */}
          <div className="lg:w-1/2 flex flex-col justify-center">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-10"
            >
              <h2 className="text-mx-blue text-heading-sm md:text-heading-md xl:text-heading-lg font-black mb-4 text-balance">
                Empresas e instituciones líderes
              </h2>
              <p className="text-mx-text-muted text-body-sm md:text-body-md font-light leading-relaxed">
                Más de 10 años de experiencia liderando proyectos en empresas, entidades públicas y centros de investigación
              </p>
            </m.div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {clients.map((client, idx) => (
                <m.div
                  key={client.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.06 }}
                  className="group flex items-center justify-center p-6 border border-mx-border bg-mx-card rounded-xl hover:border-mx-orange/30 hover:-translate-y-0.5 transition-all duration-400"
                >
                  <span className="text-mx-text-muted group-hover:text-mx-blue text-body-sm md:text-body-md font-bold tracking-wide transition-colors duration-300">
                    {client.name}
                  </span>
                </m.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
