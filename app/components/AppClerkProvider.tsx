import { ClerkProvider } from '@clerk/nextjs';
import { esES } from '@clerk/localizations';

/**
 * Envuelve las rutas de app (campus, cursos, perfil, pricing, sign-in/up…) con
 * Clerk. Antes vivía en el layout raíz, lo que forzaba a cargar el JS de Clerk
 * (~250 KB) en TODAS las páginas, incluida la home y el resto de marketing —
 * penalizando el LCP móvil. Ahora Clerk solo se monta donde de verdad se usa.
 * Las páginas de marketing usan <MarketingHeader>, que no toca Clerk.
 */
export function AppClerkProvider({ children }: { children: React.ReactNode }) {
  return <ClerkProvider localization={esES}>{children}</ClerkProvider>;
}
