'use client';

import { createContext, useContext } from 'react';

export type SiteBranding = {
  headerLogo: string;
  footerLogo: string;
  maxymiaLogo: string;
};

const Ctx = createContext<SiteBranding>({
  headerLogo: '',
  footerLogo: '',
  maxymiaLogo: '',
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
