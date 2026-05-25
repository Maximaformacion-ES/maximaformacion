'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';

interface Enrollment {
  programDocumentId: string;
  programId: number | null;
  accessType: string;
  purchasedAt: string | null;
  title: string | null;
}

interface Subscription {
  stripeCustomerId: string | null;
  status: string;
  startedAt: string | null;
  canceledAt: string | null;
  currentPeriodEnd: string | null;
  lastPaymentAt: string | null;
  paymentFailed: boolean;
  trialEnd: string | null;
}

interface CourseProgressData {
  completedLessons: string[];
  currentLessonId: string | null;
  lastAccessedAt: string | null;
  startedAt: string | null;
}

interface CampusProfile {
  plan: string;
  hasUsedTrial: boolean;
  subscription: Subscription | null;
  enrollments: Enrollment[];
  courseProgress: Record<string, CourseProgressData>;
}

interface UseUserCampusReturn {
  plan: string;
  hasPro: boolean;
  isTrialing: boolean;
  hasUsedTrial: boolean;
  subscription: Subscription | null;
  enrollments: Enrollment[];
  courseProgress: Record<string, CourseProgressData>;
  hasAccess: (programDocumentId: string, isPro?: boolean | null) => boolean;
  isEnrolled: (programDocumentId: string) => boolean;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

export function useUserCampus(): UseUserCampusReturn {
  const { isSignedIn, isLoaded } = useUser();
  const [profile, setProfile] = useState<CampusProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!isSignedIn) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/user/profile');
      if (!res.ok) throw new Error('Failed to fetch profile');
      const data: CampusProfile = await res.json();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching campus profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn]);

  useEffect(() => {
    if (isLoaded) {
      fetchProfile();
    }
  }, [isLoaded, fetchProfile]);

  const plan = profile?.plan || 'free';
  const hasPro = plan === 'pro';
  const isTrialing = profile?.subscription?.status === 'trialing';
  const hasUsedTrial = profile?.hasUsedTrial ?? false;

  const hasAccess = useCallback(
    (programDocumentId: string, isPro?: boolean | null) => {
      // Pro plan only grants automatic access to courses explicitly marked
      // `isPro: true` in Strapi. Non-Pro courses still require a real
      // enrollment (i.e. a completed Stripe checkout) so the Moodle
      // provisioning runs and credentials get emailed.
      if (hasPro && isPro === true) return true;
      return (
        profile?.enrollments.some(
          (e) => e.programDocumentId === programDocumentId
        ) ?? false
      );
    },
    [hasPro, profile?.enrollments]
  );

  const isEnrolled = useCallback(
    (programDocumentId: string) => {
      return (
        profile?.enrollments.some(
          (e) => e.programDocumentId === programDocumentId
        ) ?? false
      );
    },
    [profile?.enrollments]
  );

  return {
    plan,
    hasPro,
    isTrialing,
    hasUsedTrial,
    subscription: profile?.subscription ?? null,
    enrollments: profile?.enrollments ?? [],
    courseProgress: profile?.courseProgress ?? {},
    hasAccess,
    isEnrolled,
    isLoading: !isLoaded || isLoading,
    refetch: fetchProfile,
  };
}
