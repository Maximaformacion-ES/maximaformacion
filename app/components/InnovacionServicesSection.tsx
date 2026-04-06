'use client';

import React, { useState } from 'react';
import { m } from 'framer-motion';
import { FlaskConical, Heart, BarChart3, Lightbulb, Shield, Users } from 'lucide-react';

interface Service {
  icon: React.ElementType;
  title: string;
  tagline: string;
  description: string;
}

const services: Service[] = [
  {
    icon: FlaskConical,
    title: 'Ciencia',
    tagline: 'Investigación y prototipos',
    description:
      'Impulsamos el desarrollo científico aplicando tecnología y diseño para transformar ideas en soluciones funcionales. Desde la investigación hasta la creación de prototipos, conectamos la ciencia con la innovación en salud.',
  },
  {
    icon: Heart,
    title: 'Salud',
    tagline: 'Gestión sanitaria digital',
    description:
      'Desarrollamos herramientas tecnológicas que mejoran la gestión, el acceso y el análisis de datos en entornos sanitarios, promoviendo soluciones centradas en el bienestar.',
  },
  {
    icon: BarChart3,
    title: 'Estadística',
    tagline: 'Análisis basado en evidencia',
    description:
      'Ofrecemos asesoría experta para el análisis de datos científicos y clínicos, aplicando metodologías estadísticas avanzadas para tomar decisiones basadas en evidencia.',
  },
  {
    icon: Lightbulb,
    title: 'Innovación aplicada',
    tagline: 'Soluciones patentables',
    description:
      'Diseñamos soluciones funcionales con potencial patentable para el sector científico y sanitario, transformando ideas en productos y servicios innovadores.',
  },
  {
    icon: Shield,
    title: 'Rigor científico',
    tagline: 'Metodologías validadas',
    description:
      'Garantizamos metodologías fiables y resultados de alta calidad mediante procesos rigurosos y validados científicamente.',
  },
  {
    icon: Users,
    title: 'Colaboración',
    tagline: 'Equipos multidisciplinarios',
    description:
      'Trabajamos con equipos multidisciplinarios de expertos en tecnología, biomedicina y análisis de datos para abordar desafíos complejos.',
  },
];

export const InnovacionServicesSection: React.FC = () => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const row1 = services.slice(0, 3);
  const row2 = services.slice(3, 6);

  return (
    <section className="py-20 md:py-0 px-6 md:px-12 bg-mx-bg">
      <div className="max-w-7xl mx-auto">
        {/* Right-aligned title block */}
        <m.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex md:justify-end mb-12 md:mb-20"
        >
          <div className="max-w-lg md:text-right">
            <span className="text-mx-orange text-body-sm font-medium tracking-[0.5em] uppercase mb-4 block">
              Nuestros servicios
            </span>
            <h2 className="text-[#016157] text-heading-lg md:text-display-md font-black mb-6 leading-heading uppercase">
              Todo lo que debes saber
            </h2>
            <p className="text-mx-text-muted text-body-lg font-light">
              Desarrollamos aplicaciones inteligentes, brindamos asesoría estadística especializada
              y diseñamos soluciones funcionales con potencial patentable.
            </p>
          </div>
        </m.div>

        {/* Staggered honeycomb grid — 7 cols so row 2 offsets by half without overflow */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
          {/* Row 1: cols 2-3, 4-5, 6-7 (col 1 empty — pushed right) */}
          {row1.map((service, idx) => {
            const colStartClass = ['md:[grid-column-start:2]', 'md:[grid-column-start:4]', 'md:[grid-column-start:6]'][idx];
            return (
              <div
                key={service.title}
                className={`md:col-span-2 ${colStartClass}`}
              >
                <ServiceCell
                  service={service}
                  idx={idx}
                  isHovered={hoveredIdx === idx}
                  onHover={() => setHoveredIdx(idx)}
                  onLeave={() => setHoveredIdx(null)}
                  bgVariant={idx % 2 === 0 ? 'card' : 'tint'}
                />
              </div>
            );
          })}

          {/* Row 2: cols 1-2, 3-4, 5-6 (col 7 empty — pushed left) */}
          {row2.map((service, idx) => {
            const globalIdx = idx + 3;
            return (
              <div
                key={service.title}
                className="md:col-span-2"
              >
                <ServiceCell
                  service={service}
                  idx={globalIdx}
                  isHovered={hoveredIdx === globalIdx}
                  onHover={() => setHoveredIdx(globalIdx)}
                  onLeave={() => setHoveredIdx(null)}
                  bgVariant={idx % 2 === 0 ? 'tint' : 'card'}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

function ServiceCell({
  service,
  idx,
  isHovered,
  onHover,
  onLeave,
  bgVariant,
}: {
  service: Service;
  idx: number;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  bgVariant: 'card' | 'tint';
}) {
  return (
    <m.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: idx * 0.08 }}
      className={`relative overflow-hidden rounded-lg border border-mx-border p-6 md:p-8 md:min-h-[200px] cursor-default transition-all duration-300 ${
        bgVariant === 'card' ? 'bg-mx-card' : 'bg-[#016157]/5'
      } ${isHovered ? 'border-mx-orange/50' : ''}`}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {/* Default visible content - always shown on mobile, fades on desktop hover */}
      <div
        className={`transition-all duration-300 ${
          isHovered ? 'md:opacity-0 md:-translate-y-4' : 'opacity-100 translate-y-0'
        }`}
      >
        <service.icon className="text-mx-orange mb-5" size={40} />
        <h3 className="text-heading-sm font-bold text-mx-text mb-2">{service.title}</h3>
        <p className="text-body-sm text-mx-text-muted font-light">{service.tagline}</p>
        {/* Description always visible on mobile */}
        <p className="md:hidden text-body-sm text-mx-text-muted font-light leading-relaxed mt-3">
          {service.description}
        </p>
      </div>

      {/* Hover-reveal overlay - desktop only */}
      <div
        className={`hidden md:flex absolute inset-0 p-8 flex-col justify-center transition-all duration-300 ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <h3 className="text-body-lg font-bold text-mx-text mb-3">{service.title}</h3>
        <p className="text-body-sm text-mx-text-muted font-light leading-relaxed">
          {service.description}
        </p>
      </div>
    </m.div>
  );
}
