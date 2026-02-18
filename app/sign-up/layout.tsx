import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Registro | Máxima Formación',
  description: 'Crea tu cuenta en Máxima Formación. Regístrate y accede a cursos de estadística, ciencia de datos e innovación.',
};

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
