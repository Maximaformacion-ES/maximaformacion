'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { MaxymiaCourse } from '../types';

const STORAGE_KEY = 'maxymia-notifications-seen';
const NEW_COURSE_WINDOW_DAYS = 15;

export function useNewCourseNotifications(courses: MaxymiaCourse[]) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastSeenMs, setLastSeenMs] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setLastSeenMs(stored ? new Date(stored).getTime() : 0);
    setIsLoaded(true);
  }, []);

  // Courses published in the last 15 days — always visible in the dropdown
  const recentCourses = useMemo(() => {
    if (!isLoaded) return [];
    const cutoff = Date.now() - NEW_COURSE_WINDOW_DAYS * 24 * 60 * 60 * 1000;
    return courses
      .filter((c) => c.createdAt && new Date(c.createdAt).getTime() > cutoff)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }, [courses, isLoaded]);

  // Red dot: only if there are recent courses newer than lastSeen
  const hasUnseen = useMemo(() => {
    if (!isLoaded) return false;
    return recentCourses.some((c) => new Date(c.createdAt!).getTime() > lastSeenMs);
  }, [recentCourses, isLoaded, lastSeenMs]);

  const markAsSeen = useCallback(() => {
    const now = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, now);
    setLastSeenMs(Date.now());
  }, []);

  return { newCourses: recentCourses, hasUnseen, markAsSeen, isLoaded };
}
