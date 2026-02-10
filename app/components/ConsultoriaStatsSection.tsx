'use client';

import React from 'react';
import { motion } from 'framer-motion';

const stats = [
  { value: '+10', label: 'Años de experiencia' },
  { value: '+200', label: 'Proyectos completados' },
  { value: '+50', label: 'Clientes satisfechos' },
  { value: '98%', label: 'Tasa de satisfacción' }
];

export const ConsultoriaStatsSection: React.FC = () => {
  return (
    <section className="py-16 md:py-24 px-6 md:px-12 bg-mx-bg">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="text-center"
            >
              <span className="text-5xl md:text-6xl lg:text-7xl font-black text-mx-blue leading-none block">
                {stat.value}
              </span>
              <div className="w-8 h-0.5 bg-mx-orange mx-auto my-4" />
              <span className="text-mx-text-muted text-sm font-medium uppercase tracking-wider">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
