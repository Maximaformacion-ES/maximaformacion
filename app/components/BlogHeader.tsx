'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const BlogHeader: React.FC = () => {
  return (
    <div className="mb-20 max-w-4xl">
      <motion.h1 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter mb-6"
      >
        NUESTRO <span className="text-stroke text-white">BLOG</span>
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-xl text-neutral-400 max-w-2xl font-light"
      >
        Artículos, guías y casos de éxito sobre estadística, ciencia de datos y análisis empresarial.
      </motion.p>
    </div>
  );
};
