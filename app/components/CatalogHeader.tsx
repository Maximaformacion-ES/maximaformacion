'use client';

import React from 'react';
import { m } from 'framer-motion';

export const CatalogHeader: React.FC = () => {
  return (
    <div className="mb-20 max-w-4xl">
      <m.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-5xl md:text-7xl lg:text-9xl font-black  mb-6 text-mx-blue"
      >
        NUESTROS <span className="text-stroke text-mx-orange">PROGRAMAS</span>
      </m.h1>
      <m.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-xl text-mx-text-muted max-w-2xl font-light"
      >
        Explora nuestra oferta académica de excelencia diseñada para impulsar tu carrera al siguiente nivel.
      </m.p>
    </div>
  );
};
