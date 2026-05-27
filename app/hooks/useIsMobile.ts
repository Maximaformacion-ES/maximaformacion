'use client';

import { useEffect, useState } from 'react';

/**
 * Tracks whether the viewport is narrower than the Tailwind `md` breakpoint
 * (768px). Mirrors Tailwind's `max-md:` so anything driven by this hook in JS
 * lines up with rules written in CSS.
 *
 * SSR returns `false` (desktop assumption); the real value is set after
 * mount. Components using this for animation gating just won't animate a
 * frame or two on first mount in mobile — acceptable for entry effects.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return isMobile;
}
