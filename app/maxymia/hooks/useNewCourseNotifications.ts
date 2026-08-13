'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { useMounted } from '@/app/hooks/useMounted';
import type { MaxymiaCourse } from '../types';

const STORAGE_KEY = 'maxymia-notifications-seen';
const NEW_COURSE_WINDOW_DAYS = 15;

// "lastSeen" respaldado por localStorage y expuesto con useSyncExternalStore: así
// markAsSeen puede actualizar a los suscriptores sin un efecto con setState. El
// snapshot se cachea (debe ser referencialmente estable entre renders).
const seenListeners = new Set<() => void>();
let cachedLastSeen: number | null = null;

function readLastSeen(): number {
  if (cachedLastSeen === null) {
    const stored = localStorage.getItem(STORAGE_KEY);
    cachedLastSeen = stored ? new Date(stored).getTime() : 0;
  }
  return cachedLastSeen;
}

function subscribeSeen(callback: () => void): () => void {
  seenListeners.add(callback);
  return () => seenListeners.delete(callback);
}

function markSeenNow() {
  const iso = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, iso);
  cachedLastSeen = new Date(iso).getTime();
  seenListeners.forEach((fn) => fn());
}

// "Ahora" capturado una única vez en cliente (cacheado a nivel de módulo), para
// no llamar a Date.now() inline durante el render (función impura).
let cachedNow = 0;
function getNow(): number {
  if (cachedNow === 0) cachedNow = Date.now();
  return cachedNow;
}
const noopSubscribe = () => () => {};

export function useNewCourseNotifications(courses: MaxymiaCourse[]) {
  // false en SSR/hidratación, true tras montar → equivale al viejo `isLoaded`.
  const isLoaded = useMounted();
  // 0 en SSR; valores reales de localStorage/reloj en el primer render de cliente.
  const lastSeenMs = useSyncExternalStore(subscribeSeen, readLastSeen, () => 0);
  const nowMs = useSyncExternalStore(noopSubscribe, getNow, () => 0);

  // Courses published in the last 15 days — always visible in the dropdown
  const recentCourses = useMemo(() => {
    if (!isLoaded) return [];
    const cutoff = nowMs - NEW_COURSE_WINDOW_DAYS * 24 * 60 * 60 * 1000;
    return courses
      .filter((c) => c.createdAt && new Date(c.createdAt).getTime() > cutoff)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }, [courses, isLoaded, nowMs]);

  // Red dot: only if there are recent courses newer than lastSeen
  const hasUnseen = useMemo(() => {
    if (!isLoaded) return false;
    return recentCourses.some((c) => new Date(c.createdAt!).getTime() > lastSeenMs);
  }, [recentCourses, isLoaded, lastSeenMs]);

  const markAsSeen = useCallback(() => {
    markSeenNow();
  }, []);

  return { newCourses: recentCourses, hasUnseen, markAsSeen, isLoaded };
}
