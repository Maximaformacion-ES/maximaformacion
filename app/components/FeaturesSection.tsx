'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ClipboardCheck, Code, Sparkles, GraduationCap } from 'lucide-react';

interface Feature {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  description: string;
  image?: string;
}

const features: Feature[] = [
  {
    icon: ClipboardCheck,
    title: 'Asesoría a medida',
    subtitle: 'ASESORÍA A MEDIDA',
    description: 'Analizamos con detalle cada solicitud y diseñamos un protocolo de actuación a la medida de tu negocio'
  },
  {
    icon: Code,
    title: 'R Software',
    subtitle: 'R SOFTWARE',
    description: 'Aplicamos R Software en nuestros análisis de datos, la herramienta estadística líder, más robusta, fiable y potente del mercado. Software libre con inversión a coste cero'
  },
  {
    icon: Sparkles,
    title: 'Técnicas innovadoras',
    subtitle: 'TÉCNICAS INNOVADORAS',
    description: 'Garantizamos resultados combinando técnicas clásicas, robustas, avanzadas y multivariantes (Data Mining y Big Data)'
  },
  {
    icon: GraduationCap,
    title: 'Formación online',
    subtitle: 'FORMACIÓN ONLINE',
    description: 'Nuestros cursos online en Estadística Aplicada te ayudan a dar soluciones prácticas a los problemas con datos que surgen en tu negocio'
  }
];

export const FeaturesSection: React.FC = () => {
  return (
    <section className="py-32 px-6 md:px-12 bg-mx-bg">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-mx-blue text-4xl md:text-6xl font-black tracking-tighter mb-6">
            La Ciencia de Datos al servicio de tu negocio
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group relative overflow-hidden border border-mx-border bg-mx-card rounded-lg hover:border-mx-orange/50 transition-all duration-300"
            >
              <div className="p-10">
                <feature.icon className="text-mx-orange mb-6" size={40} />
                <span className="text-mx-text-muted text-xs font-medium tracking-[0.3em] uppercase mb-4 block">
                  {feature.subtitle}
                </span>
                <h3 className="text-2xl font-bold text-mx-text mb-4">{feature.title}</h3>
                <p className="text-mx-text-muted font-light leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
