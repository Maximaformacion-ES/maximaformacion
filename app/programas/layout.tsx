import { AppClerkProvider } from '@/app/components/AppClerkProvider';

// El catálogo/fichas de programas usa Clerk (estado de sesión, gating Pro, CTAs
// de compra). Provider aquí para no cargar Clerk en la home/marketing.
export default function ProgramasLayout({ children }: { children: React.ReactNode }) {
  return <AppClerkProvider>{children}</AppClerkProvider>;
}
