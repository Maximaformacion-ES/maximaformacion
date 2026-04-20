'use client';

import React from 'react';
import Link from 'next/link';
import { Trophy, RefreshCw, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import type { Locale, LocalizedString } from '../../types';

interface ExamResultsProps {
  score: number;
  passingScore: number;
  totalQuestions: number;
  correctCount: number;
  locale: Locale;
  onRetry: () => void;
  nextLesson?: { lessonTitle: LocalizedString; blockTitle: LocalizedString; href: string } | null;
}

export default function ExamResults({
  score,
  passingScore,
  totalQuestions,
  correctCount,
  locale,
  onRetry,
  nextLesson,
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

      <h3 className="text-white text-heading-md font-bold mb-2">
        {passed
          ? (locale === 'es' ? '¡Examen aprobado!' : 'Exam passed!')
          : (locale === 'es' ? 'No superado' : 'Not passed')
        }
      </h3>

      <div className="text-display-sm font-black mb-2">
        <span className={passed ? 'text-green-400' : 'text-red-400'}>{score}%</span>
      </div>

      <p className="text-white/50 text-body-sm mb-6">
        {correctCount}/{totalQuestions}{' '}
        {locale === 'es' ? 'respuestas correctas' : 'correct answers'}
        {' · '}
        {locale === 'es' ? 'Mínimo requerido' : 'Minimum required'}: {passingScore}%
      </p>

      {passed ? (
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle size={16} />
            <span className="text-body-sm">
              {locale === 'es' ? 'Resultado guardado' : 'Result saved'}
            </span>
          </div>
          {nextLesson && (
            <Link
              href={nextLesson.href}
              className="inline-flex items-center gap-2 bg-mx-orange text-black px-5 py-2.5 rounded-lg text-body-sm font-medium hover:bg-mx-orange/90 transition-colors"
            >
              {locale === 'es' ? 'Siguiente lección' : 'Next lesson'}
              <span className="text-black/70 truncate max-w-[220px] hidden sm:inline">
                · {nextLesson.lessonTitle[locale]}
              </span>
              <ArrowRight size={16} />
            </Link>
          )}
        </div>
      ) : (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 bg-mx-orange text-white px-5 py-2.5 rounded-lg text-body-sm font-medium hover:bg-mx-orange/90 transition-colors"
        >
          <RefreshCw size={16} />
          {locale === 'es' ? 'Intentar de nuevo' : 'Try again'}
        </button>
      )}
    </div>
  );
}
