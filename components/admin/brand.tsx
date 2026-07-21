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
        <SidebarMenuButton size="lg" asChild className="h-14 hover:bg-transparent flex items-center justify-center">
          <Link href="/admin" className="justify-center">
            {/* Expandido: logo completo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-maxima.png"
              alt="Máxima Formación"
              className="h-9 w-auto group-data-[collapsible=icon]:hidden"
            />
            {/* Colapsado a icono: favicon */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/favicon.ico"
              alt="Máxima Formación"
              className="hidden h-6 w-6 group-data-[collapsible=icon]:block"
            />
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
