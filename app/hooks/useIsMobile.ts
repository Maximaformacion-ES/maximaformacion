'use client';

import { useSyncExternalStore } from 'react';

const QUERY = '(max-width: 767px)';

function subscribe(callback: () => void): () => void {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener('change', callback);
  return () => mq.removeEventListener('change', callback);
}

const getSnapshot = () => window.matchMedia(QUERY).matches;
const getServerSnapshot = () => false; // SSR: asumimos desktop.

/**
 * Tracks whether the viewport is narrower than the Tailwind `md` breakpoint
 * (768px). Mirrors Tailwind's `max-md:` so anything driven by this hook in JS
 * lines up with rules written in CSS.
 *
 * SSR returns `false` (desktop assumption); el valor real llega en el primer
 * render de cliente. Se apoya en `useSyncExternalStore` (patrón idiomático para
 * suscribirse a un media query) en vez de `useState`+`useEffect`+`setState`,
 * evitando el setState síncrono en efecto y una cascada de renders.
 */
export function useIsMobile(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
