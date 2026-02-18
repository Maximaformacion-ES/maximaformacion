'use client';

import React from 'react';
import { m } from 'framer-motion';
import { FlaskConical, Microscope, Network } from 'lucide-react';
import { StyledTitle } from './StyledTitle';

const differentiators = [
  {
    icon: FlaskConical,
    title: 'Asesoramiento especializado en técnicas experimentales',
    description:
      'Orientación experta a centros públicos y empresas privadas sobre las técnicas experimentales más adecuadas para cada tipo de investigación. Optimizamos procesos de investigación garantizando resultados de alta calidad.',
  },
  {
    icon: Microscope,
    title: 'Infraestructura y soporte instrumental de vanguardia',
    description:
      'Recursos e infraestructura necesarios para el desarrollo de investigaciones de calidad en el ámbito biosanitario y biotecnológico. Acceso a equipos y tecnologías avanzadas que facilitan la ejecución eficiente de proyectos científicos.',
  },
  {
    icon: Network,
    title: 'Gestión y coordinación de metodologías de investigación',
    description:
      'Gestionamos y coordinamos la metodología requerida para los planes de investigación, desde la fase in vitro. Enfoque integral que asegura una implementación efectiva de los proyectos, optimizando recursos y tiempos.',
  },
];

export const InnovacionAboutSection: React.FC = () => {
  return (
    <section id="sobre-nosotros" className="py-20 md:py-32 px-6 md:px-12 bg-mx-bg">
      <div className="max-w-7xl mx-auto">
        {/* Left-aligned editorial header */}
        <m.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mb-16"
        >
          <span className="text-mx-orange text-sm font-medium tracking-[0.5em] uppercase mb-4 block">
            Sobre Biomáxima
          </span>
          <h2 className="text-[#016157] text-3xl md:text-6xl font-black mb-6">
            <StyledTitle text="BIOMÁXIMA {INNOVACION®}" />
          </h2>
          <p className="text-mx-text-muted text-lg md:text-xl font-light leading-relaxed">
            Empresa altamente especializada en el desarrollo de soluciones tecnológicas avanzadas,
            enfocándose principalmente en los campos de la ciencia, la salud y la medicina.
          </p>
          <p className="text-mx-text-muted font-light leading-relaxed text-lg mt-4">
            Nuestro compromiso es innovar y crear herramientas que no solo optimicen procesos,
            sino que también mejoren la calidad de vida de las personas. A través de un equipo
            multidisciplinario de expertos en tecnología, biomedicina y análisis de datos,
            trabajamos para diseñar aplicaciones y sistemas que aborden desafíos complejos en estos sectores.
          </p>
        </m.div>

        {/* Vertical timeline with alternating sides */}
        <div className="relative">
          {/* Central vertical line - desktop only */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-mx-border -translate-x-1/2" />
          {/* Left vertical line - mobile only */}
          <div className="md:hidden absolute left-4 top-0 bottom-0 w-px bg-mx-border" />

          <div className="flex flex-col gap-6 md:gap-8">
            {differentiators.map((item, idx) => {
              // 1st right, 2nd left, 3rd left
              const sides: ('left' | 'right')[] = ['right', 'left', 'right'];
              const isLeft = sides[idx] === 'left';

              return (
                <m.div
                  key={item.title}
                  initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="relative"
                >
                  {/* Orange dot node on axis - desktop */}
                  <div className="hidden md:block absolute left-1/2 top-6 -translate-x-1/2 z-10">
                    <div className="w-4 h-4 rounded-full bg-mx-orange" />
                    <div className="absolute inset-0 w-4 h-4 rounded-full bg-mx-orange/30 animate-ping" />
                  </div>

                  {/* Orange dot node - mobile (left side) */}
                  <div className="md:hidden absolute left-4 top-6 -translate-x-1/2 z-10">
                    <div className="w-3 h-3 rounded-full bg-mx-orange" />
                  </div>

                  {/* Content - alternating sides on desktop, always right on mobile */}
                  <div
                    className={`md:w-[45%] pl-10 md:pl-0 ${
                      isLeft ? 'md:mr-auto md:pr-16' : 'md:ml-auto md:pl-16'
                    }`}
                  >
                    <div className="mb-4">
                      <item.icon className="text-mx-orange" size={28} />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-mx-text mb-4">
                      {item.title}
                    </h3>
                    <p className="text-mx-text-muted font-light leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </m.div>
              );
            })}
          </div>
        </div>

        {/* Vision pull-quote */}
        <m.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 max-w-3xl mx-auto"
        >
          <blockquote className="relative text-center mt-20 md:mt-48">
            {/* Large decorative quote mark */}
            <span className="block text-[6rem] leading-none text-mx-orange/20 font-serif select-none -mb-6">
              &ldquo;
            </span>
            <p className="text-xl md:text-2xl text-mx-text italic leading-relaxed text-balance">
              Biomáxima se proyecta como un{' '}
              <span className="text-[#016157] not-italic font-semibold">
                referente nacional e internacional en asesoría y soluciones biotecnológicas y biosanitarias
              </span>
              . Su visión consiste en{' '}
              <span className="text-[#016157] not-italic font-semibold">
                impulsar la innovación científica y tecnológica
              </span>{' '}
              para mejorar la eficiencia, precisión y aplicabilidad de la investigación en salud y biotecnología.
            </p>
            <footer className="mt-6 text-sm text-mx-text-muted font-medium tracking-wide uppercase">
              — Visión de Biomáxima Innovación
            </footer>
          </blockquote>
        </m.div>
      </div>
    </section>
  );
};
