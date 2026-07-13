import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 px-6 py-3 flex items-center gap-6">
        <Link href="/admin" className="font-semibold tracking-tight">
          Máxima · Admin
        </Link>
        <nav className="flex gap-4 text-sm text-zinc-400">
          <Link href="/admin/alumnos" className="hover:text-white transition-colors">
            Alumnos
          </Link>
        </nav>
      </header>
      <main className="p-6 max-w-6xl mx-auto">{children}</main>
    </div>
  );
}
