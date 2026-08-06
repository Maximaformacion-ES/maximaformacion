import { AppClerkProvider } from '@/app/components/AppClerkProvider';

// Las fichas/lecciones de curso usan Clerk (compra, acceso, avatar). El provider
// vive aquí y no en el layout raíz para no cargar Clerk en marketing/home.
export default function CursosLayout({ children }: { children: React.ReactNode }) {
  return <AppClerkProvider>{children}</AppClerkProvider>;
}
