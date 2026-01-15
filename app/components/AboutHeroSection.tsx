'use client';

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export const AboutHeroSection: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const yRange = useTransform(scrollYProgress, [0, 1], [0, -200]);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <motion.div style={{ y: yRange }} className="absolute inset-0 z-0 h-[120%]">
        <div className="absolute inset-0 bg-linear-to-b from-black/90 via-transparent to-black z-10" />
        <img 
          src="https://pquxfbbxflqvtidtlrhl.supabase.co/storage/v1/object/public/hmac-uploads/brand/60f35268-7b36-455b-80c5-8c7f90d8f957/assets/57a73b70-9604-4bf5-b1c0-a6e640e94921.jpg" 
          className="w-full h-full object-cover object-[center_15%]"
          alt="Máxima Formación"
        />
      </motion.div>
      
      <div className="relative z-20 text-center px-6 mt-[-10vh]">
        <motion.span 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block text-amber-500 text-sm font-medium tracking-[0.5em] uppercase mb-6"
        >
          MÁXIMA FORMACIÓN
        </motion.span>
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter"
        >
          CONÓCENOS
        </motion.h1>
      </div>
    </section>
  );
};
