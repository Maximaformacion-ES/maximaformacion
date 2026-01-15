'use client';

import React from 'react';
import { motion } from 'framer-motion';

const clients = [
  { name: 'CSIC', logo: 'https://via.placeholder.com/150x80/ffffff/000000?text=CSIC' },
  { name: 'Mapfre', logo: 'https://via.placeholder.com/150x80/ffffff/000000?text=MAPFRE' },
  { name: 'Asebio', logo: 'https://via.placeholder.com/150x80/ffffff/000000?text=ASEBIO' },
  { name: 'Abbott', logo: 'https://via.placeholder.com/150x80/ffffff/000000?text=ABBOTT' },
  { name: 'RTVE', logo: 'https://via.placeholder.com/150x80/ffffff/000000?text=RTVE' },
  { name: 'Tuenti', logo: 'https://via.placeholder.com/150x80/ffffff/000000?text=TUENTI' }
];

export const ClientsSection: React.FC = () => {
  return (
    <section className="py-32 px-6 md:px-12 bg-neutral-950 border-y border-white/10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-amber-500 text-sm font-medium tracking-[0.5em] uppercase mb-4 block">
            Confían en nosotros
          </span>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">
            Empresas e instituciones líderes
          </h2>
          <p className="text-white/60 text-lg font-light max-w-2xl mx-auto">
            Más de 10 años de experiencia liderando proyectos en empresas, entidades públicas y centros de investigación
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
          {clients.map((client, idx) => (
            <motion.div
              key={client.name}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center justify-center p-6 border border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10 transition-all duration-300 grayscale hover:grayscale-0"
            >
              <div className="text-white/60 hover:text-white text-xl font-bold transition-colors">
                {client.name}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="inline-block p-8 border border-white/10 bg-black/40">
            <h3 className="text-2xl font-bold mb-4">Máximo rigor científico</h3>
            <p className="text-white/60 font-light max-w-2xl">
              Máxima Consultoría está integrada por un equipo multidisciplinar de expertos en Ciencia de Datos con más de 10 años de experiencia liderando proyectos en empresas, entidades públicas y centros de investigación.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
