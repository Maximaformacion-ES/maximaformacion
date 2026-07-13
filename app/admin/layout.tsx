import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { isAdmin } from '@/lib/admin-auth';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/sonner';
import AppSidebar from './AppSidebar';

export const metadata = {
  title: 'Admin · Máxima Formación',
  robots: { index: false, follow: false },
};

// El panel opera datos sensibles: gate server-side. A los no-admin les damos 404
// (no revelamos que el panel existe) en vez de 403.
export default async function AdminLayout({ children }: { children: ReactNode }) {
  if (!(await isAdmin())) notFound();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <span className="text-sm font-medium">Panel de administración</span>
        </header>
        <div className="p-4 md:p-6">{children}</div>
      </SidebarInset>
      <Toaster richColors position="top-right" />
    </SidebarProvider>
  );
}
