'use client';

import React from 'react';
import { m } from 'framer-motion';
import { Monitor, Users, Target, TrendingUp, BookOpen, MessageSquare } from 'lucide-react';

interface MethodologyPoint {
  icon: React.ElementType;
  title: string;
  description: string;
}

const methodologyPoints: MethodologyPoint[] = [
  {
    icon: Monitor,
    title: '100% Online',
    description: 'Acceso desde cualquier lugar y en cualquier momento'
  },
  {
    icon: Users,
    title: 'Seguimiento tutorizado',
    description: 'Acompañamiento personalizado durante todo el proceso formativo'
  },
  {
    icon: Target,
    title: 'Aplicación práctica',
    description: 'Enfoque en casos reales y proyectos aplicables a tu negocio'
  },
  {
    icon: TrendingUp,
    title: 'Aprendizaje progresivo',
    description: 'Estructura pedagógica que facilita la asimilación de conceptos'
  },
  {
    icon: BookOpen,
    title: 'Contenidos propios',
    description: 'Material desarrollado por expertos con años de experiencia'
  },
  {
    icon: MessageSquare,
    title: 'Feedback personalizado',
    description: 'Evaluación continua y retroalimentación adaptada a tu progreso'
  }
];

export const MethodologySection: React.FC = () => {
  return (
    <section className="py-20 md:py-0 flex flex-col justify-center px-6 md:px-12 bg-mx-bg">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          {/* Left: title block */}
          <m.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:w-2/5 flex flex-col justify-center"
          >
            <span className="text-mx-orange text-body-sm font-medium tracking-[0.5em] uppercase mb-4 block">
              Metodología
            </span>
            <h2 className="text-mx-blue text-display-sm md:text-display-sm lg:text-display-md font-black mb-6 leading-tight text-balance">
              Formación que marca la diferencia
            </h2>
            <p className="text-mx-text-muted text-body-lg font-light leading-relaxed text-balance">
              Nuestra metodología está diseñada para garantizar tu éxito profesional
            </p>
          </m.div>

          {/* Right: numbered list */}
          <div className="lg:w-3/5">
            {methodologyPoints.map((point, idx) => (
              <m.div
                key={point.title}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.07, duration: 0.5 }}
                className="group flex items-center gap-5 py-5 border-b border-mx-border last:border-b-0"
              >
                {/* Number */}
                <span className="text-mx-orange text-body-sm font-bold tabular-nums shrink-0 w-6">
                  {String(idx + 1).padStart(2, '0')}
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-body-md font-bold text-mx-text group-hover:text-mx-blue transition-colors duration-300">
                    {point.title}
                  </h3>
                  <p className="text-mx-text-muted text-body-sm font-light mt-0.5">
                    {point.description}
                  </p>
                </div>

                {/* Icon - decorative, right side */}
                <point.icon
                  className="text-mx-border group-hover:text-mx-orange transition-colors duration-400 shrink-0"
                  size={18}
                />
              </m.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
