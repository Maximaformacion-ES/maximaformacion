'use client';

import React from 'react';
import { useLocale } from '../i18n/LocaleProvider';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="flex items-center gap-1 bg-white/[0.05] rounded-full p-0.5">
      <button
        onClick={() => setLocale('es')}
        className={`px-3 py-1 rounded-full text-label-md font-medium transition-colors ${
          locale === 'es'
            ? 'bg-mx-orange text-white'
            : 'text-white/50 hover:text-white'
        }`}
      >
        ES
      </button>
      <button
        onClick={() => setLocale('en')}
        className={`px-3 py-1 rounded-full text-label-md font-medium transition-colors ${
          locale === 'en'
            ? 'bg-mx-orange text-white'
            : 'text-white/50 hover:text-white'
        }`}
      >
        EN
      </button>
    </div>
  );
}
