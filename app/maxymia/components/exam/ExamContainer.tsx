'use client';

import React, { useReducer, useCallback, useEffect, useRef } from 'react';
import { FileQuestion, Send } from 'lucide-react';
import type { MaxymiaExam, ExamQuestion, Locale, LocalizedString } from '../../types';
import SingleChoiceQuestion from './SingleChoiceQuestion';
import MultipleChoiceQuestion from './MultipleChoiceQuestion';
import OrderingQuestion from './OrderingQuestion';
import FillBlankQuestion from './FillBlankQuestion';
import FreeTextQuestion from './FreeTextQuestion';
import ExamResults from './ExamResults';

// ─── State ───────────────────────────────────────────────────────────

interface ExamState {
  answers: Record<string, unknown>;
  submitted: boolean;
  score: number;
  correctCount: number;
}

type ExamAction =
  | { type: 'SET_ANSWER'; questionId: string; value: unknown }
  | { type: 'SUBMIT'; score: number; correctCount: number }
  | { type: 'RESET' };

// Component IDs in Strapi are per-table auto-increments, so a SingleChoice
// id=4 and a MultipleChoice id=4 collide in answer state. Namespace by type.
function questionKey(q: ExamQuestion): string {
  return `${q.type}:${q.id}`;
}

function examReducer(state: ExamState, action: ExamAction): ExamState {
  switch (action.type) {
    case 'SET_ANSWER':
      return { ...state, answers: { ...state.answers, [action.questionId]: action.value } };
    case 'SUBMIT':
      return { ...state, submitted: true, score: action.score, correctCount: action.correctCount };
    case 'RESET':
      return { answers: {}, submitted: false, score: 0, correctCount: 0 };
    default:
      return state;
  }
}

// ─── Grading ─────────────────────────────────────────────────────────

function gradeQuestion(question: ExamQuestion, answer: unknown): boolean {
  switch (question.type) {
    case 'single_choice':
      return answer === question.correctIndex;

    case 'multiple_choice': {
      const selected = (answer as number[]) ?? [];
      if (selected.length !== question.correctIndices.length) return false;
      return question.correctIndices.every((i) => selected.includes(i));
    }

    case 'ordering': {
      const order = (answer as number[]) ?? [];
      return question.correctOrder.every((val, i) => val === order[i]);
    }

    case 'fill_blank': {
      const answers = (answer as string[]) ?? [];
      return question.blanks.every((blank, i) => {
        const a = (answers[i] ?? '').trim().toLowerCase();
        return blank.acceptedAnswers.some((acc) => acc.toLowerCase() === a);
      });
    }

    case 'free_text':
      // Free text is always "correct" — it's for self-assessment
      return !!answer && (answer as string).trim().length > 0;

    default:
      return false;
  }
}

// ─── Component ───────────────────────────────────────────────────────

interface ExamContainerProps {
  exam: MaxymiaExam;
  courseId: string;
  blockId: string;
  locale: Locale;
  onPass?: () => void;
  nextLesson?: { lessonTitle: LocalizedString; blockTitle: LocalizedString; href: string } | null;
  scrollContainerId?: string;
}

export default function ExamContainer({
  exam,
  courseId,
  blockId,
  locale,
  onPass,
  nextLesson,
  scrollContainerId,
}: ExamContainerProps) {
  const [state, dispatch] = useReducer(examReducer, {
    answers: {},
    submitted: false,
    score: 0,
    correctCount: 0,
  });
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!state.submitted) return;
    const container = scrollContainerId ? document.getElementById(scrollContainerId) : null;
    if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
    else rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [state.submitted, scrollContainerId]);

  const setAnswer = useCallback((questionId: string, value: unknown) => {
    dispatch({ type: 'SET_ANSWER', questionId, value });
  }, []);

  const handleSubmit = useCallback(async () => {
    let correct = 0;
    for (const q of exam.questions) {
      if (gradeQuestion(q, state.answers[questionKey(q)])) correct++;
    }
    const score = Math.round((correct / exam.questions.length) * 100);
    dispatch({ type: 'SUBMIT', score, correctCount: correct });

    // Save result to API
    try {
      await fetch('/api/maxymia/exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          blockId,
          examId: exam.id,
          score,
          passed: score >= exam.passingScore,
          answers: state.answers,
        }),
      });
    } catch {
      // Silently fail — result is shown locally
    }

    if (score >= exam.passingScore) {
      onPass?.();
    }
  }, [exam, state.answers, courseId, blockId, onPass]);

  const handleRetry = () => dispatch({ type: 'RESET' });

  // Count answered questions (for submit button enablement)
  const answeredCount = exam.questions.filter((q) => {
    const answer = state.answers[questionKey(q)];
    if (answer === undefined || answer === null) return false;
    if (Array.isArray(answer)) return answer.length > 0;
    if (typeof answer === 'string') return answer.trim().length > 0;
    return true;
  }).length;

  return (
    <div ref={rootRef}>
      {/* Exam header */}
      <div className="flex items-center gap-3 mb-8">
        <FileQuestion className="text-purple-400" size={24} />
        <div>
          <h3 className="text-white text-body-lg font-semibold">{exam.title[locale]}</h3>
          {exam.description && (
            <p className="text-white/40 text-body-sm">{exam.description[locale]}</p>
          )}
        </div>
      </div>

      {/* Results (shown when submitted) */}
      {state.submitted && (
        <div className="mb-10">
          <ExamResults
            score={state.score}
            passingScore={exam.passingScore}
            totalQuestions={exam.questions.length}
            correctCount={state.correctCount}
            locale={locale}
            onRetry={handleRetry}
            nextLesson={nextLesson}
          />
        </div>
      )}

      {/* Questions */}
      <div className="space-y-8">
        {exam.questions.map((q, i) => {
          const key = questionKey(q);
          return (
            <div key={key} className="p-5 rounded-xl border border-white/10 bg-white/[0.02]">
              <span className="text-white/30 text-label-md mb-3 block">
                {locale === 'es' ? 'Pregunta' : 'Question'} {i + 1}/{exam.questions.length}
              </span>
              <QuestionRenderer
                question={q}
                locale={locale}
                answer={state.answers[key]}
                onAnswer={(val) => setAnswer(key, val)}
                submitted={state.submitted}
              />
            </div>
          );
        })}
      </div>

      {/* Submit button */}
      {!state.submitted && (
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={answeredCount < exam.questions.length}
            className="flex items-center gap-2 bg-mx-orange text-white px-6 py-3 rounded-lg font-medium hover:bg-mx-orange/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={16} />
            {locale === 'es' ? 'Enviar examen' : 'Submit exam'}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Question Router ─────────────────────────────────────────────────

function QuestionRenderer({
  question,
  locale,
  answer,
  onAnswer,
  submitted,
}: {
  question: ExamQuestion;
  locale: Locale;
  answer: unknown;
  onAnswer: (val: unknown) => void;
  submitted: boolean;
}) {
  switch (question.type) {
    case 'single_choice':
      return (
        <SingleChoiceQuestion
          question={question}
          locale={locale}
          selectedIndex={(answer as number) ?? null}
          onSelect={(i) => onAnswer(i)}
          submitted={submitted}
        />
      );

    case 'multiple_choice':
      return (
        <MultipleChoiceQuestion
          question={question}
          locale={locale}
          selectedIndices={(answer as number[]) ?? []}
          onToggle={(i) => {
            const current = (answer as number[]) ?? [];
            const next = current.includes(i)
              ? current.filter((x) => x !== i)
              : [...current, i];
            onAnswer(next);
          }}
          submitted={submitted}
        />
      );

    case 'ordering':
      return (
        <OrderingQuestion
          question={question}
          locale={locale}
          order={(answer as number[]) ?? question.items.map((_, i) => i)}
          onReorder={(newOrder) => onAnswer(newOrder)}
          submitted={submitted}
        />
      );

    case 'fill_blank':
      return (
        <FillBlankQuestion
          question={question}
          locale={locale}
          answers={(answer as string[]) ?? []}
          onAnswerChange={(blankIndex, value) => {
            const current = (answer as string[]) ?? [];
            const next = [...current];
            next[blankIndex] = value;
            onAnswer(next);
          }}
          submitted={submitted}
        />
      );

    case 'free_text':
      return (
        <FreeTextQuestion
          question={question}
          locale={locale}
          answer={(answer as string) ?? ''}
          onAnswerChange={(val) => onAnswer(val)}
          submitted={submitted}
        />
      );

    default:
      return null;
  }
}
