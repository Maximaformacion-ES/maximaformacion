'use client';

import React from 'react';
import { m } from 'framer-motion';
import { Crown, GraduationCap, Shield } from 'lucide-react';
import Link from 'next/link';
import {
  UserButton,
  useUser,
} from '@clerk/nextjs';
import { useUserCampus } from '@/app/hooks/useUserCampus';
import { HeaderView, type NavItem } from './HeaderView';

interface HeaderProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (value: boolean) => void;
  variant?: 'default' | 'maxymia';
  navItems?: NavItem[];
}

// Shared UserButton appearance config used by both desktop and mobile
const USER_BUTTON_APPEARANCE = {
  variables: {
    colorBackground: '#141414',
    colorText: '#ffffff',
    colorTextSecondary: '#a3a3a3',
    colorPrimary: '#f59e0b',
  },
  elements: {
    avatarBox: {
      width: '44px',
      height: '44px',
      border: '2px solid rgba(245, 158, 11, 0.5)',
      transition: 'all 0.3s ease',
    },
    avatarImage: {
      width: '100%',
      height: '100%',
    },
    userButtonPopoverCard: {
      backgroundColor: '#141414',
      border: '1px solid rgba(245, 158, 11, 0.3)',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
    },
    userButtonPopoverMain: {
      backgroundColor: '#141414',
    },
    userButtonPopoverActions: {
      backgroundColor: '#141414',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    },
    userButtonPopoverActionButton: {
      color: '#ffffff',
      backgroundColor: 'transparent',
    },
    userButtonPopoverActionButtonText: {
      color: '#ffffff',
    },
    userButtonPopoverActionButtonIcon: {
      color: 'rgba(255, 255, 255, 0.6)',
    },
    userPreview: {
      backgroundColor: '#141414',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    },
    userPreviewMainIdentifier: {
      color: '#ffffff',
    },
    userPreviewSecondaryIdentifier: {
      color: 'rgba(255, 255, 255, 0.6)',
    },
    userButtonPopoverFooter: {
      display: 'none' as const,
    },
  },
};

// Pro variant: avatar gets a layered golden ring + subtle halo (no Pro text needed).
function getProUserButtonAppearance(
  base: typeof USER_BUTTON_APPEARANCE,
  size: '44px' | '48px',
) {
  return {
    ...base,
    elements: {
      ...base.elements,
      avatarBox: {
        width: size,
        height: size,
        border: '2px solid #f59e0b',
        boxShadow: '0 0 0 2px #fcd34d, 0 0 16px rgba(245, 158, 11, 0.55)',
        transition: 'all 0.3s ease',
      },
    },
  };
}

// --- Clerk avatar slots (only rendered when signed in) ---

function DesktopClerkAvatar({ userHasPro, isAdmin }: { userHasPro: boolean; isAdmin: boolean }) {
  return (
    <div className="hidden xl:flex items-center gap-3">
      {/* Upgrade CTA only for Free users — Pro is now signaled on the avatar */}
      {!userHasPro && (
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
      <div className="relative">
        <UserButton
          afterSignOutUrl="/"
          userProfileMode="navigation"
          userProfileUrl="/perfil"
          appearance={
            userHasPro
              ? getProUserButtonAppearance(USER_BUTTON_APPEARANCE, '44px')
              : USER_BUTTON_APPEARANCE
          }
        >
          <UserButton.MenuItems>
            {isAdmin && (
              <UserButton.Link
                label="Admin"
                labelIcon={<Shield size={16} />}
                href="/admin"
              />
            )}
            <UserButton.Link
              label="Mis Cursos"
              labelIcon={<GraduationCap size={16} />}
              href="/perfil/cursos"
            />
            <UserButton.Action label="manageAccount" />
            <UserButton.Action label="signOut" />
          </UserButton.MenuItems>
        </UserButton>
        {userHasPro && (
          <span
            aria-label="Suscripción Pro"
            title="Suscripción Pro"
            className="absolute -top-1 -right-1 z-10 pointer-events-none flex items-center justify-center w-5 h-5 bg-white text-mx-orange rounded-full shadow ring-2 ring-mx-orange"
          >
            <Crown size={11} fill="currentColor" />
          </span>
        )}
      </div>
    </div>
  );
}

function MobileClerkAvatar({ isDark, userHasPro, isAdmin }: { isDark: boolean; userHasPro: boolean; isAdmin: boolean }) {
  return (
    <div className="relative">
      <UserButton
        afterSignOutUrl="/"
        userProfileMode="navigation"
        userProfileUrl="/perfil"
        appearance={{
          elements: {
            avatarBox: userHasPro
              ? {
                  width: '28px',
                  height: '28px',
                  border: '1.5px solid #f59e0b',
                  boxShadow: '0 0 0 1.5px #fcd34d, 0 0 10px rgba(245, 158, 11, 0.5)',
                }
              : {
                  width: '28px',
                  height: '28px',
                  border: isDark
                    ? '1px solid rgba(255,255,255,0.2)'
                    : '1px solid rgba(0,0,0,0.15)',
                },
          },
        }}
      >
        <UserButton.MenuItems>
          {isAdmin && (
            <UserButton.Link
              label="Admin"
              labelIcon={<Shield size={16} />}
              href="/admin"
            />
          )}
          <UserButton.Link
            label="Mis Cursos"
            labelIcon={<GraduationCap size={16} />}
            href="/perfil/cursos"
          />
          <UserButton.Action label="manageAccount" />
          <UserButton.Action label="signOut" />
        </UserButton.MenuItems>
      </UserButton>
      {userHasPro && (
        <span
          aria-label="Suscripción Pro"
          title="Suscripción Pro"
          className="absolute -top-1 -right-1 z-10 pointer-events-none flex items-center justify-center w-[18px] h-[18px] bg-white text-mx-orange rounded-full ring-2 ring-mx-orange shadow-sm"
        >
          <Crown size={11} fill="currentColor" />
        </span>
      )}
    </div>
  );
}

/**
 * Header CON Clerk — usado por las rutas de app (campus, cursos, perfil…),
 * envueltas en <ClerkProvider>. Es un envoltorio fino sobre <HeaderView>: aporta
 * el estado real de sesión (useUser/useUserCampus), el rol admin y el avatar
 * interactivo (UserButton). La navegación/megamenú vive en HeaderView y se
 * comparte con el <MarketingHeader> (que no carga Clerk). El API público no
 * cambia, así que las páginas que ya usan <Header> no se tocan.
 */
export const Header: React.FC<HeaderProps> = ({ isMenuOpen, setIsMenuOpen, variant = 'default', navItems }) => {
  const { isSignedIn, user } = useUser();
  const { hasPro } = useUserCampus();
  const userHasPro = !!(isSignedIn && hasPro);
  // Opción "Admin" en el menú del avatar, solo para role==='admin' en Clerk.
  const isAdmin = (user?.publicMetadata as { role?: string } | undefined)?.role === 'admin';
  const isDark = variant === 'maxymia';

  return (
    <HeaderView
      isMenuOpen={isMenuOpen}
      setIsMenuOpen={setIsMenuOpen}
      variant={variant}
      navItems={navItems}
      isSignedIn={isSignedIn}
      userHasPro={userHasPro}
      desktopSignedIn={<DesktopClerkAvatar userHasPro={userHasPro} isAdmin={isAdmin} />}
      mobileSignedIn={<MobileClerkAvatar isDark={isDark} userHasPro={userHasPro} isAdmin={isAdmin} />}
    />
  );
};

// Re-export para quien importe el tipo desde el Header.
export type { NavItem };
