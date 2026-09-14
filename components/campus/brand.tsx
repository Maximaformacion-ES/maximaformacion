import Link from "next/link";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

/** Marca del campus en la cabecera del sidebar: logo negro de Maxymia
 *  expandido; el favicon del sitio al colapsar a icono (como en /admin). */
export function CampusBrand() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {/* Misma altura (h-14) pero casi sin padding vertical, para que el
            logo ocupe el bloque: 44 px de alto en 56 px de contenedor. */}
        <SidebarMenuButton size="lg" asChild className="h-14 py-1 hover:bg-transparent flex items-center justify-center">
          <Link href="/maxymia/campus" className="justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo_maxymia_negro_sin_fondo.png"
              alt="Maxymia"
              className="h-11 w-auto max-w-full object-contain group-data-[collapsible=icon]:hidden"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/favicon.ico"
              alt="Maxymia"
              className="hidden h-6 w-6 group-data-[collapsible=icon]:block"
            />
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
