'use client';

import { createContext, useContext } from 'react';

export type MegaMenuArea = {
  /** subjectArea value as stored in Strapi */
  key: string;
  /** Display label in the menu column header */
  label: string;
  /** URL slug for /programas/area/[slug] */
  slug: string;
  programs: { title: string; slug: string }[];
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
