'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export const CTASection: React.FC = () => {
  return (
    <section className="relative py-32 md:py-48 bg-[#0a0a0a] overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/10 rounded-full blur-[200px]" />
      </div>
      
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 relative text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-amber-400 text-sm tracking-[0.3em] uppercase mb-6"
        >
          ¿Listo para empezar?
        </motion.p>
        
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-white text-4xl md:text-6xl lg:text-8xl font-black tracking-tight mb-8"
        >
          TU PRÓXIMO<br />
          <span className="text-stroke">CAPÍTULO</span><br />
          EMPIEZA HOY
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-white/60 text-lg md:text-xl font-light max-w-2xl mx-auto mb-12"
        >
          Habla con nuestro equipo de asesores académicos y encuentra 
          el programa perfecto para tus objetivos profesionales.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.a
            href="/contacto"
            className="group flex items-center justify-center gap-3 bg-white text-black px-10 py-5 text-lg font-medium rounded-full"
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
            Agendar Llamada
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};
