import Link from "next/link";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

/**
 * Marca del panel en la cabecera del sidebar. Expandido muestra el logo de Máxima
 * Formación; colapsado a icono, un isotipo compacto ("M").
 */
export function Brand() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" asChild className="hover:bg-transparent">
          <Link href="/admin">
            <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-mx-orange text-sm font-bold text-white">
              M
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-maxima.png"
              alt="Máxima Formación"
              className="h-5 w-auto group-data-[collapsible=icon]:hidden"
            />
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
