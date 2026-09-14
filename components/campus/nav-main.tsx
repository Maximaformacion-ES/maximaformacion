"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Award, BookOpen, GraduationCap, LayoutDashboard, type LucideIcon } from "lucide-react";
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
// naranja de Maxymia para el activo. La ayuda (tutor, volver a la web) vive
// en la cabecera, arriba a la derecha (campus-header.tsx).
const BUTTON_CLASS =
  "hover:bg-mx-orange/10 hover:text-mx-orange-dark data-[active=true]:bg-mx-orange/10 data-[active=true]:text-mx-orange-dark data-[active=true]:hover:bg-mx-orange/10 data-[active=true]:font-medium";

export function CampusNavMain({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{locale === "es" ? "Menú" : "Menu"}</SidebarGroupLabel>
      <SidebarMenu>
        {MAIN.map((item) => {
          // La página de un curso comprado (/maxymia/campus/<slug>) cuelga de
          // "Mis cursos" a efectos de navegación.
          const isCoursePage = /^\/maxymia\/campus\/(?!cursos|mis-cursos|notas)[^/]+/.test(pathname);
          const active = item.exact
            ? pathname === item.url
            : pathname === item.url || pathname.startsWith(`${item.url}/`) || (isCoursePage && item.url.endsWith('/mis-cursos'));
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
  );
}
