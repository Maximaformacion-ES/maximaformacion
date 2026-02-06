'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Smartphone, GraduationCap } from 'lucide-react';

interface Project {
  icon: React.ElementType;
  title: string;
  description: string;
  url: string;
}

const projects: Project[] = [
  {
    icon: Smartphone,
    title: 'SAPO Statistical Assistant',
    description: 'Aplicación móvil que automatiza el análisis estadístico y genera resultados listos para publicar. Guía paso a paso a investigadores en la selección de metodologías estadísticas adecuadas.',
    url: 'https://biomaximainnovacion.es/sapo'
  },
  {
    icon: GraduationCap,
    title: 'Maxymia: Formación en IA aplicada',
    description: 'Plataforma de cursos online especializados en inteligencia artificial aplicada a ciencia, salud y biotecnología. Cursos prácticos con asistente inteligente integrado.',
    url: 'https://maxymia.com/'
  }
];

export const InnovacionProjectsSection: React.FC = () => {
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
            Conoce nuestros proyectos
          </span>
          <h2 className="text-mx-blue text-4xl md:text-6xl font-black tracking-tighter mb-6">
            Explora nuestras soluciones aplicadas
          </h2>
          <p className="text-mx-text-muted text-lg font-light max-w-2xl mx-auto">
            Cada proyecto refleja nuestro compromiso con la innovación funcional y el impacto real 
            en el sector científico-sanitario.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project, idx) => (
            <motion.a
              key={project.title}
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group relative p-10 border border-mx-border bg-mx-card rounded-lg hover:border-mx-orange/50 transition-all duration-300 block"
            >
              <project.icon className="text-mx-orange mb-6" size={40} />
              <h3 className="text-2xl font-bold text-mx-text mb-4 group-hover:text-mx-orange transition-colors">
                {project.title}
              </h3>
              <p className="text-mx-text-muted font-light leading-relaxed mb-6">
                {project.description}
              </p>
              <div className="flex items-center gap-2 text-mx-orange font-medium">
                <span>Saber más</span>
                <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </div>
              <div className="absolute bottom-0 left-0 h-1 bg-mx-orange rounded-b-lg transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-in-out origin-left w-full" />
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};
