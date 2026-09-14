'use client';

import { createContext, useContext } from 'react';

export type SiteBranding = {
  logoMaximaformacion: string;
  logoMaxymia: string;
  /** Favicon del sitio (Site Metadata de Strapi); '' si no hay. */
  favicon: string;
};

const Ctx = createContext<SiteBranding>({
  logoMaximaformacion: '',
  logoMaxymia: '',
  favicon: '',
});

export function SiteBrandingProvider({
  value,
  children,
}: {
  value: SiteBranding;
  children: React.ReactNode;
}) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSiteBranding(): SiteBranding {
  return useContext(Ctx);
}
