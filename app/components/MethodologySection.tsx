'use client';

import React from 'react';
import { motion } from 'framer-motion';
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
    <section className="py-32 px-6 md:px-12 bg-mx-bg">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="text-mx-orange text-sm font-medium tracking-[0.5em] uppercase mb-4 block">
            Metodología
          </span>
          <h2 className="text-mx-blue text-4xl md:text-6xl font-black tracking-tighter mb-6">
            Formación que marca la diferencia
          </h2>
          <p className="text-mx-text-muted text-lg font-light max-w-2xl mx-auto">
            Nuestra metodología está diseñada para garantizar tu éxito profesional
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {methodologyPoints.map((point, idx) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-8 border border-mx-border bg-mx-card rounded-lg hover:border-mx-orange/50 transition-all duration-300 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-mx-orange/10 flex items-center justify-center mx-auto mb-6">
                <point.icon className="text-mx-orange" size={28} />
              </div>
              <h3 className="text-xl font-bold text-mx-text mb-3">{point.title}</h3>
              <p className="text-mx-text-muted font-light">{point.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
