'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { renderStyledTitle } from './StyledTitle';
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
}

export const FAQSection: React.FC<FAQSectionProps> = ({
  overline = 'Resolvemos tus dudas',
  title = 'PREGUNTAS {FRECUENTES}',
  faqs = DEFAULT_FAQS,
}) => {
  const displayFaqs = faqs.length > 0 ? faqs : DEFAULT_FAQS;

  return (
    <section className="relative py-32 bg-[#0a0a0a] overflow-hidden">
      <div className="max-w-[900px] mx-auto px-6 md:px-12 relative">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-amber-400 text-sm tracking-[0.3em] uppercase mb-6 text-center"
        >
          {overline}
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-white text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-16 text-center"
        >
          {renderStyledTitle(title)}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Accordion type="single" collapsible className="w-full">
            {displayFaqs.map((faq, index) => (
              <AccordionItem key={index} value={`faq-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};
