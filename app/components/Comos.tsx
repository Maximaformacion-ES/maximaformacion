'use client';

import React from 'react';
import { m } from 'framer-motion';

type Como = { question: string; answer: string };

/**
 * "Cómos" de la ficha (MF-41): pregunta-problema ("¿Cómo…?") como TÍTULO y la
 * respuesta como texto normal. Sustituye al contenido de la pestaña de
 * Descripción para que sea más llamativo. Estilo de la web (tema claro, acento
 * naranja). Compartido por Maxymia y /programas.
 */
export function Comos({
  comos,
  className = '',
}: {
  comos: Como[];
  className?: string;
}) {
  if (!comos?.length) return null;
  return (
    <div className={`space-y-8 md:space-y-10 ${className}`}>
      {comos.map((c, i) => (
        <m.div
          key={`${c.question}-${i}`}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4, delay: i * 0.05 }}
        >
          <h3 className="flex items-start gap-3 text-mx-text text-heading-sm md:text-heading-md font-black tracking-tight leading-tight mb-3">
            <span className="text-mx-orange shrink-0" aria-hidden>→</span>
            <span>{c.question}</span>
          </h3>
          <p className="text-mx-text-muted text-body-sm md:text-body-md font-light leading-relaxed whitespace-pre-line md:pl-9">
            {c.answer}
          </p>
        </m.div>
      ))}
    </div>
  );
}
