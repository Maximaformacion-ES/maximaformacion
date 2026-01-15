'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Phone, Mail } from 'lucide-react';
import { Program } from '../data/programs';

interface ProgramCTASectionProps {
  program: Program;
}

export const ProgramCTASection: React.FC<ProgramCTASectionProps> = ({ program }) => {
  return (
    <section className="py-32 md:py-48 px-6 md:px-12 bg-[#111]">
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

        {/* Pricing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mb-12"
        >
          <div className="inline-flex items-baseline gap-4">
            {program.originalPrice && (
              <span className="text-neutral-500 text-2xl line-through">
                {program.originalPrice}€
              </span>
            )}
            <span className="text-amber-500 text-5xl md:text-6xl font-black">
              {program.price}€
            </span>
          </div>
          {program.originalPrice && (
            <div className="mt-2 text-amber-500 text-sm font-bold">
              Ahorra {program.originalPrice - program.price}€
            </div>
          )}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <motion.a
            href="/contacto"
            className="group flex items-center justify-center gap-3 bg-white text-black px-10 py-5 text-lg font-medium rounded-full hover:bg-amber-500 hover:text-white transition-colors duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            Solicitar Información
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </motion.a>
          <motion.a
            href="tel:+34635659391"
            className="flex items-center justify-center gap-3 border border-white/30 text-white px-10 py-5 text-lg font-light rounded-full hover:bg-white/10 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Phone size={20} />
            Llamar Ahora
          </motion.a>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-16 pt-16 border-t border-white/10 flex flex-col sm:flex-row items-center justify-center gap-8 text-neutral-400"
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
