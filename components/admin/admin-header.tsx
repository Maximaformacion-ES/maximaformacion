"use client";

import { Fragment } from "react";
import { usePathname } from "next/navigation";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const LABELS: Record<string, string> = {
  alumnos: "Alumnos",
  compras: "Compras",
  emails: "Emails",
  leads: "Leads",
  auditoria: "Auditoría",
  progreso: "Progreso",
};

interface Crumb {
  label: string;
  href?: string;
}

function crumbsFor(pathname: string): Crumb[] {
  const segments = pathname.replace(/^\/admin\/?/, "").split("/").filter(Boolean);

  if (segments.length === 0) return [{ label: "Dashboard" }];

  // Ocultamos los ids crudos (uuid) que siguen a un segmento "de detalle": el id
  // de alumno se muestra como "Ficha", y el id de curso tras "progreso" no se
  // muestra (el nombre del curso ya está en el H1 de la página).
  const visible = segments.map((_, i) => i).filter((i) => segments[i - 1] !== "progreso");

  const crumbs: Crumb[] = [{ label: "Panel", href: "/admin" }];
  visible.forEach((i, vi) => {
    const seg = segments[i];
    const label = LABELS[seg] ?? (segments[i - 1] === "alumnos" ? "Ficha" : seg);
    const isLast = vi === visible.length - 1;
    crumbs.push({ label, href: isLast ? undefined : `/admin/${segments.slice(0, i + 1).join("/")}` });
  });
  return crumbs;
}

export function AdminHeader() {
  const pathname = usePathname();
  const crumbs = crumbsFor(pathname);

  return (
    <header className="bg-background sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList className="gap-2 sm:gap-3">
          {crumbs.map((c, i) => (
            <Fragment key={i}>
              <BreadcrumbItem>
                {c.href ? (
                  <BreadcrumbLink href={c.href}>{c.label}</BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{c.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {i < crumbs.length - 1 && <BreadcrumbSeparator />}
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}
