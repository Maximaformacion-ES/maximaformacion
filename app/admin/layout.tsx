import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { isAdmin } from '@/lib/admin-auth';
import AdminNav from './AdminNav';

export const metadata = {
  title: 'Admin · Máxima Formación',
  robots: { index: false, follow: false },
};

// El panel opera datos sensibles: gate server-side. A los no-admin les damos 404
// (no revelamos que el panel existe) en vez de 403.
export default async function AdminLayout({ children }: { children: ReactNode }) {
  if (!(await isAdmin())) notFound();

  return (
    <div className="min-h-screen flex bg-mx-bg text-mx-text">
      {/* Sidebar izquierda */}
      <aside className="w-60 shrink-0 border-r border-mx-border bg-white flex flex-col sticky top-0 h-screen">
        <div className="px-4 py-4 border-b border-mx-border">
          <Link href="/admin" className="block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-maxima.png" alt="Máxima Formación" className="h-9 w-auto" />
          </Link>
        </div>

        <AdminNav />

        <div className="p-3 border-t border-mx-border">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-mx-text-muted hover:bg-black/[0.04] hover:text-mx-blue transition-colors"
          >
            <ArrowLeft size={15} />
            Maximaformación
          </Link>
        </div>
      </aside>

      {/* Contenido derecha */}
      <div className="flex-1 min-w-0">
        <main className="max-w-5xl mx-auto px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
