import type { Metadata } from 'next';
import { AppClerkProvider } from '@/app/components/AppClerkProvider';

export const metadata: Metadata = {
  title: 'Planes y Precios | Máxima Formación',
  description: 'Descubre los planes y precios de Máxima Formación. Elige entre el plan gratuito o Pro para acceder a todos los cursos y recursos premium.',
  // Self-referential canonical: /pricing doesn't override the root layout's
  // site-wide canonical otherwise, so it inherited the (possibly empty)
  // Strapi value instead of pointing to itself.
  alternates: { canonical: '/pricing' },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <AppClerkProvider>{children}</AppClerkProvider>;
}
