'use client';

import React from 'react';
import type { FreeTextQuestion as FreeTextType, Locale } from '../../types';

interface Props {
  question: FreeTextType;
  locale: Locale;
  answer: string;
  onAnswerChange: (value: string) => void;
  submitted: boolean;
}

export default function FreeTextQuestion({
  question,
  locale,
  answer,
  onAnswerChange,
  submitted,
}: Props) {
  return (
    <div>
      <p className="text-white font-medium mb-4">{question.question[locale]}</p>
      <textarea
        value={answer}
        onChange={(e) => onAnswerChange(e.target.value)}
        disabled={submitted}
        rows={4}
        placeholder={locale === 'es' ? 'Escribe tu respuesta...' : 'Write your answer...'}
        className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/[0.03] text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-mx-orange/50 transition-colors resize-y"
      />
      {submitted && (
        <div className="mt-3 p-4 rounded-lg border border-blue-500/30 bg-blue-500/5">
          <p className="text-blue-300 text-xs font-medium mb-1">
            {locale === 'es' ? 'Respuesta de referencia:' : 'Sample answer:'}
          </p>
          <p className="text-white/60 text-sm">{question.sampleAnswer[locale]}</p>
        </div>
      )}
    </div>
  );
}
