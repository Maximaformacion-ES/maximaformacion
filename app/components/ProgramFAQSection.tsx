'use client';

import React from 'react';
import { FAQSection } from './FAQSection';
import type { Program } from '@/lib/strapi/types';

interface ProgramFAQSectionProps {
  program: Program;
}

export const ProgramFAQSection: React.FC<ProgramFAQSectionProps> = ({ program }) => {
  if (!program.faqs || program.faqs.length === 0) return null;

  return (
    <FAQSection
      compact
      overline="Resuelve tus dudas"
      title="PREGUNTAS {FRECUENTES}"
      faqs={program.faqs}
    />
  );
};
