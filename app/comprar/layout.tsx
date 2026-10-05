import type { Metadata } from 'next';
import { AppClerkProvider } from '@/app/components/AppClerkProvider';

// Página de compra directa (/comprar/[slug] y /comprar/maxymia/[slug]). Es un
// paso transaccional, no una página de marketing: no se indexa.
export const metadata: Metadata = {
  title: 'Completar compra | Máxima Formación',
  robots: { index: false, follow: false },
};

export default function ComprarLayout({ children }: { children: React.ReactNode }) {
  return <AppClerkProvider>{children}</AppClerkProvider>;
}
