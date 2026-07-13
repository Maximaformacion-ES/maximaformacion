import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { isAdmin } from '@/lib/admin-auth';

export const metadata = {
  title: 'Admin · Máxima Formación',
  robots: { index: false, follow: false },
};

// El panel opera datos sensibles: gate server-side. A los no-admin les damos 404
// (no revelamos que el panel existe) en vez de 403.
export default async function AdminLayout({ children }: { children: ReactNode }) {
  if (!(await isAdmin())) notFound();

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <header className="border-b border-zinc-200 bg-white/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-maxima.png" alt="Máxima Formación" className="h-7 w-auto" />
              <span className="text-sm font-semibold text-zinc-400 border-l border-zinc-200 pl-2.5">
                Admin
              </span>
            </Link>
            <nav className="flex gap-4 text-sm text-zinc-500">
              <Link href="/admin/alumnos" className="hover:text-zinc-900 transition-colors">
                Alumnos
              </Link>
            </nav>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft size={15} />
            Volver a maximaformación
          </Link>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
