'use client';

import React, { createContext, useContext, useCallback, useSyncExternalStore } from 'react';
import type { Locale } from '../types';
import { getTranslation } from './translations';

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: 'es',
  setLocale: () => {},
  t: (key) => key,
});

const STORAGE_KEY = 'maxymia-locale';

// Store del locale respaldado por localStorage, expuesto vía useSyncExternalStore.
// Sustituye al patrón useState + useEffect(setLocaleState) que leía localStorage
// en un efecto con setState síncrono. El snapshot se cachea en `current` (debe
// ser referencialmente estable entre renders) y `setLocale` notifica a los
// suscriptores, así que el cambio se propaga sin efectos.
const localeListeners = new Set<() => void>();
let current: Locale | null = null;

function getSnapshot(): Locale {
  if (current === null) {
    const stored = localStorage.getItem(STORAGE_KEY);
    current = stored === 'es' || stored === 'en' ? stored : 'es';
  }
  return current;
}

function getServerSnapshot(): Locale {
  return 'es';
}

function subscribeLocale(callback: () => void): () => void {
  localeListeners.add(callback);
  return () => localeListeners.delete(callback);
}

function writeLocale(next: Locale) {
  current = next;
  localStorage.setItem(STORAGE_KEY, next);
  localeListeners.forEach((fn) => fn());
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(subscribeLocale, getSnapshot, getServerSnapshot);

  const setLocale = useCallback((newLocale: Locale) => {
    writeLocale(newLocale);
  }, []);

  const t = useCallback((key: string) => getTranslation(locale, key), [locale]);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
