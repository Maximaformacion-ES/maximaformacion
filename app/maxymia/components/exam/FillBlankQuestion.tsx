'use client';

import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import type { FillBlankQuestion as FillBlankType, Locale } from '../../types';
import ExamExplanation from './ExamExplanation';

interface Props {
  question: FillBlankType;
  locale: Locale;
  answers: string[];
  onAnswerChange: (blankIndex: number, value: string) => void;
  submitted: boolean;
}

export default function FillBlankQuestion({
  question,
  locale,
  answers,
  onAnswerChange,
  submitted,
}: Props) {
  return (
    <div>
      <p className="text-white font-medium mb-4">{question.question[locale]}</p>
      <div className="space-y-3">
        {question.blanks.map((blank, i) => {
          const answer = (answers[i] ?? '').trim().toLowerCase();
          const isCorrect = blank.acceptedAnswers.some(
            (a) => a.toLowerCase() === answer
          );

          return (
            <div key={i} className="flex items-center gap-3">
              <input
                type="text"
                value={answers[i] ?? ''}
                onChange={(e) => onAnswerChange(i, e.target.value)}
                disabled={submitted}
                placeholder={locale === 'es' ? 'Tu respuesta...' : 'Your answer...'}
                className={`flex-1 px-4 py-3 rounded-lg border text-body-sm text-white bg-white/[0.03] placeholder:text-white/20 focus:outline-none transition-colors ${
                  submitted
                    ? isCorrect
                      ? 'border-green-500/50 bg-green-500/10'
                      : 'border-red-500/50 bg-red-500/10'
                    : 'border-white/10 focus:border-mx-orange/50'
                }`}
              />
              {submitted && (
                isCorrect
                  ? <CheckCircle size={18} className="text-green-400 flex-shrink-0" />
                  : (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <XCircle size={18} className="text-red-400" />
                      <span className="text-green-400 text-label-md">
                        {blank.acceptedAnswers[0]}
                      </span>
                    </div>
                  )
              )}
            </div>
          );
        })}
      </div>
      <ExamExplanation explanation={question.explanation} locale={locale} submitted={submitted} />
    </div>
  );
}
