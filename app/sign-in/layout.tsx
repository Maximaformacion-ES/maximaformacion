import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Iniciar Sesión | Máxima Formación',
  description: 'Inicia sesión en tu cuenta de Máxima Formación. Accede a tus cursos, certificados y recursos formativos.',
};

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return children;
}
