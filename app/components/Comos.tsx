'use client';

import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

type Como = { question: string; answer: string };

/**
 * "Cómos" de la ficha (MF-41): acordeón. Cada "¿Cómo…?" es la cabecera (título)
 * que al clicar despliega su respuesta. Título OSCURO cuando está colapsado y
 * NARANJA cuando está expandido. Se pueden abrir varios a la vez. Estilo de la
 * web (tema claro). Sustituye al contenido de la pestaña de Descripción.
 * Compartido por Maxymia y /programas.
 */
export function Comos({
  comos,
  className = '',
}: {
  comos: Como[];
  className?: string;
}) {
  const [open, setOpen] = useState<Set<number>>(new Set());

  if (!comos?.length) return null;

  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <div className={`divide-y divide-mx-border border-y border-mx-border ${className}`}>
      {comos.map((c, i) => {
        const isOpen = open.has(i);
        return (
          <m.div
            key={`${c.question}-${i}`}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
          >
            <button
              type="button"
              onClick={() => toggle(i)}
              aria-expanded={isOpen}
              className="group w-full flex items-center justify-between gap-4 text-left py-5 md:py-6"
            >
              <h3
                className={`text-heading-sm md:text-body-lg font-bold leading-tight transition-colors ${
                  isOpen ? 'text-mx-orange' : 'text-mx-text group-hover:text-mx-orange'
                }`}
              >
                {c.question}
              </h3>
              <m.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="shrink-0"
                aria-hidden
              >
                <ChevronDown size={22} className={isOpen ? 'text-mx-orange' : 'text-mx-text-muted'} />
              </m.span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <m.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="text-mx-text-muted text-body-sm md:text-body-md font-light leading-relaxed whitespace-pre-line pb-5 md:pb-6">
                    {c.answer}
                  </p>
                </m.div>
              )}
            </AnimatePresence>
          </m.div>
        );
      })}
    </div>
  );
}
