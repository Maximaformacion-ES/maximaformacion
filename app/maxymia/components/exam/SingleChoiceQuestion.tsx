'use client';

import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import type { SingleChoiceQuestion as SingleChoiceType, Locale } from '../../types';

interface Props {
  question: SingleChoiceType;
  locale: Locale;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  submitted: boolean;
}

export default function SingleChoiceQuestion({
  question,
  locale,
  selectedIndex,
  onSelect,
  submitted,
}: Props) {
  return (
    <div>
      <p className="text-white font-medium mb-4">{question.question[locale]}</p>
      <div className="space-y-2">
        {question.options.map((option, i) => {
          const isSelected = selectedIndex === i;
          const isCorrect = i === question.correctIndex;
          let borderClass = 'border-white/10';
          let bgClass = 'bg-white/[0.03]';

          if (submitted) {
            if (isCorrect) {
              borderClass = 'border-green-500/50';
              bgClass = 'bg-green-500/10';
            } else if (isSelected && !isCorrect) {
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
              onClick={() => !submitted && onSelect(i)}
              disabled={submitted}
              className={`w-full text-left px-4 py-3 rounded-lg border ${borderClass} ${bgClass} flex items-center gap-3 transition-colors ${
                !submitted ? 'hover:border-mx-orange/30 cursor-pointer' : ''
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                isSelected ? 'border-mx-orange' : 'border-white/20'
              }`}>
                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-mx-orange" />}
              </div>
              <span className="text-white/80 text-body-sm flex-1">{option[locale]}</span>
              {submitted && isCorrect && <CheckCircle size={16} className="text-green-400" />}
              {submitted && isSelected && !isCorrect && <XCircle size={16} className="text-red-400" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
