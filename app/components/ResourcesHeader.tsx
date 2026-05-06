'use client';

import React from 'react';
import { m } from 'framer-motion';

export const ResourcesHeader: React.FC = () => {
  return (
    <div className="mb-12 md:mb-20 max-w-4xl">
      <m.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-display-sm md:text-display-md font-black my-6 text-mx-blue leading-display uppercase text-balance"
      >
        NUESTROS <span className="text-stroke text-mx-orange">RECURSOS</span>
      </m.h1>
      <m.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-body-sm md:text-body-md xl:text-body-lg text-mx-text-muted max-w-2xl font-light"
      >
        Guías rápidas, infografías, trabajos de investigación (TFM) y videotutoriales para acompañarte
        en tu aprendizaje de estadística, R, ciencia de datos y formación online.
      </m.p>
    </div>
  );
};
