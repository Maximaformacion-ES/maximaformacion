"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { CampusNavUser } from "./nav-user";
import { CampusBrand } from "./brand";
import { CampusNavMain } from "./nav-main";
import type { Locale } from "@/app/maxymia/types";

/** Sidebar del campus (kit shadcn, misma estructura que el del panel /admin). */
export function CampusSidebar({
  locale,
  ...props
}: React.ComponentProps<typeof Sidebar> & { locale: Locale }) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <CampusBrand />
      </SidebarHeader>
      <SidebarContent>
        <CampusNavMain locale={locale} />
      </SidebarContent>
      <SidebarFooter>
        <CampusNavUser locale={locale} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
