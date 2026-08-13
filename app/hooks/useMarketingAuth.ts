'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';

// `__client_uat` (cookie no httpOnly de Clerk): "0"/ausente = fuera de sesión.
// La cookie no emite eventos, así que la suscripción es un noop: leemos el
// snapshot en cada render. Devolver un booleano (primitivo) mantiene estable la
// comparación de useSyncExternalStore.
const noopSubscribe = () => () => {};
function readSignedInFromCookie(): boolean {
  const match = document.cookie.match(/(?:^|;\s*)__client_uat=([^;]+)/);
  return !!match && match[1] !== '0';
}

/**
 * Estado de sesión/Pro para páginas de MARKETING, SIN cargar Clerk.
 *
 * - `isSignedIn`: de la cookie `__client_uat` de Clerk (no httpOnly): "0" = fuera.
 * - `hasPro`: si hay sesión, se consulta `/api/user/profile` (lo mismo que
 *   useUserCampus, vía auth() de servidor) para saber el plan. Post-hidratación
 *   y solo para logueados → no afecta al LCP del visitante anónimo (que ni tiene
 *   cookie ni hace fetch).
 *
 * Se usa en <MarketingHeader> (botón "Hazte Pro"/megamenú) y en la home
 * (CoursesSection → precios Pro de las tarjetas), para igualar el comportamiento
 * de las rutas de app sin reintroducir Clerk en marketing.
 */
export function useMarketingAuth(): { isSignedIn: boolean; hasPro: boolean } {
  // `isSignedIn` se deriva de la cookie con useSyncExternalStore (SSR=false),
  // sin setState síncrono en efecto. El fetch de `hasPro` sigue en un efecto
  // porque es asíncrono (el setState va dentro del .then, no lo marca la regla).
  const isSignedIn = useSyncExternalStore(noopSubscribe, readSignedInFromCookie, () => false);
  const [hasPro, setHasPro] = useState(false);

  useEffect(() => {
    if (!isSignedIn) return; // sin sesión → hasPro se queda en false.
    let cancelled = false;
    fetch('/api/user/profile')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data?.plan === 'pro') setHasPro(true);
      })
      .catch(() => {
        /* si falla, hasPro=false (mostramos precios de lista / "Hazte Pro") */
      });
    return () => {
      cancelled = true;
    };
  }, [isSignedIn]);

  return { isSignedIn, hasPro };
}
