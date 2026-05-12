'use client';

import React from 'react';
import { Info } from 'lucide-react';
import type { LocalizedString, Locale } from '../../types';

interface Props {
  explanation: LocalizedString | null | undefined;
  locale: Locale;
  submitted: boolean;
}

export default function ExamExplanation({ explanation, locale, submitted }: Props) {
  if (!submitted || !explanation) return null;
  const text = explanation[locale] || explanation.es || explanation.en;
  if (!text) return null;
  return (
    <div className="mt-4 px-4 py-3 rounded-lg bg-mx-orange/5 border border-mx-orange/20 flex gap-3">
      <Info size={16} className="text-mx-orange shrink-0 mt-0.5" />
      <div className="text-white/70 text-body-sm leading-relaxed whitespace-pre-line">
        {text}
      </div>
    </div>
  );
}
