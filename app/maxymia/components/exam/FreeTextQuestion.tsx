'use client';

import React from 'react';
import type { FreeTextQuestion as FreeTextType, Locale } from '../../types';
import ExamExplanation from './ExamExplanation';

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
      <p className="text-mx-text font-medium mb-4">{question.question[locale]}</p>
      <textarea
        value={answer}
        onChange={(e) => onAnswerChange(e.target.value)}
        disabled={submitted}
        rows={4}
        placeholder={locale === 'es' ? 'Escribe tu respuesta...' : 'Write your answer...'}
        className="w-full px-4 py-3 rounded-lg border border-mx-border bg-mx-card text-body-sm text-mx-text placeholder:text-mx-text-muted/60 focus:outline-none focus:border-mx-orange/60 transition-colors resize-y"
      />
      {submitted && (
        <div className="mt-3 p-4 rounded-lg border border-blue-500/30 bg-blue-500/5">
          <p className="text-blue-700 text-label-md font-medium mb-1">
            {locale === 'es' ? 'Respuesta de referencia:' : 'Sample answer:'}
          </p>
          <p className="text-mx-text-muted text-body-sm">{question.sampleAnswer[locale]}</p>
        </div>
      )}
      <ExamExplanation explanation={question.explanation} locale={locale} submitted={submitted} />
    </div>
  );
}
