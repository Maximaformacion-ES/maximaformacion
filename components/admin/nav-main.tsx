"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Mail, type LucideIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  exact?: boolean;
}

const items: NavItem[] = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard, exact: true },
  { title: "Alumnos", url: "/admin/alumnos", icon: Users },
  { title: "Emails", url: "/admin/emails", icon: Mail },
];

export function NavMain() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Gestión</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const active = item.exact
            ? pathname === item.url
            : pathname === item.url || pathname.startsWith(`${item.url}/`);
          return (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton
                asChild
                isActive={active}
                tooltip={item.title}
                className="data-[active=true]:bg-mx-orange/10 data-[active=true]:text-mx-orange-dark data-[active=true]:font-medium"
              >
                <Link href={item.url} onClick={() => setOpenMobile(false)}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
