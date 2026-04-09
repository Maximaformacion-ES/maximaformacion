'use client';

import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Database, PieChart, TrendingUp, Brain, Workflow } from 'lucide-react';
import { StyledTitle } from './StyledTitle';

interface Service {
  icon: React.ElementType;
  title: string;
  description: string;
}

const services: Service[] = [
  {
    icon: LayoutGrid,
    title: 'Diseño',
    description: 'Diseñamos la estrategia de análisis óptima para ofrecerte una visión global de los procesos y los resultados de tu negocio'
  },
  {
    icon: Database,
    title: 'Tratamiento',
    description: 'Gestionamos tus datos para que tomes decisiones adecuadas basadas en la correcta interpretación de los datos'
  },
  {
    icon: PieChart,
    title: 'Comunicación',
    description: 'Elaboramos gráficos de alta calidad para hacer comprensible la valiosa información que reside en los datos de tu negocio'
  },
  {
    icon: TrendingUp,
    title: 'Optimización',
    description: 'Evaluamos los sistemas de análisis de datos y planteamos mejoras para incrementar la calidad de servicio y la rentabilidad'
  },
  {
    icon: Brain,
    title: 'Predicción',
    description: 'Desarrollamos modelos de análisis predictivo, y obtenemos información clave sobre las tendencias en tu negocio o sector'
  },
  {
    icon: Workflow,
    title: 'Automatización',
    description: 'Proponemos sistemas de centralización y automatización que permiten gestionar con eficiencia grandes volúmenes de datos'
  }
];

export const ServicesGridSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeService = services[activeIndex];

  return (
    <section className="py-20 md:py-0 md:h-dvh flex flex-col justify-center px-6 md:px-12 bg-mx-bg">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <m.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 md:mb-16"
        >
          <span className="text-mx-orange text-label-sm md:text-label-md xl:text-label-lg font-medium tracking-[0.5em] uppercase mb-4 block">
            Así podemos ayudarte
          </span>
          <h2 className="text-mx-blue text-heading-sm md:text-heading-md xl:text-heading-lg font-black text-balance md:w-2/3">
            Resolvemos los desafíos estadísticos de tu empresa
          </h2>
        </m.div>

        {/* Interactive list + detail panel */}
        <div className="flex flex-col-reverse lg:flex-row gap-8 lg:gap-12">
          {/* Left: clickable list */}
          <div className="lg:w-2/5 grid grid-cols-2 lg:grid-cols-1 gap-1">
            {services.map((service, idx) => {
              const isActive = idx === activeIndex;
              return (
                <m.button
                  key={service.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.06 }}
                  onClick={() => setActiveIndex(idx)}
                  className={`group relative w-full flex items-center gap-2 lg:gap-4 px-3 py-3 lg:px-6 lg:py-5 rounded-xl text-left transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-mx-card border border-mx-orange/30 shadow-lg'
                      : 'border border-transparent hover:bg-mx-card/60 hover:border-mx-border'
                  }`}
                >
                  {/* Active indicator bar */}
                  <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-full transition-all duration-300 ${
                    isActive ? 'bg-mx-orange' : 'bg-transparent group-hover:bg-mx-border'
                  }`} />

                  {/* Number - hidden on mobile */}
                  <span className={`hidden lg:inline text-body-sm font-bold tabular-nums transition-colors duration-300 ${
                    isActive ? 'text-mx-orange' : 'text-mx-text-muted'
                  }`}>
                    {String(idx + 1).padStart(2, '0')}
                  </span>

                  {/* Icon */}
                  <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 ${
                    isActive ? 'bg-mx-orange text-white' : 'bg-mx-orange/10 text-mx-orange'
                  }`}>
                    <service.icon size={18} />
                  </div>

                  {/* Title */}
                  <span className={`text-body-sm md:text-body-md font-semibold transition-colors duration-300 ${
                    isActive ? 'text-mx-blue' : 'text-mx-text group-hover:text-mx-blue'
                  }`}>
                    {service.title}
                  </span>
                </m.button>
              );
            })}
          </div>

          {/* Right: detail panel */}
          <div className="lg:w-3/5 relative min-h-0 lg:min-h-[280px] flex items-center lg:ml-8">
            <AnimatePresence mode="wait">
              <m.div
                key={activeIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="relative w-full"
              >
                {/* Decorative number watermark */}
                <span className="absolute -right-4 -top-6 text-[10rem] font-black text-mx-blue/4 leading-none select-none pointer-events-none hidden lg:block">
                  {String(activeIndex + 1).padStart(2, '0')}
                </span>

                <div className="relative z-10">
                  <h3 className="text-heading-sm md:text-heading-md xl:text-heading-lg font-black text-mx-blue mb-4 md:mb-6">
                    <StyledTitle text={'{' + activeService.title.toUpperCase() + '}'} color="blue" />
                  </h3>
                  <p className="text-mx-text-muted text-body-sm md:text-body-md xl:text-body-lg font-light leading-relaxed max-w-xl">
                    {activeService.description}
                  </p>
                </div>
              </m.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};
