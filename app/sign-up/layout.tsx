import type { Metadata } from 'next';
import { AppClerkProvider } from '@/app/components/AppClerkProvider';

export const metadata: Metadata = {
  title: 'Registro | Máxima Formación',
  description: 'Crea tu cuenta en Máxima Formación. Regístrate y accede a cursos de estadística, ciencia de datos e innovación.',
};

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return <AppClerkProvider>{children}</AppClerkProvider>;
}
