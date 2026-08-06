import { AppClerkProvider } from '@/app/components/AppClerkProvider';

// Maxymia (landing + campus + fichas + lecciones) usa Clerk en toda su
// superficie. El provider vive aquí (cubre también /maxymia/campus/*) para no
// cargar Clerk en la home ni en el resto de marketing.
export default function MaxymiaLayout({ children }: { children: React.ReactNode }) {
  return <AppClerkProvider>{children}</AppClerkProvider>;
}
