'use client';

import React from 'react';
import Image from 'next/image';
import { m } from 'framer-motion';
import { Smartphone, Zap, BarChart3, Globe, Link as LinkIcon, BookOpen, ArrowUpRight } from 'lucide-react';

const SAPO_TEAL = '#016157';
const SAPO_URL = 'https://www.sapo.university/';

interface SAPOFeature {
  icon: React.ElementType;
  title: string;
  description: string;
}

const sapoFeatures: SAPOFeature[] = [
  {
    icon: Smartphone,
    title: 'Interfaz intuitiva',
    description: 'Navegación clara y procesos guiados paso a paso.',
  },
  {
    icon: Zap,
    title: 'Automatización de procesos',
    description: 'Sugerencia automática de la metodología estadística más adecuada.',
  },
  {
    icon: BarChart3,
    title: 'Análisis avanzado',
    description: 'Descriptivos avanzados, gráficos y resultados con rigor científico.',
  },
  {
    icon: Globe,
    title: 'Soporte multilingüe',
    description: 'Disponible en múltiples idiomas para investigadores de todo el mundo.',
  },
  {
    icon: LinkIcon,
    title: 'Integración con plataformas',
    description: 'Conecta con tus herramientas y exporta en múltiples formatos.',
  },
  {
    icon: BookOpen,
    title: 'Asistencia guiada',
    description: 'Ayuda contextual con explicaciones claras de conceptos estadísticos.',
  },
];

export const InnovacionSAPOSection: React.FC = () => {
  return (
    <section className="py-20 md:py-32 px-6 md:px-12 bg-mx-bg overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Sub-zone A: Product hero with image. The image now lives as an
            oversized absolute layer hugging the right edge so it reads as
            a backdrop rather than an inline screenshot, while the text
            column keeps its half-width so copy stays legible on top. */}
        <div className="relative flex flex-col lg:flex-row items-center gap-12 lg:gap-20 mb-16 md:mb-32">
          {/* Background images — desktop only, behind the text. Two
              mockups stacked vertically on the right half. Centered as
              a group via top-1/2 + -translate-y-1/2 so the pair grows
              upward and downward equally around the section midpoint. */}
          <m.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="hidden lg:flex flex-col gap-8 pointer-events-none absolute top-1/2 -translate-y-1/2 right-0 z-0 w-full max-w-xl opacity-90"
            aria-hidden="true"
          >
            <Image
              src="/sapo_university-mockup.png"
              alt=""
              className="w-full h-auto drop-shadow-2xl"
              width={448}
              height={800}
            />
            <Image
              src="/sapo-mockup-2.png"
              alt=""
              className="w-full h-auto drop-shadow-2xl"
              width={448}
              height={800}
            />
          </m.div>

          {/* Left: Text content + cards */}
          <m.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative z-10 lg:w-1/2"
          >
            <span
              className="text-label-sm md:text-label-md xl:text-label-lg font-medium tracking-[0.5em] uppercase mb-4 block text-mx-orange"
            >
              Te presentamos nuestra plataforma
            </span>
            <h2 className="text-heading-sm md:text-heading-md xl:text-heading-lg font-black mb-6" style={{ color: SAPO_TEAL }}>
              Conoce SAPO
            </h2>
            <p className="text-mx-text-muted text-body-sm md:text-body-md xl:text-body-lg font-light leading-relaxed mb-6">
              Una plataforma que automatiza el análisis estadístico y genera resultados listos para publicar,
              sin necesidad de programar.
            </p>
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-body-sm font-bold"
              style={{ backgroundColor: `${SAPO_TEAL}15`, color: SAPO_TEAL }}
            >
              ✓ Completamente gratuita
            </div>

            <div className="space-y-4 mb-8">
              <div className="p-6 border rounded-lg" style={{ borderColor: `${SAPO_TEAL}20`, backgroundColor: `${SAPO_TEAL}05` }}>
                <h3 className="text-body-sm md:text-body-md font-bold text-mx-text mb-2">
                  Asistencia estadística automatizada
                </h3>
                <p className="text-mx-text-muted font-light text-body-sm">
                  La plataforma te guía paso a paso: recopila información clave de tu estudio y te sugiere
                  automáticamente la metodología estadística más adecuada.
                </p>
              </div>
              <div className="p-6 border rounded-lg" style={{ borderColor: `${SAPO_TEAL}20`, backgroundColor: `${SAPO_TEAL}05` }}>
                <h3 className="text-body-sm md:text-body-md font-bold text-mx-text mb-2">
                  Generación automática de resultados
                </h3>
                <p className="text-mx-text-muted font-light text-body-sm">
                  Obtén análisis listos para publicar sin necesidad de programar. Genera descriptivos
                  avanzados, gráficos y resultados estadísticos con rigor científico.
                </p>
              </div>
            </div>

            <a
              href={SAPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-full text-white font-bold tracking-wide transition-all duration-300 hover:opacity-90"
              style={{ backgroundColor: SAPO_TEAL }}
            >
              Probar SAPO gratis
              <ArrowUpRight
                size={20}
                className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
              />
            </a>
          </m.div>

          {/* Mobile/tablet inline images — on lg+ the absolute backdrop
              above replaces this so we don't render the screenshots twice. */}
          <m.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:hidden w-full flex flex-col items-center gap-8"
          >
            <Image
              src="/sapo_university-mockup.png"
              alt="SAPO Statistical Assistant"
              className="w-full max-w-md drop-shadow-2xl"
              width={448}
              height={800}
            />
            <Image
              src="/sapo-mockup-2.png"
              alt="SAPO Statistical Assistant"
              className="w-full max-w-md drop-shadow-2xl"
              width={448}
              height={800}
            />
          </m.div>
        </div>

        {/* Sub-zone B: Features - 2 columns, no cards */}
        <div className="mb-16 md:mb-32 relative">
          {/* Decorative concentric rings */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full border" style={{ borderColor: `${SAPO_TEAL}10` }} />
            <div className="absolute inset-4 md:inset-8 rounded-full border" style={{ borderColor: `${SAPO_TEAL}08` }} />
            <div className="absolute inset-8 md:inset-16 rounded-full border" style={{ borderColor: `${SAPO_TEAL}05` }} />
          </div>

          <m.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-heading-sm md:text-heading-md xl:text-heading-lg font-bold text-mx-text text-center mb-16 relative"
          >
            Características principales
          </m.h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10 max-w-4xl mx-auto relative">
            {sapoFeatures.map((feature, idx) => (
              <m.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="flex items-start gap-4"
              >
                <feature.icon className="shrink-0 mt-1" size={22} style={{ color: SAPO_TEAL }} />
                <div>
                  <h4 className="text-body-sm md:text-body-md font-bold text-mx-text mb-1">{feature.title}</h4>
                  <p className="text-body-sm text-mx-text-muted font-light leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </m.div>
            ))}
          </div>
        </div>

        {/* Sub-zone C: Final CTA - free access banner */}
        <m.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto"
        >
          <h3 className="text-heading-sm md:text-heading-md xl:text-heading-lg font-bold text-mx-text mb-4">
            Sin coste, sin barreras
          </h3>
          <p className="text-mx-text-muted text-body-sm md:text-body-md font-light leading-relaxed mb-8">
            SAPO es completamente gratuito. Solo tienes que crear una cuenta y empezar a analizar tus datos.
          </p>
          <a
            href={SAPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-full text-white font-bold tracking-wide transition-all duration-300 hover:opacity-90"
            style={{ backgroundColor: SAPO_TEAL }}
          >
            Acceder a SAPO
            <ArrowUpRight
              size={20}
              className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
            />
          </a>
        </m.div>
      </div>
    </section>
  );
};
