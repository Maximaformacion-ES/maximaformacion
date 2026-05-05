import type { MoodleInstance } from './client';

/**
 * Public-facing Moodle URLs — safe to import in client components.
 * Kept separate from `client.ts` (which uses server-only env vars / API tokens).
 */
export const MOODLE_PUBLIC_URLS: Record<MoodleInstance, string> = {
  'data-science': 'https://www.maximacampus.es',
  'e-learning': 'https://maximaformacion.com.es',
};

export const MOODLE_INSTANCE_LABELS: Record<MoodleInstance, string> = {
  'data-science': 'Máxima Campus · Data Science',
  'e-learning': 'Máxima Formación · E-Learning',
};

/** Deep-link to a specific course in Moodle. */
export function getMoodleCourseUrl(
  instance: MoodleInstance,
  moodleCourseId: number,
): string {
  return `${MOODLE_PUBLIC_URLS[instance]}/course/view.php?id=${moodleCourseId}`;
}

/** Password-recovery flow on the corresponding Moodle instance. */
export function getMoodleForgotPasswordUrl(instance: MoodleInstance): string {
  return `${MOODLE_PUBLIC_URLS[instance]}/login/forgot_password.php`;
}
