'use client';

import React from 'react';
import { GripVertical, CheckCircle, XCircle, ArrowUp, ArrowDown } from 'lucide-react';
import type { OrderingQuestion as OrderingType, Locale } from '../../types';

interface Props {
  question: OrderingType;
  locale: Locale;
  order: number[];
  onReorder: (newOrder: number[]) => void;
  submitted: boolean;
}

export default function OrderingQuestion({
  question,
  locale,
  order,
  onReorder,
  submitted,
}: Props) {
  const moveItem = (fromIndex: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= order.length) return;
    const newOrder = [...order];
    [newOrder[fromIndex], newOrder[toIndex]] = [newOrder[toIndex], newOrder[fromIndex]];
    onReorder(newOrder);
  };

  return (
    <div>
      <p className="text-white font-medium mb-1">{question.question[locale]}</p>
      <p className="text-white/40 text-label-md mb-4">
        {locale === 'es' ? 'Ordena los elementos usando las flechas' : 'Order the items using the arrows'}
      </p>
      <div className="space-y-2">
        {order.map((itemIndex, positionIndex) => {
          const isCorrectPosition = submitted && question.correctOrder[positionIndex] === itemIndex;
          let borderClass = 'border-white/10';
          let bgClass = 'bg-white/[0.03]';

          if (submitted) {
            borderClass = isCorrectPosition ? 'border-green-500/50' : 'border-red-500/50';
            bgClass = isCorrectPosition ? 'bg-green-500/10' : 'bg-red-500/10';
          }

          return (
            <div
              key={itemIndex}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${borderClass} ${bgClass} transition-colors`}
            >
              <GripVertical size={16} className="text-white/20 flex-shrink-0" />
              <span className="text-white/40 text-label-md w-5">{positionIndex + 1}.</span>
              <span className="text-white/80 text-body-sm flex-1">{question.items[itemIndex][locale]}</span>
              {!submitted && (
                <div className="flex gap-1">
                  <button
                    onClick={() => moveItem(positionIndex, 'up')}
                    disabled={positionIndex === 0}
                    className="p-1 text-white/30 hover:text-mx-orange disabled:opacity-20 transition-colors"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    onClick={() => moveItem(positionIndex, 'down')}
                    disabled={positionIndex === order.length - 1}
                    className="p-1 text-white/30 hover:text-mx-orange disabled:opacity-20 transition-colors"
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>
              )}
              {submitted && isCorrectPosition && <CheckCircle size={14} className="text-green-400" />}
              {submitted && !isCorrectPosition && <XCircle size={14} className="text-red-400" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
