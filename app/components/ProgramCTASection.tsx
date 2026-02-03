'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail } from 'lucide-react';
import type { Program } from '@/lib/strapi/types';

interface ProgramCTASectionProps {
  program: Program;
}

export const ProgramCTASection: React.FC<ProgramCTASectionProps> = ({ program }) => {
  return (
    <section className="py-24 md:py-32 px-6 md:px-12 bg-[#111]">
      <div className="max-w-[1200px] mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-8">
            ¿LISTO PARA <span className="text-stroke">COMENZAR?</span>
          </h2>
          <p className="text-xl text-neutral-400 font-light mb-12 max-w-2xl mx-auto">
            Únete a cientos de profesionales que ya están transformando su carrera con este programa.
          </p>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-8 text-neutral-400"
        >
          <a href="mailto:cursos@maximaformacion.es" className="flex items-center gap-3 hover:text-white transition-colors">
            <Mail size={18} />
            cursos@maximaformacion.es
          </a>
          <a href="tel:+34635659391" className="flex items-center gap-3 hover:text-white transition-colors">
            <Phone size={18} />
            +34 635 65 93 91
          </a>
        </motion.div>
      </div>
    </section>
  );
};
