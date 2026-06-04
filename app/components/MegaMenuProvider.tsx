'use client';

import { createContext, useContext } from 'react';

export type MegaMenuArea = {
  /** subjectArea value as stored in Strapi */
  key: string;
  /** Display label in the menu column header */
  label: string;
  /** URL slug for /programas/area/[slug] */
  slug: string;
  /**
   * Programs in this area. `href` is the canonical detail URL — `/programas/[slug]`
   * for Strapi programs, `/maxymia/campus/[slug]` for Maxymia courses — so the
   * header doesn't assume every program lives under /programas.
   */
  programs: { title: string; slug: string; href: string }[];
};

export type MegaMenuData = {
  areas: MegaMenuArea[];
};

const Ctx = createContext<MegaMenuData>({ areas: [] });

export function MegaMenuProvider({
  value,
  children,
}: {
  value: MegaMenuData;
  children: React.ReactNode;
}) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMegaMenu(): MegaMenuData {
  return useContext(Ctx);
}
