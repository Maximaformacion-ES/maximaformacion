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
const VISIBLE = 5;

export function Comos({
  comos,
  className = '',
}: {
  comos: Como[];
  className?: string;
}) {
  // Acordeón estricto: solo uno abierto a la vez (abrir uno cierra el resto).
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);

  if (!comos?.length) return null;

  const toggle = (i: number) =>
    setOpenIndex((prev) => (prev === i ? null : i));

  const hasMore = comos.length > VISIBLE;
  const shown = expanded ? comos : comos.slice(0, VISIBLE);
  const peek = !expanded && hasMore ? comos[VISIBLE] : null;

  return (
    <div className={className}>
      <div className="divide-y divide-mx-border border-mx-border">
      {shown.map((c, i) => {
        const isOpen = openIndex === i;
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
                className={`text-heading-sm md:text-body-lg font-medium text- leading-tight transition-colors ${
                  isOpen ? 'text-mx-orange' : 'text-mx-text/40 group-hover:text-mx-orange'
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
                  <p className="font-body text-mx-text-muted text-body-sm md:text-body-md font-light leading-relaxed whitespace-pre-line pb-5 md:pb-6">
                    {c.answer}
                  </p>
                </m.div>
              )}
            </AnimatePresence>
          </m.div>
        );
      })}

      {/* Peek: deja entrever el siguiente Cómo, difuminado */}
      {peek && (
        <div className="relative max-h-12 overflow-hidden pt-5 pointer-events-none select-none">
          <h3 className="text-heading-sm md:text-body-lg font-medium leading-tight text-mx-text/40">
            {peek.question}
          </h3>
          <div className="absolute inset-0 bg-gradient-to-t from-mx-bg to-transparent" />
        </div>
      )}
      </div>

      {hasMore && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="font-sans font-medium text-mx-orange text-[15px] hover:underline cursor-pointer"
          >
            {expanded ? 'Ver menos' : 'Ver más'}
          </button>
        </div>
      )}
    </div>
  );
}
