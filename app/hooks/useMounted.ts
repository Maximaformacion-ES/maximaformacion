'use client';

import { useSyncExternalStore } from 'react';

// Suscripción vacía: el valor nunca cambia tras el primer render de cliente.
const emptySubscribe = () => () => {};

/**
 * Devuelve `false` durante el render de servidor y la hidratación, y `true` a
 * partir del primer render de cliente. Sustituye al patrón
 * `const [mounted, setMounted] = useState(false); useEffect(() => setMounted(true), [])`,
 * que dispara `setState` síncrono dentro de un efecto (regla
 * react-hooks/set-state-in-effect). `useSyncExternalStore` con snapshots
 * distintos para servidor (false) y cliente (true) consigue lo mismo sin efecto
 * ni cascada de renders, y es seguro para hidratación.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
