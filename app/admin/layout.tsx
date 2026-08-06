import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { AppSidebar } from "@/components/admin/app-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { AppClerkProvider } from "@/app/components/AppClerkProvider";

export const metadata = {
  title: "Admin · Máxima Formación",
  robots: { index: false, follow: false },
};

// El panel opera datos sensibles: gate server-side. A los no-admin les damos 404
// (no revelamos que el panel existe) en vez de 403.
export default async function AdminLayout({ children }: { children: ReactNode }) {
  if (!(await isAdmin())) notFound();

  // Persistencia del estado colapsado del sidebar por cookie (como el Admin Kit).
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

  return (
    <AppClerkProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <SidebarInset>
          <AdminHeader />
          <div className="p-4 md:p-6">{children}</div>
        </SidebarInset>
        <Toaster richColors position="top-right" />
      </SidebarProvider>
    </AppClerkProvider>
  );
}
