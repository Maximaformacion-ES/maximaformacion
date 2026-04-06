'use client';

import React, { useState, useRef, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Menu, X, ChevronDown, User, Crown, Check } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from '@clerk/nextjs';
import { useUserCampus } from '@/app/hooks/useUserCampus';

interface HeaderProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (value: boolean) => void;
  variant?: 'default' | 'maxymia';
  navItems?: NavItem[];
}

interface NavItem {
  name: string;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Conocenos', path: '/conocenos' },
  { name: 'Formacion', path: '/programas' },
  { name: 'Consultoria', path: '/consultoria' },
  { name: 'Innovacion', path: '/innovacion' },
  { name: 'Blog', path: '/blog' },
  { name: 'Contacto', path: '/contacto' },
  { name: 'Maxymia', path: '/maxymia' },
];

const CAMPUS_OPTIONS = [
  { name: 'E-Learning', url: 'https://maximaformacion.com.es/' },
  { name: 'Data Science', url: 'https://www.maximacampus.es/' },
  { name: 'Maxymia', url: '/maxymia/campus' },
];

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

// Mobile override: larger avatar, no transition
const MOBILE_USER_BUTTON_APPEARANCE = {
  ...USER_BUTTON_APPEARANCE,
  elements: {
    ...USER_BUTTON_APPEARANCE.elements,
    avatarBox: {
      width: '48px',
      height: '48px',
      border: '2px solid rgba(245, 158, 11, 0.5)',
    },
  },
};

// --- Sub-components ---

interface DesktopAuthButtonsProps {
  isDark: boolean;
  userHasPro: boolean | undefined;
}

function DesktopAuthButtons({ isDark, userHasPro }: DesktopAuthButtonsProps) {
  return (
    <>
      <SignedOut>
        <div className="hidden xl:flex items-center gap-3">
          <Link href="/sign-in">
            <m.button
              className={`flex items-center gap-2 px-4 py-2 text-body-sm font-medium rounded-full transition-all duration-300 hover:cursor-pointer ${isDark ? 'border border-white/30 text-white hover:bg-white/10' : 'border border-mx-blue text-mx-blue hover:bg-mx-blue hover:text-white'}`}
              whileTap={{ scale: 0.98 }}
            >
              <User size={16} />
              Iniciar sesion
            </m.button>
          </Link>
          <Link href="/sign-up">
            <m.button
              className={`flex items-center gap-2 px-4 py-2 text-body-sm font-medium rounded-full transition-colors duration-300 hover:cursor-pointer ${isDark ? 'bg-mx-orange text-white hover:bg-mx-orange-dark' : 'bg-mx-blue text-white hover:bg-mx-blue/90'}`}
              whileTap={{ scale: 0.98 }}
            >
              Registrarse
            </m.button>
          </Link>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="hidden xl:flex items-center gap-3">
          {/* Pro Status / Upgrade CTA */}
          {userHasPro ? (
            <div className="flex items-center gap-2 bg-mx-orange/10 border border-mx-orange/30 text-mx-orange px-4 py-2 text-body-sm font-bold rounded-full">
              <Crown size={14} />
              Pro
              <Check size={14} />
            </div>
          ) : (
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
          <UserButton
            afterSignOutUrl="/"
            userProfileMode="navigation"
            userProfileUrl="/perfil"
            appearance={USER_BUTTON_APPEARANCE}
          />
        </div>
      </SignedIn>
    </>
  );
}

interface CampusDropdownProps {
  isDark: boolean;
}

function CampusDropdown({ isDark }: CampusDropdownProps) {
  const [isCampusDropdownOpen, setIsCampusDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCampusDropdownOpen(false);
      }
    };

    if (isCampusDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCampusDropdownOpen]);

  return (
    <div className="hidden xl:block relative" ref={dropdownRef}>
      <m.button
        onClick={() => setIsCampusDropdownOpen(!isCampusDropdownOpen)}
        className="flex items-center gap-2 bg-mx-orange text-white px-5 py-2.5 text-body-sm font-medium rounded-full hover:bg-mx-orange/90 transition-colors duration-300"
        whileTap={{ scale: 0.98 }}
      >
        Campus
        <ChevronDown
          size={14}
          className={`transition-transform duration-300 ${isCampusDropdownOpen ? 'rotate-180' : ''}`}
        />
      </m.button>

      <AnimatePresence>
        {isCampusDropdownOpen && (
          <m.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`absolute right-0 mt-2 w-48 rounded-lg overflow-hidden shadow-xl ${isDark ? 'bg-[#0d1025] border border-white/10' : 'bg-mx-card border border-mx-border'}`}
          >
            {CAMPUS_OPTIONS.map((option, index) => (
              <m.a
                key={option.name}
                href={option.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`block px-4 py-3 text-body-sm font-light hover:bg-mx-orange/10 hover:text-mx-orange transition-colors duration-200 last:border-b-0 ${isDark ? 'text-white/80 border-b border-white/10' : 'text-mx-text border-b border-mx-border'}`}
                onClick={() => setIsCampusDropdownOpen(false)}
              >
                <div className="flex items-center justify-between">
                  <span>{option.name}</span>
                  <ArrowUpRight size={14} className="opacity-50" />
                </div>
              </m.a>
            ))}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface MobileMenuProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (v: boolean) => void;
  isDark: boolean;
  isSignedIn: boolean | undefined;
  userHasPro: boolean | undefined;
  pathname: string;
}

function MobileMenu({ isMenuOpen, setIsMenuOpen, isDark, pathname }: MobileMenuProps) {
  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  const panelBg = isDark ? 'bg-[#0f1520]' : 'bg-white';
  const borderColor = isDark ? 'border-white/10' : 'border-black/10';
  const textColor = isDark ? 'text-white' : 'text-mx-text';
  const textMuted = isDark ? 'text-white/50' : 'text-mx-text-muted';
  const sectionLabel = isDark ? 'text-white/30' : 'text-mx-text-muted';
  const linkHoverBg = isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-black/[0.03]';
  const activeBg = isDark ? 'bg-white/5' : 'bg-black/5';
  const activeBorder = isDark ? 'border-mx-blue' : 'border-mx-orange';

  return (
    <AnimatePresence>
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] xl:hidden">
          {/* Backdrop */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Panel */}
          <m.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={`absolute top-0 right-0 w-64 h-full ${panelBg} border-l ${borderColor} shadow-2xl shadow-black/50 flex flex-col`}
          >
            {/* Header: close button */}
            <div className={`flex items-center justify-between px-4 py-3.5 border-b ${borderColor}`}>
              <SignedOut>
                <div className="flex items-center gap-2">
                  <Link
                    href="/sign-in"
                    onClick={() => setIsMenuOpen(false)}
                    className={`px-3 py-1.5 text-label-md font-medium rounded-lg ${textMuted} ${linkHoverBg} transition-colors`}
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    href="/sign-up"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-3 py-1.5 text-label-md font-medium rounded-lg bg-mx-orange text-white hover:bg-mx-orange/90 transition-colors"
                  >
                    Registrarse
                  </Link>
                </div>
              </SignedOut>
              <SignedIn>
                <div />
              </SignedIn>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-1.5 rounded-full hover:bg-black/5 transition-colors"
              >
                <X size={16} className={textMuted} />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex flex-col pt-5 pb-3">
              {NAV_ITEMS.map((item, i) => {
                const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
                return (
                  <m.div
                    key={item.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      href={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`block px-4 py-2.5 text-label-md font-medium transition-colors border-l-2 ${
                        isActive
                          ? `${textColor} ${activeBg} ${activeBorder}`
                          : `${textMuted} ${linkHoverBg} border-transparent`
                      }`}
                    >
                      {item.name}
                    </Link>
                  </m.div>
                );
              })}
            </nav>

            {/* Campus links */}
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className={`px-4 py-3 border-t ${borderColor}`}
            >
              <span className={`${sectionLabel} text-label-sm font-semibold uppercase tracking-widest`}>Campus</span>
              <div className="mt-2 flex flex-col gap-1">
                {CAMPUS_OPTIONS.map((option) => (
                  <a
                    key={option.name}
                    href={option.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-between px-3 py-2 text-label-md font-medium rounded-lg ${textMuted} ${linkHoverBg} transition-colors`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>{option.name}</span>
                    <ArrowUpRight size={11} className="opacity-50" />
                  </a>
                ))}
              </div>
            </m.div>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// --- Main Header component (thin orchestrator) ---

export const Header: React.FC<HeaderProps> = ({ isMenuOpen, setIsMenuOpen, variant = 'default', navItems }) => {
  const isDark = variant === 'maxymia';
  const pathname = usePathname();
  const { isSignedIn } = useUser();
  const { hasPro } = useUserCampus();

  const userHasPro = isSignedIn && hasPro;
  const items = navItems ?? NAV_ITEMS;

  return (
    <>
      <m.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={`left-0 right-0 z-50 ${isDark ? 'top-8 bg-[#0b1018] border-b border-white/10' : 'fixed top-0 bg-mx-bg border-b border-mx-border'}`}
      >
        <div className={`px-4 py-3 sm:px-6 sm:py-6 ${isDark ? 'md:px-32 max-w-[1800px] mx-auto' : 'md:px-12'}`}>
          <div className="flex items-center justify-between">
            <m.a
              href={isDark ? "/maxymia" : "/"}
              className="flex items-center"
              whileHover={{ scale: 1.02 }}
            >
              {isDark ? (
                <Image
                  src="/logo-completo.webp"
                  alt="Maxymia"
                  width={200}
                  height={80}
                  className="h-8 sm:h-10 md:h-12 w-auto"
                  priority
                />
              ) : (
                <Image
                  src="/newLogo.png"
                  alt="Maxima Formacion"
                  width={200}
                  height={80}
                  className="h-9 sm:h-12 md:h-14 w-auto"
                  priority
                />
              )}
            </m.a>

            <div className="hidden xl:flex items-center gap-8">
              {items.map((item) => {
                const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.name}
                    href={item.path}
                    className={`text-body-sm font-light tracking-wide relative group hover:text-mx-orange transition-colors duration-300 ${isDark ? (isActive ? 'text-white font-medium' : 'text-white/80') : (isActive ? 'text-mx-orange' : 'text-mx-text')}`}
                  >
                    {item.name}
                    <span className={`absolute -bottom-1 left-0 h-px bg-mx-orange transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <DesktopAuthButtons isDark={isDark} userHasPro={userHasPro} />
              <CampusDropdown isDark={isDark} />

              {/* Mobile: user avatar + burger */}
              <div className="flex xl:hidden items-center gap-2">
                <SignedIn>
                  <UserButton
                    afterSignOutUrl="/"
                    userProfileMode="navigation"
                    userProfileUrl="/perfil"
                    appearance={{
                      elements: {
                        avatarBox: { width: '28px', height: '28px', border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.15)' },
                      },
                    }}
                  />
                </SignedIn>
                <m.button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={`p-2 ${isDark ? 'text-white' : 'text-mx-text'}`}
                  whileTap={{ scale: 0.9 }}
                >
                  {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
                </m.button>
              </div>
            </div>
          </div>
        </div>
      </m.nav>

      <MobileMenu
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        isDark={isDark}
        isSignedIn={isSignedIn}
        userHasPro={userHasPro}
        pathname={pathname}
      />
    </>
  );
};
