'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, Database, PieChart, TrendingUp, Brain, Workflow } from 'lucide-react';

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
  return (
    <section className="py-32 px-6 md:px-12 bg-mx-bg">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="text-mx-orange text-sm font-medium tracking-[0.5em] uppercase mb-4 block">
            Así podemos ayudarte
          </span>
          <h2 className="text-mx-blue text-4xl md:text-6xl font-black tracking-tighter mb-6 text-balance">
            Resolvemos los desafíos estadísticos de tu empresa
          </h2>
          <p className="text-mx-text-muted text-lg font-light max-w-2xl mx-auto">
            Para que extraigas el máximo valor de los datos generados en tu negocio
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, idx) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-8 border border-mx-border bg-mx-card rounded-lg hover:border-mx-orange/50 transition-all duration-300 group"
            >
              <service.icon className="text-mx-orange mb-6" size={32} />
              <h3 className="text-xl font-bold text-mx-text mb-4">{service.title}</h3>
              <p className="text-mx-text-muted font-light leading-relaxed">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
