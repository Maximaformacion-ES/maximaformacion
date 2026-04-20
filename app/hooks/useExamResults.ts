'use client';

import { useEffect, useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';

export interface ExamResult {
  id: string;
  clerkId: string;
  courseId: string;
  blockId: string;
  examId: string;
  score: number;
  passed: boolean;
  answers: unknown;
  completedAt: string;
}

interface UseExamResultsReturn {
  results: ExamResult[];
  byExamId: Record<string, ExamResult>;
  byBlockId: Record<string, ExamResult>;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

export function useExamResults(courseId?: string): UseExamResultsReturn {
  const { isSignedIn, isLoaded } = useUser();
  const [results, setResults] = useState<ExamResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    if (!isSignedIn) {
      setResults([]);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const url = courseId
        ? `/api/maxymia/exam?courseId=${encodeURIComponent(courseId)}`
        : '/api/maxymia/exam';
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = (await res.json()) as ExamResult[];
      setResults(data);
    } catch (err) {
      console.error('Failed to fetch exam results:', err);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, courseId]);

  useEffect(() => {
    if (!isLoaded) return;
    fetch_();
  }, [isLoaded, fetch_]);

  const byExamId: Record<string, ExamResult> = {};
  const byBlockId: Record<string, ExamResult> = {};
  for (const r of results) {
    byExamId[r.examId] = r;
    byBlockId[r.blockId] = r;
  }

  return { results, byExamId, byBlockId, isLoading, refetch: fetch_ };
}
