import { AppClerkProvider } from '@/app/components/AppClerkProvider';

// El contenido PRO está gateado por suscripción (Clerk). Provider aquí para no
// cargar Clerk en la home/marketing.
export default function ProContentLayout({ children }: { children: React.ReactNode }) {
  return <AppClerkProvider>{children}</AppClerkProvider>;
}
