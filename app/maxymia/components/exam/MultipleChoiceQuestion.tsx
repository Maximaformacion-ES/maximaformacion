'use client';

import React from 'react';
import { CheckCircle, XCircle, Square, CheckSquare } from 'lucide-react';
import type { MultipleChoiceQuestion as MultipleChoiceType, Locale } from '../../types';

interface Props {
  question: MultipleChoiceType;
  locale: Locale;
  selectedIndices: number[];
  onToggle: (index: number) => void;
  submitted: boolean;
}

export default function MultipleChoiceQuestion({
  question,
  locale,
  selectedIndices,
  onToggle,
  submitted,
}: Props) {
  return (
    <div>
      <p className="text-white font-medium mb-1">{question.question[locale]}</p>
      <p className="text-white/40 text-label-md mb-4">
        {locale === 'es' ? 'Selecciona todas las respuestas correctas' : 'Select all correct answers'}
      </p>
      <div className="space-y-2">
        {question.options.map((option, i) => {
          const isSelected = selectedIndices.includes(i);
          const isCorrect = question.correctIndices.includes(i);
          let borderClass = 'border-white/10';
          let bgClass = 'bg-white/[0.03]';

          if (submitted) {
            if (isCorrect && isSelected) {
              borderClass = 'border-green-500/50';
              bgClass = 'bg-green-500/10';
            } else if (isCorrect && !isSelected) {
              borderClass = 'border-green-500/30';
              bgClass = 'bg-green-500/5';
            } else if (!isCorrect && isSelected) {
              borderClass = 'border-red-500/50';
              bgClass = 'bg-red-500/10';
            }
          } else if (isSelected) {
            borderClass = 'border-mx-orange/50';
            bgClass = 'bg-mx-orange/10';
          }

          return (
            <button
              key={i}
              onClick={() => !submitted && onToggle(i)}
              disabled={submitted}
              className={`w-full text-left px-4 py-3 rounded-lg border ${borderClass} ${bgClass} flex items-center gap-3 transition-colors ${
                !submitted ? 'hover:border-mx-orange/30 cursor-pointer' : ''
              }`}
            >
              {isSelected ? (
                <CheckSquare size={18} className="text-mx-orange flex-shrink-0" />
              ) : (
                <Square size={18} className="text-white/20 flex-shrink-0" />
              )}
              <span className="text-white/80 text-body-sm flex-1">{option[locale]}</span>
              {submitted && isCorrect && <CheckCircle size={14} className="text-green-400" />}
              {submitted && isSelected && !isCorrect && <XCircle size={14} className="text-red-400" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
