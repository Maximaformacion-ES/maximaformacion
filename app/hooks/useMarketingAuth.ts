'use client';

import { useState, useEffect } from 'react';

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
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [hasPro, setHasPro] = useState(false);

  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)__client_uat=([^;]+)/);
    const signed = !!match && match[1] !== '0';
    setIsSignedIn(signed);
    if (!signed) return;
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
  }, []);

  return { isSignedIn, hasPro };
}
