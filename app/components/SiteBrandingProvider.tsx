'use client';

import { createContext, useContext } from 'react';

export type SiteBranding = {
  logoMaximaformacion: string;
  logoMaxymia: string;
};

const Ctx = createContext<SiteBranding>({
  logoMaximaformacion: '',
  logoMaxymia: '',
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
