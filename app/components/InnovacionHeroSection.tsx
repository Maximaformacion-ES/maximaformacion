'use client';

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export const InnovacionHeroSection: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const yRange = useTransform(scrollYProgress, [0, 1], [0, -200]);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <motion.div style={{ y: yRange }} className="absolute inset-0 z-0 h-[120%]">
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-transparent to-black z-10" />
        <img 
          src="https://pquxfbbxflqvtidtlrhl.supabase.co/storage/v1/object/public/hmac-uploads/brand/60f35268-7b36-455b-80c5-8c7f90d8f957/assets/57a73b70-9604-4bf5-b1c0-a6e640e94921.jpg" 
          className="w-full h-full object-cover object-center"
          alt="Biomáxima Innovación"
        />
      </motion.div>
      
      <div className="relative z-20 text-center px-6 max-w-5xl mx-auto">
        <motion.span 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block text-amber-500 text-sm font-medium tracking-[0.5em] uppercase mb-6"
        >
          BIOMÁXIMA INNOVACIÓN
        </motion.span>
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 leading-[0.9]"
        >
          Convertimos tecnología en calidad de vida
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-white/80 text-lg md:text-xl font-light mb-10 max-w-2xl mx-auto"
        >
          Soluciones tecnológicas avanzadas en ciencia, salud y medicina
        </motion.p>
        <motion.a
          href="#sobre-nosotros"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="group inline-flex items-center justify-center gap-3 bg-white text-black px-8 py-4 text-base font-medium rounded-full hover:bg-amber-500 hover:text-white transition-colors duration-300"
        >
          Descubre más
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </motion.a>
      </div>
    </section>
  );
};
