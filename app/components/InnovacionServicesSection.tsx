'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FlaskConical, Heart, BarChart3, Lightbulb, Shield, Users } from 'lucide-react';

interface Service {
  icon: React.ElementType;
  title: string;
  description: string;
}

const services: Service[] = [
  {
    icon: FlaskConical,
    title: 'Ciencia',
    description: 'Impulsamos el desarrollo científico aplicando tecnología y diseño para transformar ideas en soluciones funcionales. Desde la investigación hasta la creación de prototipos, conectamos la ciencia con la innovación en salud.'
  },
  {
    icon: Heart,
    title: 'Salud',
    description: 'Desarrollamos herramientas tecnológicas que mejoran la gestión, el acceso y el análisis de datos en entornos sanitarios, promoviendo soluciones centradas en el bienestar.'
  },
  {
    icon: BarChart3,
    title: 'Estadística',
    description: 'Ofrecemos asesoría experta para el análisis de datos científicos y clínicos, aplicando metodologías estadísticas avanzadas para tomar decisiones basadas en evidencia.'
  },
  {
    icon: Lightbulb,
    title: 'Innovación aplicada',
    description: 'Diseñamos soluciones funcionales con potencial patentable para el sector científico y sanitario, transformando ideas en productos y servicios innovadores.'
  },
  {
    icon: Shield,
    title: 'Rigor científico',
    description: 'Garantizamos metodologías fiables y resultados de alta calidad mediante procesos rigurosos y validados científicamente.'
  },
  {
    icon: Users,
    title: 'Colaboración',
    description: 'Trabajamos con equipos multidisciplinarios de expertos en tecnología, biomedicina y análisis de datos para abordar desafíos complejos.'
  }
];

export const InnovacionServicesSection: React.FC = () => {
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
            Ofrecemos varios servicios
          </span>
          <h2 className="text-mx-blue text-4xl md:text-6xl font-black tracking-tighter mb-6">
            Todo lo que debes saber
          </h2>
          <p className="text-mx-text-muted text-lg font-light max-w-2xl mx-auto">
            Desarrollamos aplicaciones inteligentes, brindamos asesoría estadística especializada 
            y diseñamos soluciones funcionales con potencial patentable para el sector científico y sanitario.
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

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <p className="text-2xl md:text-3xl font-light text-mx-text-muted italic max-w-3xl mx-auto">
            Donde la ciencia se encuentra con la tecnología, nace la innovación que transforma la salud.
          </p>
        </motion.div>
      </div>
    </section>
  );
};
