"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  Award,
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import type { Locale } from "@/app/maxymia/types";

interface NavItem {
  es: string;
  en: string;
  url: string;
  icon: LucideIcon;
  exact?: boolean;
}

const MAIN: NavItem[] = [
  { es: "Inicio", en: "Home", url: "/maxymia/campus", icon: LayoutDashboard, exact: true },
  { es: "Cursos", en: "Courses", url: "/maxymia/campus/cursos", icon: BookOpen },
  { es: "Mis cursos", en: "My courses", url: "/maxymia/campus/mis-cursos", icon: GraduationCap },
  { es: "Notas", en: "Grades", url: "/maxymia/campus/notas", icon: Award },
];

// Mismos estados que el sidebar del panel /admin (kit shadcn), con el acento
// naranja de Maxymia para el activo.
const BUTTON_CLASS =
  "hover:bg-mx-orange/10 hover:text-mx-orange-dark data-[active=true]:bg-mx-orange/10 data-[active=true]:text-mx-orange-dark data-[active=true]:hover:bg-mx-orange/10 data-[active=true]:font-medium";

export function CampusNavMain({ locale, onAskTutor }: { locale: Locale; onAskTutor: () => void }) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>{locale === "es" ? "Menú" : "Menu"}</SidebarGroupLabel>
        <SidebarMenu>
          {MAIN.map((item) => {
            const active = item.exact
              ? pathname === item.url
              : pathname === item.url || pathname.startsWith(`${item.url}/`);
            const label = item[locale];
            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton asChild isActive={active} tooltip={label} className={BUTTON_CLASS}>
                  <Link href={item.url} onClick={() => setOpenMobile(false)}>
                    <item.icon />
                    <span>{label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>{locale === "es" ? "Ayuda" : "Help"}</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={locale === "es" ? "Escribir al tutor" : "Write to the tutor"}
              className={BUTTON_CLASS}
              onClick={() => {
                setOpenMobile(false);
                onAskTutor();
              }}
            >
              <MessageCircle />
              <span>{locale === "es" ? "Escribir al tutor" : "Write to the tutor"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Máxima Formación" className={BUTTON_CLASS}>
              <Link href="/" onClick={() => setOpenMobile(false)}>
                <ArrowUpRight />
                <span>Máxima Formación</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}
