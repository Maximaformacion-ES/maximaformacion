'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Menu, X, ChevronDown, User, Crown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSiteBranding } from './SiteBrandingProvider';
import { useMegaMenu } from './MegaMenuProvider';

/**
 * Header presentacional SIN dependencia de Clerk. Recibe el estado de sesión y
 * los "slots" del avatar como props, de modo que puede usarse tanto desde el
 * <Header> con Clerk (rutas de app) como desde el <MarketingHeader> (home y
 * marketing, que NO cargan Clerk). Toda la navegación/megamenú vive aquí para
 * no duplicarla entre ambos.
 */

export interface HeaderViewProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (value: boolean) => void;
  variant?: 'default' | 'maxymia';
  navItems?: NavItem[];
  /** Estado de sesión (de Clerk en app, o de la cookie __client_uat en marketing). */
  isSignedIn: boolean | undefined;
  /** Si el usuario es Pro (solo lo conoce el Header con Clerk; en marketing = false). */
  userHasPro: boolean | undefined;
  /** Contenido del área de sesión en escritorio (avatar Clerk o enlace "Mi cuenta"). */
  desktopSignedIn: React.ReactNode;
  /** Contenido del área de sesión en móvil (avatar Clerk o icono "Mi cuenta"). */
  mobileSignedIn: React.ReactNode;
}

export interface NavItem {
  name: string;
  path: string;
  /** Optional grouped sub-items for the mega-menu (desktop) and collapsible (mobile). */
  megaMenu?: {
    /** Title shown above each column in the dropdown. */
    columns: {
      title: string;
      links: { label: string; href: string; description?: string }[];
      /** Optional "Ver todos" link rendered at the bottom of the column.
       *  Used when the visible items are truncated from a larger set. */
      footerLink?: { label: string; href: string };
    }[];
    /** Optional highlight card on the right side of the dropdown. */
    feature?: {
      title: string;
      description: string;
      href: string;
      cta: string;
      /** Estilo dorado + icono corona (usado por la card "Área PRO"). */
      highlight?: boolean;
    };
  };
}

export const NAV_ITEMS: NavItem[] = [
  { name: 'Conócenos', path: '/conocenos' },
  {
    name: 'Formación',
    path: '/programas',
    megaMenu: {
      columns: [
        {
          title: 'Catálogo',
          links: [
            { label: 'Todos los programas', href: '/programas', description: 'Másters y cursos' },
            { label: 'Másters', href: '/programas?type=Master', description: 'Programas largos' },
            { label: 'Cursos', href: '/programas?type=Curso', description: 'Programas cortos' },
          ],
        },
        {
          title: 'Por área',
          links: [
            { label: 'Ciencia de Datos', href: '/programas?area=Ciencia+de+Datos' },
            { label: 'Inteligencia Artificial', href: '/programas?area=Inteligencia+Artificial' },
            { label: 'Salud basada en datos', href: '/programas?area=Salud+basada+en+datos' },
            { label: 'Moodle / E-learning', href: '/programas?area=Moodle' },
          ],
        },
        {
          title: 'Equipo',
          links: [
            { label: 'Profesorado', href: '/profesorado', description: '7 docentes' },
            { label: 'Autores y colaboradores', href: '/autores' },
          ],
        },
      ],
      feature: {
        title: 'Área PRO',
        description: 'Todo lo que incluye tu suscripción: mini-cursos exclusivos, cursos gratis y recursos premium.',
        href: '/pro-content',
        cta: 'Ver todo lo que incluye',
        highlight: true,
      },
    },
  },
  { name: 'Consultoría', path: '/consultoria' },
  { name: 'Innovación', path: '/innovacion' },
  {
    name: 'Recursos',
    path: '/recursos',
    megaMenu: {
      columns: [
        {
          title: 'Contenido',
          links: [
            { label: 'Blog', href: '/blog', description: 'Artículos del equipo' },
            { label: 'Recursos descargables', href: '/recursos', description: 'PDFs, guías, TFMs' },
            { label: 'Contenido PRO', href: '/pro-content', description: 'Apps, datos y plantillas para suscriptores PRO' },
          ],
        },
        {
          title: 'Para empezar',
          links: [
            { label: 'Guías rápidas', href: '/recursos?category=Guias+rapidas' },
            { label: 'E-books', href: '/recursos?category=E-books' },
            { label: 'TFMs publicados', href: '/recursos?category=TFM' },
          ],
        },
      ],
      feature: {
        title: 'Newsletter',
        description: 'Recibe artículos y descargas en tu email. Sin spam — solo contenido útil.',
        href: '/recursos',
        cta: 'Suscribirme',
      },
    },
  },
  { name: 'Contacto', path: '/contacto' },
  { name: 'Maxymia', path: '/maxymia' },
];

const CAMPUS_OPTIONS = [
  { name: 'E-Learning', url: 'https://maximaformacion.com.es/' },
  { name: 'Data Science', url: 'https://www.maximacampus.es/' },
  { name: 'Maxymia', url: '/maxymia/campus' },
];

// --- Sub-components ---

interface DesktopAuthButtonsProps {
  isDark: boolean;
  isSignedIn: boolean | undefined;
  desktopSignedIn: React.ReactNode;
}

function DesktopAuthButtons({ isDark, isSignedIn, desktopSignedIn }: DesktopAuthButtonsProps) {
  if (isSignedIn) {
    return <>{desktopSignedIn}</>;
  }
  return (
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
            {CAMPUS_OPTIONS.map((option, index) => {
              const isExternal = option.url.startsWith('http');
              return (
                <m.a
                  key={option.name}
                  href={option.url}
                  {...(isExternal && { target: '_blank', rel: 'noopener noreferrer' })}
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
              );
            })}
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
  pathname: string;
}

function MobileMenu({ isMenuOpen, setIsMenuOpen, isDark, isSignedIn, pathname }: MobileMenuProps) {
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
              {!isSignedIn && (
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
              )}
              {isSignedIn && <div />}
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-1.5 rounded-full hover:bg-black/5 transition-colors"
              >
                <X size={16} className={textMuted} />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex flex-col pt-5 pb-3 flex-1 overflow-y-auto">
              {NAV_ITEMS.map((item, i) => {
                const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
                return (
                  <m.div
                    key={item.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <MobileNavRow
                      item={item}
                      isActive={isActive}
                      onClose={() => setIsMenuOpen(false)}
                      textColor={textColor}
                      textMuted={textMuted}
                      sectionLabel={sectionLabel}
                      linkHoverBg={linkHoverBg}
                      activeBg={activeBg}
                      activeBorder={activeBorder}
                    />
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
                {CAMPUS_OPTIONS.map((option) => {
                  const isExternal = option.url.startsWith('http');
                  return (
                    <a
                      key={option.name}
                      href={option.url}
                      {...(isExternal && { target: '_blank', rel: 'noopener noreferrer' })}
                      className={`flex items-center justify-between px-3 py-2 text-label-md font-medium rounded-lg ${textMuted} ${linkHoverBg} transition-colors`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span>{option.name}</span>
                      <ArrowUpRight size={11} className="opacity-50" />
                    </a>
                  );
                })}
              </div>
            </m.div>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// --- Mobile nav row (handles both flat links and expandable mega-menu items) ---

interface MobileNavRowProps {
  item: NavItem;
  isActive: boolean;
  onClose: () => void;
  textColor: string;
  textMuted: string;
  sectionLabel: string;
  linkHoverBg: string;
  activeBg: string;
  activeBorder: string;
}

function MobileNavRow({
  item,
  isActive,
  onClose,
  textColor,
  textMuted,
  sectionLabel,
  linkHoverBg,
  activeBg,
  activeBorder,
}: MobileNavRowProps) {
  const [expanded, setExpanded] = useState(false);
  const hasSub = !!item.megaMenu;

  if (!hasSub) {
    return (
      <Link
        href={item.path}
        onClick={onClose}
        className={`block px-4 py-2.5 text-label-md font-medium transition-colors border-l-2 ${
          isActive ? `${textColor} ${activeBg} ${activeBorder}` : `${textMuted} ${linkHoverBg} border-transparent`
        }`}
      >
        {item.name}
      </Link>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className={`flex items-center justify-between w-full px-4 py-2.5 text-label-md font-medium transition-colors border-l-2 ${
          isActive ? `${textColor} ${activeBg} ${activeBorder}` : `${textMuted} ${linkHoverBg} border-transparent`
        }`}
      >
        <span>{item.name}</span>
        <ChevronDown size={14} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {expanded && item.megaMenu && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pl-6 pr-3 pb-2 pt-1">
              <Link
                href={item.path}
                onClick={onClose}
                className={`block px-3 py-1.5 text-label-md font-medium rounded-md ${textColor} ${linkHoverBg}`}
              >
                Ver todo →
              </Link>
              {item.megaMenu.columns.map((col) => (
                <div key={col.title} className="mt-3">
                  <p className={`${sectionLabel} text-label-sm font-semibold uppercase tracking-widest px-3 mb-1`}>
                    {col.title}
                  </p>
                  <ul>
                    {col.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          onClick={onClose}
                          className={`block px-3 py-1.5 text-label-md font-light rounded-md ${textMuted} ${linkHoverBg}`}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                    {col.footerLink && (
                      <li>
                        <Link
                          href={col.footerLink.href}
                          onClick={onClose}
                          className={`block px-3 py-1.5 text-label-md font-semibold text-mx-orange rounded-md ${linkHoverBg}`}
                        >
                          {col.footerLink.label}
                        </Link>
                      </li>
                    )}
                  </ul>
                </div>
              ))}
              {item.megaMenu.feature?.highlight && (
                <Link
                  href={item.megaMenu.feature.href}
                  onClick={onClose}
                  className="mt-3 flex items-center gap-2 mx-3 px-3 py-2.5 rounded-lg border border-mx-orange/30 bg-mx-orange/10 text-mx-orange text-label-md font-semibold hover:bg-mx-orange/15"
                >
                  <Crown size={16} className="shrink-0" />
                  {item.megaMenu.feature.title}
                  <ArrowUpRight size={14} className="ml-auto shrink-0" />
                </Link>
              )}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Mega menu trigger (desktop) ---

type FeatureCard = NonNullable<NavItem['megaMenu']>['feature'];

interface MegaMenuTriggerProps {
  item: NavItem;
  isActive: boolean;
  isDark: boolean;
  /**
   * Override la tarjeta destacada del dropdown. `null` la oculta, `undefined`
   * usa la de la definición de NAV_ITEMS, un objeto la sustituye.
   */
  featureOverride?: FeatureCard | null;
}

function MegaMenuTrigger({ item, isActive, isDark, featureOverride }: MegaMenuTriggerProps) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const handleLeave = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };

  if (!item.megaMenu) return null;

  // Resolve which feature card to show:
  //   featureOverride === undefined → default from NAV_ITEMS
  //   featureOverride === null      → hide the card entirely
  //   featureOverride object        → use that
  const feature: FeatureCard | undefined =
    featureOverride === undefined ? item.megaMenu.feature : featureOverride ?? undefined;

  return (
    <div
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <Link
        href={item.path}
        className={`inline-flex items-center gap-1 text-[14px] font-light tracking-wide relative group hover:text-mx-orange transition-colors duration-300 ${
          isDark
            ? isActive
              ? 'text-white font-medium'
              : 'text-white/80'
            : isActive
              ? 'text-mx-orange'
              : 'text-mx-text'
        }`}
      >
        {item.name}
        <ChevronDown
          size={12}
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
        <span
          className={`absolute -bottom-1 left-0 h-px bg-mx-orange transition-all duration-300 ${
            isActive ? 'w-full' : 'w-0 group-hover:w-full'
          }`}
        />
      </Link>

      <AnimatePresence>
        {open && (
          <m.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            // Full-bleed: span the whole viewport horizontally so the four
            // columns of program names have room to breathe. Anchored
            // `fixed` to the bottom of the header instead of relative to
            // the trigger so the panel is centred on the viewport, not on
            // the "Formación" link (which sits right of centre).
            className="fixed inset-x-0 top-[72px] sm:top-[96px] z-50 pt-4 flex justify-center px-4 sm:px-6 md:px-12"
            // The dropdown is a React child of the trigger wrapper, but
            // `position: fixed` removes it from the parent's hit-box. Wire
            // the same hover handlers here so moving the cursor from the
            // trigger into the menu does not start the close timer.
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
          >
            <div
              className={`w-full max-w-[1400px] rounded-2xl shadow-xl border ${
                isDark
                  ? 'bg-[#0f1520] border-white/10'
                  : 'bg-mx-card border-mx-border'
              }`}
            >
              <div className="grid grid-cols-[1fr_auto] gap-0">
                <div
                  className={`grid gap-6 p-6 md:p-7 ${
                    item.megaMenu.columns.length >= 4 ? 'grid-cols-4' : 'grid-cols-3'
                  }`}
                >
                  {item.megaMenu.columns.map((col) => (
                    <div key={col.title} className="flex flex-col">
                      <p
                        className={`text-label-sm tracking-widest uppercase font-semibold mb-3 ${
                          isDark ? 'text-white/40' : 'text-mx-text-muted'
                        }`}
                      >
                        {col.title}
                      </p>
                      <ul className="space-y-1 flex-1">
                        {col.links.map((link) => (
                          <li key={link.href}>
                            <Link
                              href={link.href}
                              className={`block px-2 py-1.5 rounded-md text-body-sm font-medium transition-colors ${
                                isDark
                                  ? 'text-white/85 hover:bg-white/5 hover:text-mx-orange'
                                  : 'text-mx-text hover:bg-mx-orange/5 hover:text-mx-orange'
                              }`}
                              onClick={() => setOpen(false)}
                            >
                              {link.label}
                              {link.description && (
                                <span
                                  className={`block text-label-md font-light mt-0.5 ${
                                    isDark ? 'text-white/40' : 'text-mx-text-muted'
                                  }`}
                                >
                                  {link.description}
                                </span>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                      {col.footerLink && (
                        <Link
                          href={col.footerLink.href}
                          onClick={() => setOpen(false)}
                          className={`mt-2 px-2 py-1.5 text-label-md font-semibold tracking-wide rounded-md transition-colors ${
                            isDark
                              ? 'text-mx-orange hover:bg-white/5'
                              : 'text-mx-orange hover:bg-mx-orange/5'
                          }`}
                        >
                          {col.footerLink.label}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
                {feature && (
                  <div
                    className={`w-60 p-6 md:p-7 rounded-r-2xl flex flex-col justify-between ${
                      feature.highlight
                        ? 'bg-gradient-to-br from-mx-orange/20 to-mx-orange/[0.03] border-l border-mx-orange/30'
                        : isDark
                          ? 'bg-gradient-to-br from-mx-blue/15 to-transparent border-l border-white/10'
                          : 'bg-gradient-to-br from-mx-orange/8 to-mx-orange/[0.02] border-l border-mx-border'
                    }`}
                  >
                    <div>
                      <p className="text-mx-orange text-label-sm tracking-widest uppercase font-semibold mb-2">
                        {feature.highlight ? 'Incluido en PRO' : 'Destacado'}
                      </p>
                      <p
                        className={`text-body-lg font-bold leading-snug mb-2 flex items-center gap-1.5 ${
                          isDark ? 'text-white' : 'text-mx-text'
                        }`}
                      >
                        {feature.highlight && <Crown size={18} className="text-mx-orange shrink-0" />}
                        {feature.title}
                      </p>
                      <p
                        className={`text-body-sm font-light leading-relaxed ${
                          isDark ? 'text-white/60' : 'text-mx-text-muted'
                        }`}
                      >
                        {feature.description}
                      </p>
                    </div>
                    <Link
                      href={feature.href}
                      className="mt-4 inline-flex items-center gap-1.5 text-mx-orange text-label-md font-semibold hover:gap-2 transition-all"
                      onClick={() => setOpen(false)}
                    >
                      {feature.cta}
                      <ArrowUpRight size={14} />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Main presentational Header ---

export const HeaderView: React.FC<HeaderViewProps> = ({
  isMenuOpen,
  setIsMenuOpen,
  variant = 'default',
  navItems,
  isSignedIn,
  userHasPro,
  desktopSignedIn,
  mobileSignedIn,
}) => {
  const isDark = variant === 'maxymia';
  const pathname = usePathname();
  const branding = useSiteBranding();
  const megaMenu = useMegaMenu();

  // Replace the static "Formación" megamenu columns with one column per
  // subject area, each listing up to MAX_PROGRAMS_PER_COLUMN programs from
  // that area. If an area has more programs than the cap, append a footer
  // link to the full landing. Falls back to the static columns when Strapi
  // is unavailable at build time.
  const MAX_PROGRAMS_PER_COLUMN = 6;
  const items = useMemo(() => {
    const base = navItems ?? NAV_ITEMS;
    const dynamicAreas = megaMenu.areas.filter((a) => a.programs.length > 0);
    if (dynamicAreas.length === 0) return base;
    return base.map((item) => {
      if (item.name !== 'Formación' || !item.megaMenu) return item;
      return {
        ...item,
        megaMenu: {
          ...item.megaMenu,
          columns: dynamicAreas.map((area) => {
            const capped = area.programs.slice(0, MAX_PROGRAMS_PER_COLUMN);
            const hasMore = area.programs.length > MAX_PROGRAMS_PER_COLUMN;
            return {
              title: area.label,
              links: capped.map((p) => ({
                label: p.title,
                href: p.href,
              })),
              ...(hasMore && {
                footerLink: {
                  label: `Ver los ${area.programs.length} cursos →`,
                  href: `/programas/area/${area.slug}`,
                },
              }),
            };
          }),
        },
      };
    });
  }, [navItems, megaMenu]);
  // En /consultoria usamos un logo y nombre diferenciados (Maxima Consultoria,
  // brand verde-azul). En Maxymia mantenemos el logo oscuro de la marca. En el
  // resto, el logo estándar de Máxima Formación.
  const isConsultoria = !isDark && pathname?.startsWith('/consultoria');
  const logoSrc = isDark
    ? branding.logoMaxymia
    : isConsultoria
      ? '/logo-consultoria.png'
      : branding.logoMaximaformacion;
  const logoAlt = isDark
    ? 'Maxymia'
    : isConsultoria
      ? 'Máxima Consultoría'
      : 'Máxima Formación';

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
              {logoSrc && (
                <Image
                  src={logoSrc}
                  alt={logoAlt}
                  width={isConsultoria ? 360 : 200}
                  height={80}
                  className={isDark ? 'h-8 sm:h-10 md:h-12 w-auto' : 'h-9 sm:h-10 md:h-12 w-auto'}
                  priority
                />
              )}
            </m.a>

            <div className="hidden xl:flex items-center gap-8">
              {items.map((item) => {
                const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
                if (item.megaMenu) {
                  // La card "Área PRO" de Formación se muestra a todos (→ /pro-content,
                  // que ya hace de escaparate y upsell). Para quien ya es Pro,
                  // ajustamos el copy a "acceso" en vez de "descubrimiento".
                  const featureOverride: FeatureCard | undefined =
                    item.name === 'Formación' && userHasPro
                      ? {
                          title: 'Área PRO',
                          description: 'Tus mini-cursos exclusivos, los cursos incluidos y los recursos premium.',
                          href: '/pro-content',
                          cta: 'Ir a mi Área PRO',
                          highlight: true,
                        }
                      : undefined;
                  return (
                    <MegaMenuTrigger
                      key={item.name}
                      item={item}
                      isActive={isActive}
                      isDark={isDark}
                      featureOverride={featureOverride}
                    />
                  );
                }
                return (
                  <Link
                    key={item.name}
                    href={item.path}
                    className={`text-[14px] font-light tracking-wide relative group hover:text-mx-orange transition-colors duration-300 ${isDark ? (isActive ? 'text-white font-medium' : 'text-white/80') : (isActive ? 'text-mx-orange' : 'text-mx-text')}`}
                  >
                    {item.name}
                    <span className={`absolute -bottom-1 left-0 h-px bg-mx-orange transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <DesktopAuthButtons isDark={isDark} isSignedIn={isSignedIn} desktopSignedIn={desktopSignedIn} />
              <CampusDropdown isDark={isDark} />

              {/* Mobile: user avatar + burger */}
              <div className="flex xl:hidden items-center gap-2">
                {isSignedIn && mobileSignedIn}
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
        pathname={pathname}
      />
    </>
  );
};
