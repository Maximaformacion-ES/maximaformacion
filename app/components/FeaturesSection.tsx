'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ClipboardCheck, Code, Sparkles, GraduationCap } from 'lucide-react';

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: ClipboardCheck,
    title: 'Asesoría a medida',
    description: 'Protocolo de actuación diseñado a la medida de tu negocio'
  },
  {
    icon: Code,
    title: 'R Software',
    description: 'La herramienta estadística líder, más robusta y potente del mercado'
  },
  {
    icon: Sparkles,
    title: 'Técnicas innovadoras',
    description: 'Técnicas clásicas, robustas, avanzadas y multivariantes'
  },
  {
    icon: GraduationCap,
    title: 'Formación online',
    description: 'Soluciones prácticas a los problemas con datos de tu negocio'
  }
];

export const FeaturesSection: React.FC = () => {
  return (
    <section className="py-20 md:py-0 md:h-[70dvh] flex flex-col justify-center px-6 md:px-12 bg-mx-bg">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row-reverse gap-12 lg:gap-16 lg:items-center">
          {/* Right side: title block */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:w-2/5 flex flex-col justify-center"
          >
            <span className="text-mx-orange text-sm font-medium tracking-[0.5em] uppercase mb-4 block">
              Nuestras fortalezas
            </span>
            <h2 className="text-mx-blue text-4xl md:text-5xl lg:text-5xl font-black mb-6 leading-tight text-balance">
              La Ciencia de Datos al servicio de tu negocio
            </h2>
            <p className="text-mx-text-muted text-lg font-light leading-relaxed text-balance">
              Herramientas, metodología y experiencia para transformar datos en decisiones
            </p>
          </motion.div>

          {/* Left side: 2x2 grid */}
          <div className="lg:w-3/5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08, duration: 0.5 }}
                className="group relative p-6 rounded-2xl border border-mx-border bg-mx-card hover:border-mx-orange/30 hover:-translate-y-0.5 transition-all duration-400 overflow-hidden"
              >
                {/* Large background number */}
                <span className="absolute -bottom-3 -right-1 text-7xl font-black text-mx-blue/5 leading-none select-none pointer-events-none">
                  {String(idx + 1).padStart(2, '0')}
                </span>

                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-mx-orange/10 flex items-center justify-center mb-4">
                    <feature.icon className="text-mx-orange" size={20} />
                  </div>
                  <h3 className="text-base font-bold text-mx-text mb-1.5 group-hover:text-mx-blue transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-mx-text-muted text-sm font-light leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
