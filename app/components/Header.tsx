'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Menu, X, ChevronDown, User, Crown, Check } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import {
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from '@clerk/nextjs';

interface HeaderProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (value: boolean) => void;
  variant?: 'default' | 'maxymia';
}

interface NavItem {
  name: string;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Conócenos', path: '/conocenos' },
  { name: 'Formación', path: '/programas' },
  { name: 'Consultoría', path: '/consultoria' },
  { name: 'Innovación', path: '/innovacion' },
  { name: 'Blog', path: '/blog' },
  { name: 'Contacto', path: '/contacto' },
  { name: 'Maxymia', path: '/maxymia' },
];

const CAMPUS_OPTIONS = [
  { name: 'E-Learning', url: 'https://maximaformacion.com.es/' },
  { name: 'Data Science', url: 'https://www.maximacampus.es/' },
  { name: 'Maxymia', url: 'https://maxymia.com/' },
];

export const Header: React.FC<HeaderProps> = ({ isMenuOpen, setIsMenuOpen, variant = 'default' }) => {
  const isDark = variant === 'maxymia';
  const [isCampusDropdownOpen, setIsCampusDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isSignedIn, user } = useUser();
  
  // Check if user has Pro plan from Clerk metadata
  const userHasPro = isSignedIn && user?.publicMetadata?.plan === 'pro';

  // Close dropdown when clicking outside
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
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed left-0 right-0 z-50 ${isDark ? 'top-8 bg-[#060918] border-b border-white/10' : 'top-0 bg-mx-bg border-b border-mx-border'}`}
      >
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 py-6">
          <div className="flex items-center justify-between">
            <motion.a
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
                  className="h-10 md:h-12 w-auto"
                  priority
                />
              ) : (
                <Image
                  src="/newLogo.png"
                  alt="Maxima Formación"
                  width={200}
                  height={80}
                  className="h-12 md:h-14 w-auto"
                  priority
                />
              )}
            </motion.a>
            
            <div className="hidden lg:flex items-center gap-8">
              {NAV_ITEMS.map((item) => {
                const isActive = isDark && item.path === '/maxymia';
                return (
                  <Link
                    key={item.name}
                    href={item.path}
                    className={`text-sm font-light tracking-wide relative group hover:text-mx-orange transition-colors duration-300 ${isDark ? (isActive ? 'text-white' : 'text-white/80') : 'text-mx-text'}`}
                  >
                    {item.name}
                    <span className={`absolute -bottom-1 left-0 h-px bg-mx-orange transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                  </Link>
                );
              })}
            </div>
            
            <div className="flex items-center gap-4">
              {/* Auth Buttons */}
              <SignedOut>
                <div className="hidden md:flex items-center gap-3">
                  <Link href="/sign-in">
                    <motion.button
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 hover:cursor-pointer ${isDark ? 'border border-white/30 text-white hover:bg-white/10' : 'border border-mx-blue text-mx-blue hover:bg-mx-blue hover:text-white'}`}
                      whileTap={{ scale: 0.98 }}
                    >
                      <User size={16} />
                      Iniciar sesión
                    </motion.button>
                  </Link>
                  <Link href="/sign-up">
                    <motion.button
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-colors duration-300 hover:cursor-pointer ${isDark ? 'bg-mx-orange text-white hover:bg-mx-orange-dark' : 'bg-mx-blue text-white hover:bg-mx-blue/90'}`}
                      whileTap={{ scale: 0.98 }}
                    >
                      Registrarse
                    </motion.button>
                  </Link>
                </div>
              </SignedOut>
              
              <SignedIn>
                <div className="hidden md:flex items-center gap-3">
                  {/* Pro Status / Upgrade CTA */}
                  {userHasPro ? (
                    <div className="flex items-center gap-2 bg-mx-orange/10 border border-mx-orange/30 text-mx-orange px-4 py-2 text-sm font-bold rounded-full">
                      <Crown size={14} />
                      Pro
                      <Check size={14} />
                    </div>
                  ) : (
                    <Link href="/pricing">
                      <motion.button
                        className="flex items-center gap-2 bg-mx-orange text-white px-4 py-2 text-sm font-bold rounded-full hover:bg-mx-orange-dark transition-all duration-300 shadow-lg shadow-mx-orange/20 whitespace-nowrap"
                        
                        whileTap={{ scale: 0.98 }}
                      >
                        <Crown size={14} />
                        Hazte Pro
                      </motion.button>
                    </Link>
                  )}
                  <UserButton 
                    afterSignOutUrl="/"
                    userProfileMode="navigation"
                    userProfileUrl="/perfil"
                    appearance={{
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
                          display: 'none',
                        },
                      }
                    }}
                  />
                </div>
              </SignedIn>

              {/* Campus Dropdown */}
              <div className="hidden md:block relative" ref={dropdownRef}>
                <motion.button
                  onClick={() => setIsCampusDropdownOpen(!isCampusDropdownOpen)}
                  className="flex items-center gap-2 bg-mx-orange text-white px-5 py-2.5 text-sm font-medium rounded-full hover:bg-mx-orange/90 transition-colors duration-300"
                  whileTap={{ scale: 0.98 }}
                >
                  Campus
                  <ChevronDown 
                    size={14} 
                    className={`transition-transform duration-300 ${isCampusDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </motion.button>

                <AnimatePresence>
                  {isCampusDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className={`absolute right-0 mt-2 w-48 rounded-lg overflow-hidden shadow-xl ${isDark ? 'bg-[#0d1025] border border-white/10' : 'bg-mx-card border border-mx-border'}`}
                    >
                      {CAMPUS_OPTIONS.map((option, index) => (
                        <motion.a
                          key={option.name}
                          href={option.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`block px-4 py-3 text-sm font-light hover:bg-mx-orange/10 hover:text-mx-orange transition-colors duration-200 last:border-b-0 ${isDark ? 'text-white/80 border-b border-white/10' : 'text-mx-text border-b border-mx-border'}`}
                          onClick={() => setIsCampusDropdownOpen(false)}
                        >
                          <div className="flex items-center justify-between">
                            <span>{option.name}</span>
                            <ArrowUpRight size={14} className="opacity-50" />
                          </div>
                        </motion.a>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <motion.button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`lg:hidden p-2 ${isDark ? 'text-white' : 'text-mx-text'}`}
                whileTap={{ scale: 0.9 }}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed inset-0 z-40 pt-24 px-6 ${isDark ? 'bg-[#060918]' : 'bg-mx-bg'}`}
          >
            <div className="flex flex-col gap-6">
              {NAV_ITEMS.map((item, i) => (
                <Link
                  key={item.name}
                  href={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-3xl font-light ${isDark ? 'text-white' : 'text-mx-text'}`}
                >
                  <motion.span
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    {item.name}
                  </motion.span>
                </Link>
              ))}
              {/* Mobile Auth Buttons */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8 flex flex-col gap-3"
              >
                <span className="text-mx-text-muted text-sm mb-2">Mi cuenta:</span>
                <SignedOut>
                  <Link href="/sign-in" onClick={() => setIsMenuOpen(false)}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.65 }}
                      className="flex items-center justify-between gap-2 bg-mx-border/50 hover:bg-mx-border text-mx-text px-6 py-3 text-base font-light rounded-full transition-colors"
                    >
                      <span>Iniciar sesión</span>
                      <User size={18} />
                    </motion.div>
                  </Link>
                  <Link href="/sign-up" onClick={() => setIsMenuOpen(false)}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 }}
                      className="flex items-center justify-between gap-2 bg-mx-orange hover:bg-mx-orange-dark text-white px-6 py-3 text-base font-medium rounded-full transition-colors"
                    >
                      <span>Registrarse</span>
                      <ArrowUpRight size={18} />
                    </motion.div>
                  </Link>
                </SignedOut>
                <SignedIn>
                  <Link 
                    href="/perfil" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-4 px-6 py-3 bg-mx-border/50 hover:bg-mx-orange/10 rounded-full transition-colors"
                  >
                    <UserButton 
                      afterSignOutUrl="/"
                      userProfileMode="navigation"
                      userProfileUrl="/perfil"
                      appearance={{
                        variables: {
                          colorBackground: '#141414',
                          colorText: '#ffffff',
                          colorPrimary: '#f59e0b',
                        },
                        elements: {
                          avatarBox: {
                            width: '48px',
                            height: '48px',
                            border: '2px solid rgba(245, 158, 11, 0.5)',
                          },
                          avatarImage: {
                            width: '100%',
                            height: '100%',
                          },
                          userButtonPopoverCard: {
                            backgroundColor: '#141414',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                          },
                          userButtonPopoverMain: {
                            backgroundColor: '#141414',
                          },
                          userButtonPopoverActions: {
                            backgroundColor: '#141414',
                          },
                          userButtonPopoverActionButton: {
                            color: '#ffffff',
                          },
                          userButtonPopoverActionButtonText: {
                            color: '#ffffff',
                          },
                          userPreview: {
                            backgroundColor: '#141414',
                          },
                          userPreviewMainIdentifier: {
                            color: '#ffffff',
                          },
                          userPreviewSecondaryIdentifier: {
                            color: 'rgba(255, 255, 255, 0.6)',
                          },
                          userButtonPopoverFooter: {
                            display: 'none',
                          },
                        }
                      }}
                    />
                    <span className="text-mx-text font-light">Mi perfil</span>
                  </Link>
                </SignedIn>
              </motion.div>

              {/* Campus Links */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-6 flex flex-col gap-3"
              >
                <span className="text-mx-text-muted text-sm mb-2">Acceder al Campus:</span>
                {CAMPUS_OPTIONS.map((option, index) => (
                  <motion.a
                    key={option.name}
                    href={option.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="flex items-center justify-between gap-2 bg-mx-border/50 hover:bg-mx-border text-mx-text px-6 py-3 text-base font-light rounded-full transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>{option.name}</span>
                    <ArrowUpRight size={18} />
                  </motion.a>
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
