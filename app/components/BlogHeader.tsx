'use client';

import React from 'react';
import { m } from 'framer-motion';

export const BlogHeader: React.FC = () => {
  return (
    <div className="mb-12 md:mb-20 max-w-4xl">
      <m.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-display-sm md:text-display-md lg:text-display-lg font-black mb-6 text-mx-blue"
      >
        NUESTRO <span className="text-stroke text-mx-orange">BLOG</span>
      </m.h1>
      <m.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-body-md md:text-heading-sm text-mx-text-muted max-w-2xl font-light"
      >
        Artículos, guías y casos de éxito sobre estadística, ciencia de datos y análisis empresarial.
      </m.p>
    </div>
  );
};
