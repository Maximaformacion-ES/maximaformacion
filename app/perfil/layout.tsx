import type { Metadata } from 'next';
import { AppClerkProvider } from '@/app/components/AppClerkProvider';

export const metadata: Metadata = {
  title: 'Mi Perfil | Máxima Formación',
  description: 'Gestiona tu perfil, suscripción, cursos y certificados en Máxima Formación.',
};

export default function PerfilLayout({ children }: { children: React.ReactNode }) {
  return <AppClerkProvider>{children}</AppClerkProvider>;
}
