import Link from "next/link";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

/** Marca del campus en la cabecera del sidebar: logo negro de Maxymia
 *  expandido; isotipo al colapsar a icono. */
export function CampusBrand() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" asChild className="h-14 hover:bg-transparent flex items-center justify-center">
          <Link href="/maxymia/campus" className="justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo_maxymia_negro_sin_fondo.png"
              alt="Maxymia"
              className="h-8 w-auto group-data-[collapsible=icon]:hidden"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/iconBlue.svg"
              alt="Maxymia"
              className="hidden h-6 w-auto group-data-[collapsible=icon]:block"
            />
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
