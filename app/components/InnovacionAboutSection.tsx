'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FlaskConical, Microscope, Network } from 'lucide-react';

export const InnovacionAboutSection: React.FC = () => {
  const differentiators = [
    {
      icon: FlaskConical,
      title: 'Asesoramiento especializado en técnicas experimentales',
      description: 'Orientación experta a centros públicos y empresas privadas sobre las técnicas experimentales más adecuadas para cada tipo de investigación. Optimizamos procesos de investigación garantizando resultados de alta calidad.'
    },
    {
      icon: Microscope,
      title: 'Infraestructura y soporte instrumental de vanguardia',
      description: 'Recursos e infraestructura necesarios para el desarrollo de investigaciones de calidad en el ámbito biosanitario y biotecnológico. Acceso a equipos y tecnologías avanzadas que facilitan la ejecución eficiente de proyectos científicos.'
    },
    {
      icon: Network,
      title: 'Gestión y coordinación de metodologías de investigación',
      description: 'Gestionamos y coordinamos la metodología requerida para los planes de investigación, desde la fase in vitro. Enfoque integral que asegura una implementación efectiva de los proyectos, optimizando recursos y tiempos.'
    }
  ];

  return (
    <section id="sobre-nosotros" className="py-32 px-6 md:px-12 bg-mx-bg">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="text-mx-orange text-sm font-medium tracking-[0.5em] uppercase mb-4 block">
            Sobre Biomáxima
          </span>
          <h2 className="text-mx-blue text-4xl md:text-6xl font-black tracking-tighter mb-6">
            Biomáxima Innovación®
          </h2>
          <p className="text-mx-text-muted text-lg md:text-xl font-light max-w-3xl mx-auto leading-relaxed">
            Empresa altamente especializada en el desarrollo de soluciones tecnológicas avanzadas, 
            enfocándose principalmente en los campos de la ciencia, la salud y la medicina.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mb-16 max-w-4xl mx-auto text-center"
        >
          <h3 className="text-2xl font-bold text-mx-text mb-4">Nos define la innovación</h3>
          <p className="text-mx-text-muted font-light leading-relaxed text-lg">
            Nuestro compromiso es innovar y crear herramientas que no solo optimicen procesos, 
            sino que también mejoren la calidad de vida de las personas. A través de un equipo 
            multidisciplinario de expertos en tecnología, biomedicina y análisis de datos, 
            trabajamos para diseñar aplicaciones y sistemas que aborden desafíos complejos en estos sectores.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {differentiators.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-8 border border-mx-border bg-mx-card rounded-lg hover:border-mx-orange/50 transition-all duration-300"
            >
              <item.icon className="text-mx-orange mb-6" size={32} />
              <h3 className="text-xl font-bold text-mx-text mb-4">{item.title}</h3>
              <p className="text-mx-text-muted font-light leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center p-10 border border-mx-border bg-mx-card rounded-lg"
        >
          <h3 className="text-2xl font-bold text-mx-text mb-4">Nuestra visión de futuro</h3>
          <p className="text-mx-text-muted font-light leading-relaxed">
            Biomáxima se proyecta como un <strong className="text-mx-text">referente nacional e internacional
            en asesoría y soluciones biotecnológicas y biosanitarias</strong>. Su visión consiste en
            <strong className="text-mx-text"> impulsar la innovación científica y tecnológica</strong> para 
            mejorar la eficiencia, precisión y aplicabilidad de la investigación en salud y biotecnología.
          </p>
        </motion.div>
      </div>
    </section>
  );
};
