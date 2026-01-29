'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ChevronDown, ArrowRight } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const titleY = useSpring(useTransform(scrollYProgress, [0, 0.3], [0, -100]), { stiffness: 100, damping: 30 });
  
  return (
    <section ref={containerRef} className="relative h-[120vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Background */}
        <motion.div 
          style={{ y }}
          className="absolute inset-0 bg-linear-to-b from-[#0a0a0a] via-[#111] to-[#0a0a0a]"
        >
          {/* Ambient glow */}
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-white/3 rounded-full blur-[120px]" />
        </motion.div>
        
        {/* Content */}
        <motion.div 
          style={{ scale, opacity }}
          className="relative h-full flex flex-col items-center justify-center px-6"
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-white/60 text-sm md:text-base tracking-[0.3em] uppercase mb-8"
          >
            Formación Profesional experta
          </motion.p>
          
          <motion.h1 
            style={{ y: titleY }}
            className="text-center"
          >
            <motion.span
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="block text-white text-[12vw] md:text-[10vw] lg:text-[8vw] font-black leading-[0.85] tracking-tighter"
            >
              TRANSFORMA
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="block text-white text-stroke text-[12vw] md:text-[10vw] lg:text-[8vw] font-black leading-[0.85] tracking-tighter"
            >
              TU FUTURO
            </motion.span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="mt-8 md:mt-12 text-white/70 text-base md:text-xl font-light text-center max-w-2xl leading-relaxed"
          >
            Formación especializada que impulsa tu carrera profesional 
            <span className="text-white font-normal"> al siguiente nivel</span>
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 mt-12"
          >
            <motion.a
              href="/programas"
              className="group flex items-center justify-center gap-3 bg-white text-black px-8 py-4 text-base font-medium rounded-full hover:bg-amber-500 hover:text-white transition-colors duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Explorar Másters
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </motion.a>
            <motion.a
              href="/programas"
              className="flex items-center justify-center gap-3 border border-white/30 text-white px-8 py-4 text-base font-light rounded-full hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Ver Cursos
            </motion.a>
          </motion.div>
          
          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <span className="text-white/40 text-xs tracking-widest uppercase">Scroll</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ChevronDown size={20} className="text-white/40" />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
