'use client';

import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

type Como = { question: string; answer: string };

const VISIBLE = 5;

/**
 * "Cómos" de la ficha (MF-41): acordeón. Cada "¿Cómo…?" es la cabecera que al
 * clicar despliega su respuesta. Se muestran los primeros {VISIBLE}; si hay más,
 * el siguiente se entrevé difuminado y un "Ver más" centrado despliega el resto
 * con animación de altura (igual que la bio del docente). Tema claro.
 * Compartido por Maxymia y /programas.
 */
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

  const toggle = (i: number) => setOpenIndex((prev) => (prev === i ? null : i));
  const hasMore = comos.length > VISIBLE;

  const renderItem = (c: Como, i: number) => {
    const isOpen = openIndex === i;
    return (
      <div key={`${c.question}-${i}`} className={i > 0 ? 'border-t border-mx-border' : ''}>
        <button
          type="button"
          onClick={() => toggle(i)}
          aria-expanded={isOpen}
          className="group w-full flex items-center justify-between gap-4 text-left py-5 md:py-6"
        >
          <h3
            className={`text-heading-sm md:text-body-lg font-medium leading-tight transition-colors ${
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
      </div>
    );
  };

  return (
    <div className={className}>
      {comos.slice(0, VISIBLE).map((c, i) => renderItem(c, i))}

      {/* Resto: despliegue/plegado animado por altura */}
      <AnimatePresence initial={false}>
        {expanded && hasMore && (
          <m.div
            key="comos-extra"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            {comos.slice(VISIBLE).map((c, j) => renderItem(c, VISIBLE + j))}
          </m.div>
        )}
      </AnimatePresence>

      {/* Peek: deja entrever el siguiente Cómo cuando está plegado */}
      {!expanded && hasMore && (
        <div className="relative max-h-12 overflow-hidden pt-5 border-t border-mx-border pointer-events-none select-none">
          <h3 className="text-heading-sm md:text-body-lg font-medium leading-tight text-mx-text/40">
            {comos[VISIBLE].question}
          </h3>
          <div className="absolute inset-0 bg-gradient-to-t from-mx-bg to-transparent" />
        </div>
      )}

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
