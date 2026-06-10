'use client';

import React, { useSyncExternalStore } from 'react';
import { ChevronDownIcon } from 'lucide-react';
import { m } from 'framer-motion';
import { StyledTitle } from './StyledTitle';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

interface FAQItem {
  question: string;
  answer: string;
}

const DEFAULT_FAQS: FAQItem[] = [
  {
    question: '¿Qué metodología de enseñanza utilizáis?',
    answer:
      'Combinamos teoría con práctica real a través de proyectos, casos de estudio y mentorías con profesionales en activo. Nuestro enfoque es 100% aplicable al entorno laboral actual.',
  },
  {
    question: '¿Los programas son online o presenciales?',
    answer:
      'Ofrecemos modalidad online con clases en directo y acceso a grabaciones. Esto te permite estudiar a tu ritmo desde cualquier lugar, sin renunciar a la interacción con profesores y compañeros.',
  },
  {
    question: '¿Qué titulación obtendré al finalizar?',
    answer:
      'Al completar el programa recibirás un título propio de Máxima Formación, avalado por nuestros partners académicos y reconocido por empresas del sector.',
  },
  {
    question: '¿Ofrecéis bolsa de empleo o prácticas?',
    answer:
      'Sí, contamos con una bolsa de empleo activa y acuerdos con empresas colaboradoras. Además, ofrecemos orientación profesional personalizada y sesiones de preparación para entrevistas.',
  },
  {
    question: '¿Puedo financiar mi formación?',
    answer:
      'Disponemos de opciones de financiación flexible y planes de pago fraccionado. Contacta con nuestro equipo de asesores para encontrar la opción que mejor se adapte a ti.',
  },
  {
    question: '¿Necesito conocimientos previos para inscribirme?',
    answer:
      'Depende del programa. Algunos están diseñados para principiantes mientras que otros requieren una base previa. En la ficha de cada programa encontrarás los requisitos específicos.',
  },
];

interface FAQSectionProps {
  overline?: string;
  title?: string;
  faqs?: FAQItem[];
  /** Título más pequeño para usarlo dentro de una ficha (columna), en vez del
   *  tamaño display grande de la home. */
  compact?: boolean;
}

// Stable no-op subscribe for useSyncExternalStore (the FAQ "mounted" flag
// never changes after hydration, so there's nothing to subscribe to).
const emptySubscribe = () => () => {};

export const FAQSection: React.FC<FAQSectionProps> = ({
  overline = 'Resolvemos tus dudas',
  title = 'PREGUNTAS {FRECUENTES}',
  faqs = DEFAULT_FAQS,
  compact = false,
}) => {
  const displayFaqs = faqs.length > 0 ? faqs : DEFAULT_FAQS;

  // Radix's Accordion derives aria ids from React.useId(); upstream client
  // components (Clerk, Framer Motion LazyMotion) can shift that counter
  // between SSR and the first client paint, surfacing as a hydration
  // mismatch on the generated ids. Render a native <details> fallback for
  // SSR + first paint (same closed look, crawlable) and swap to the
  // interactive Radix Accordion only after mount. useSyncExternalStore gives
  // a hydration-safe "are we on the client yet?" flag (false on the server,
  // true after hydration) without a setState-in-effect.
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  return (
    <section className="relative py-16 md:py-32 bg-mx-bg overflow-hidden bg-transparent">
      <div className="max-w-[900px] mx-auto px-6 md:px-12 relative">
        <m.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-mx-orange text-label-sm md:text-label-md xl:text-label-lg leading-label tracking-[0.3em] uppercase mb-6 text-center"
        >
          {overline}
        </m.p>

        <m.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`text-mx-blue font-black text-center ${
            compact
              ? 'text-heading-md md:text-heading-lg tracking-tight leading-tight mb-10'
              : 'text-display-sm md:text-display-md tracking-display leading-display mb-16'
          }`}
        >
          <StyledTitle text={title} color="blue" />
        </m.h2>

        <m.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {mounted ? (
            <Accordion type="single" collapsible className="w-full">
              {displayFaqs.map((faq, index) => (
                <AccordionItem key={faq.question} value={`faq-${index}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            // SSR / pre-hydration fallback: native <details>, no useId.
            <div className="w-full">
              {displayFaqs.map((faq) => (
                <details
                  key={faq.question}
                  className="border-b border-mx-border last:border-b-0"
                >
                  <summary className="flex items-center justify-between gap-4 py-5 cursor-pointer list-none text-left text-body-sm md:text-body-md 2xl:text-body-lg font-medium text-mx-text">
                    {faq.question}
                    <ChevronDownIcon className="text-mx-orange pointer-events-none size-5 shrink-0" />
                  </summary>
                  <div className="pt-0 pb-5 text-mx-text-muted text-body-sm md:text-body-md 2xl:text-body-lg font-light leading-relaxed">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          )}
        </m.div>
      </div>
    </section>
  );
};
