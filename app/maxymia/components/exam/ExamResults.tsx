'use client';

import React from 'react';
import { Trophy, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import type { Locale } from '../../types';

interface ExamResultsProps {
  score: number;
  passingScore: number;
  totalQuestions: number;
  correctCount: number;
  locale: Locale;
  onRetry: () => void;
}

export default function ExamResults({
  score,
  passingScore,
  totalQuestions,
  correctCount,
  locale,
  onRetry,
}: ExamResultsProps) {
  const passed = score >= passingScore;

  return (
    <div className={`rounded-xl border p-8 text-center ${
      passed
        ? 'border-green-500/30 bg-green-500/5'
        : 'border-red-500/30 bg-red-500/5'
    }`}>
      <div className="mb-4">
        {passed ? (
          <Trophy className="mx-auto text-green-400" size={48} />
        ) : (
          <XCircle className="mx-auto text-red-400" size={48} />
        )}
      </div>

      <h3 className="text-white text-2xl font-bold mb-2">
        {passed
          ? (locale === 'es' ? '¡Examen aprobado!' : 'Exam passed!')
          : (locale === 'es' ? 'No superado' : 'Not passed')
        }
      </h3>

      <div className="text-4xl font-black mb-2">
        <span className={passed ? 'text-green-400' : 'text-red-400'}>{score}%</span>
      </div>

      <p className="text-white/50 text-sm mb-6">
        {correctCount}/{totalQuestions}{' '}
        {locale === 'es' ? 'respuestas correctas' : 'correct answers'}
        {' · '}
        {locale === 'es' ? 'Mínimo requerido' : 'Minimum required'}: {passingScore}%
      </p>

      {passed ? (
        <div className="flex items-center justify-center gap-2 text-green-400">
          <CheckCircle size={16} />
          <span className="text-sm">
            {locale === 'es' ? 'Resultado guardado' : 'Result saved'}
          </span>
        </div>
      ) : (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 bg-mx-orange text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-mx-orange-dark transition-colors"
        >
          <RefreshCw size={16} />
          {locale === 'es' ? 'Intentar de nuevo' : 'Try again'}
        </button>
      )}
    </div>
  );
}
