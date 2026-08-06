'use client';

import React from 'react';
import { m } from 'framer-motion';
import { User, Crown } from 'lucide-react';
import Link from 'next/link';
import { HeaderView, type NavItem } from './HeaderView';
import { useMarketingAuth } from '@/app/hooks/useMarketingAuth';

interface MarketingHeaderProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (value: boolean) => void;
  variant?: 'default' | 'maxymia';
  navItems?: NavItem[];
}

/**
 * Header para páginas de MARKETING (home, blog, recursos, conócenos, legal…).
 * NO carga Clerk (ahorra ~250 KB de JS y mejora el LCP móvil).
 *
 * - Sesión: se deduce de la cookie `__client_uat` de Clerk (no httpOnly, legible
 *   en cliente): "0" = desconectado, timestamp = con sesión.
 * - Plan Pro: si hay sesión, se consulta a `/api/user/profile` (lo mismo que
 *   hace useUserCampus, pero sin cargar Clerk). Así el header de marketing
 *   muestra igual que el de app: el botón "Hazte Pro" a los usuarios no-Pro y
 *   la tarjeta correcta del megamenú a los Pro. La llamada es post-hidratación,
 *   solo para usuarios logueados (minoría del tráfico de la home) y no bloquea
 *   el LCP.
 */
export const MarketingHeader: React.FC<MarketingHeaderProps> = ({
  isMenuOpen,
  setIsMenuOpen,
  variant = 'default',
  navItems,
}) => {
  const { isSignedIn, hasPro } = useMarketingAuth();
  const isDark = variant === 'maxymia';

  const desktopSignedIn = (
    <div className="hidden xl:flex items-center gap-3">
      {/* Upsell "Hazte Pro" solo para usuarios no-Pro (igual que el Header de app) */}
      {!hasPro && (
        <Link href="/pricing">
          <m.button
            className="flex items-center gap-2 bg-mx-orange text-white px-4 py-2 text-body-sm font-bold rounded-full hover:bg-mx-orange-dark transition-all duration-300 shadow-lg shadow-mx-orange/20 whitespace-nowrap"
            whileTap={{ scale: 0.98 }}
          >
            <Crown size={14} />
            Hazte Pro
          </m.button>
        </Link>
      )}
      <Link href="/perfil">
        <m.button
          className={`flex items-center gap-2 px-4 py-2 text-body-sm font-medium rounded-full transition-all duration-300 hover:cursor-pointer ${isDark ? 'border border-white/30 text-white hover:bg-white/10' : 'border border-mx-blue text-mx-blue hover:bg-mx-blue hover:text-white'}`}
          whileTap={{ scale: 0.98 }}
        >
          <User size={16} />
          Mi cuenta
        </m.button>
      </Link>
    </div>
  );

  const mobileSignedIn = (
    <Link
      href="/perfil"
      aria-label="Mi cuenta"
      className={`flex items-center justify-center w-8 h-8 rounded-full border transition-colors ${isDark ? 'border-white/20 text-white hover:bg-white/10' : 'border-black/15 text-mx-text hover:bg-black/5'}`}
    >
      <User size={16} />
    </Link>
  );

  return (
    <HeaderView
      isMenuOpen={isMenuOpen}
      setIsMenuOpen={setIsMenuOpen}
      variant={variant}
      navItems={navItems}
      isSignedIn={isSignedIn}
      userHasPro={hasPro}
      desktopSignedIn={desktopSignedIn}
      mobileSignedIn={mobileSignedIn}
    />
  );
};
