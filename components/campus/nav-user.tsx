"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { AnimatePresence, m } from "framer-motion";
import { ChevronUp, Home, LogOut, User as UserIcon } from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import type { Locale } from "@/app/maxymia/types";

/**
 * Usuario en el pie del sidebar del campus. Al pulsar, las opciones se
 * despliegan HACIA ARRIBA dentro del propio sidebar (panel en línea con
 * transición de altura/opacidad), no en un popup. Con el sidebar plegado a
 * iconos no hay sitio, y ahí sí se usa el menú flotante del kit.
 */

function initials(name: string): string {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "A"
  );
}

const emptySubscribe = () => () => {};
function useHydrated() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

const COPY = {
  es: { profile: "Mi perfil", site: "Volver a maximaformación", logout: "Cerrar sesión", account: "Cuenta" },
  en: { profile: "My profile", site: "Back to maximaformación", logout: "Sign out", account: "Account" },
} as const;

export function CampusNavUser({ locale = "es" }: { locale?: Locale }) {
  const hydrated = useHydrated();
  const { state, isMobile } = useSidebar();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [open, setOpen] = useState(false);
  const t = COPY[locale];

  const name = user?.fullName || user?.firstName || t.account;
  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const avatar = user?.imageUrl ?? undefined;
  const collapsed = state === "collapsed" && !isMobile;

  const trigger = (
    <SidebarMenuButton
      size="lg"
      aria-expanded={open}
      onClick={collapsed ? undefined : () => setOpen((v) => !v)}
      className="data-[state=open]:bg-sidebar-accent hover:bg-mx-orange/10"
    >
      <Avatar className="h-8 w-8 rounded-lg">
        <AvatarImage src={avatar} alt={name} />
        <AvatarFallback className="rounded-lg">{hydrated ? initials(name) : "··"}</AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-semibold">{hydrated ? name : t.account}</span>
        {hydrated && email && <span className="truncate text-xs">{email}</span>}
      </div>
      <ChevronUp className={`ml-auto size-4 transition-transform duration-300 ${open && !collapsed ? "rotate-180" : ""}`} />
    </SidebarMenuButton>
  );

  const items = (
    <>
      <Link href="/perfil" className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-mx-orange/10 hover:text-mx-orange-dark transition-colors">
        <UserIcon className="size-4" /> {t.profile}
      </Link>
      <Link href="/" className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-mx-orange/10 hover:text-mx-orange-dark transition-colors">
        <Home className="size-4" /> {t.site}
      </Link>
      <button
        type="button"
        onClick={() => signOut({ redirectUrl: "/maxymia" })}
        className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-mx-orange/10 hover:text-mx-orange-dark transition-colors"
      >
        <LogOut className="size-4" /> {t.logout}
      </button>
    </>
  );

  // Plegado a iconos: menú flotante del kit (no cabe un panel en línea).
  if (hydrated && collapsed) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-56 rounded-lg" side="right" align="end" sideOffset={4}>
              <DropdownMenuItem asChild><Link href="/perfil"><UserIcon /> {t.profile}</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/"><Home /> {t.site}</Link></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ redirectUrl: "/maxymia" })}><LogOut /> {t.logout}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      {/* Panel de opciones, por ENCIMA del usuario: crece hacia arriba. */}
      <AnimatePresence initial={false}>
        {open && (
          <m.div
            key="user-options"
            initial={{ height: 0, opacity: 0, y: 8 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: 8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mb-1 rounded-lg border border-mx-border bg-mx-card p-1 shadow-sm">{items}</div>
          </m.div>
        )}
      </AnimatePresence>
      <SidebarMenuItem>{trigger}</SidebarMenuItem>
    </SidebarMenu>
  );
}
