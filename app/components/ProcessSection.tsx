'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Search, Lightbulb, Cog, BarChart3 } from 'lucide-react';

interface Step {
  icon: React.ElementType;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    icon: Phone,
    title: 'Contacto',
    description: 'Escuchamos tu reto y entendemos tus necesidades'
  },
  {
    icon: Search,
    title: 'Diagnóstico',
    description: 'Analizamos tus datos, procesos y contexto'
  },
  {
    icon: Lightbulb,
    title: 'Estrategia',
    description: 'Diseñamos el plan de análisis óptimo'
  },
  {
    icon: Cog,
    title: 'Ejecución',
    description: 'Implementamos la solución con rigor científico'
  },
  {
    icon: BarChart3,
    title: 'Resultados',
    description: 'Entregamos insights accionables para tu negocio'
  }
];

export const ProcessSection: React.FC = () => {
  return (
    <section className="h-dvh flex flex-col justify-center px-6 md:px-12 bg-mx-bg">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="text-mx-orange text-sm font-medium tracking-[0.5em] uppercase mb-4 block">
            Proceso de trabajo
          </span>
          <h2 className="text-mx-blue text-4xl md:text-6xl font-black mb-6">
            De la pregunta a la respuesta
          </h2>
          <p className="text-mx-text-muted text-lg font-light max-w-2xl mx-auto">
            Un método probado para transformar tus datos en decisiones
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Horizontal connecting line - desktop only */}
          <div className="hidden lg:block absolute top-7 left-[10%] right-[10%] h-px bg-mx-border" />

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-6">
            {steps.map((step, idx) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="group text-center"
              >
                {/* Step circle */}
                <div className="relative z-10 w-14 h-14 rounded-full border-2 border-mx-border bg-mx-bg flex items-center justify-center mx-auto mb-5 group-hover:border-mx-orange group-hover:shadow-lg transition-all duration-400">
                  <step.icon className="text-mx-text-muted group-hover:text-mx-orange transition-colors duration-300" size={20} />
                </div>

                {/* Step number */}
                <span className="text-mx-orange text-xs font-bold tracking-wider mb-2 block">
                  {String(idx + 1).padStart(2, '0')}
                </span>

                <h3 className="text-lg font-bold text-mx-text mb-2 group-hover:text-mx-blue transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="text-mx-text-muted text-sm font-light leading-relaxed max-w-48 mx-auto">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
