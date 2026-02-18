'use client';

import React from 'react';
import Image from 'next/image';
import { m } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

interface Project {
  title: string;
  description: string;
  url: string;
  image: string;
}

const projects: Project[] = [
  {
    title: 'SAPO Statistical Assistant',
    description:
      'Aplicación móvil que automatiza el análisis estadístico y genera resultados listos para publicar.',
    url: 'https://biomaximainnovacion.es/sapo',
    image: '/sapo_url.png',
  },
  {
    title: 'Maxymia: Formación en IA aplicada a la ciencia',
    description:
      'Plataforma de cursos online especializados en inteligencia artificial aplicada a ciencia y salud.',
    url: 'https://maxymia.com/',
    image: '/maximia.png',
  },
];

export const InnovacionProjectsSection: React.FC = () => {
  return (
    <section className="py-20 md:py-0 px-6 md:px-12 bg-mx-bg">
      <div className="max-w-7xl mx-auto">
        {/* Small left-aligned header */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 md:mb-16 max-w-lg"
        >
          <span className="text-mx-orange text-sm font-medium tracking-[0.5em] uppercase mb-4 block">
            Nuestros proyectos
          </span>
          <h2 className="text-[#016157] text-3xl md:text-5xl font-black mb-4">
            Soluciones aplicadas
          </h2>
          <p className="text-mx-text-muted text-base font-light">
            Cada proyecto refleja nuestro compromiso con la innovación funcional y el impacto real
            en el sector científico-sanitario.
          </p>
        </m.div>

        {/* Two 50/50 image cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project, idx) => (
            <m.a
              key={project.title}
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
              className="group relative block aspect-video rounded-xl overflow-hidden cursor-pointer"
            >
              {/* Background image with saturate + scale on hover */}
              <Image
                src={project.image}
                alt={project.title}
                className="absolute inset-0 w-full h-full object-cover saturate-[0.4] group-hover:saturate-100 group-hover:scale-110 transition-all duration-700 ease-out"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
              />

              {/* Dark gradient overlay from bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Title + description at bottom-left */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <h3 className="text-white text-xl md:text-2xl font-bold mb-2 group-hover:text-mx-orange transition-colors">
                  {project.title}
                </h3>
                <p className="text-white/70 text-sm font-light leading-relaxed opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 max-w-sm">
                  {project.description}
                </p>
              </div>

              {/* Arrow top-right on hover */}
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ArrowUpRight size={24} className="text-white" />
              </div>
            </m.a>
          ))}
        </div>
      </div>
    </section>
  );
};
