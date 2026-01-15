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
];

const CAMPUS_OPTIONS = [
  { name: 'E-Learning', url: 'https://maximaformacion.com.es/' },
  { name: 'Data Science', url: 'https://www.maximacampus.es/' },
  { name: 'Maxymia', url: 'https://maxymia.com/' },
];

export const Header: React.FC<HeaderProps> = ({ isMenuOpen, setIsMenuOpen }) => {
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
        className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-white/10"
      >
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 py-6">
          <div className="flex items-center justify-between">
            <motion.a 
              href="/" 
              className="flex items-center"
              whileHover={{ scale: 1.02 }}
            >
              <Image 
                src="/logo.png" 
                alt="Maxima Formación" 
                width={200} 
                height={80}
                className="h-12 md:h-14 w-auto"
                priority
              />
            </motion.a>
            
            <div className="hidden lg:flex items-center gap-8">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  className="text-white text-sm font-light tracking-wide relative group hover:text-amber-500 transition-colors duration-300"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-amber-500 group-hover:w-full transition-all duration-300" />
                </Link>
              ))}
            </div>
            
            <div className="flex items-center gap-4">
              {/* Auth Buttons */}
              <SignedOut>
                <div className="hidden md:flex items-center gap-3">
                  <Link href="/sign-in">
                    <motion.button
                      className="flex items-center gap-2 border border-white/30 text-white px-4 py-2 text-sm font-medium rounded-full hover:border-amber-500 hover:text-amber-500 hover:bg-white/5 transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <User size={16} />
                      Iniciar sesión
                    </motion.button>
                  </Link>
                  <Link href="/sign-up">
                    <motion.button
                      className="flex items-center gap-2 bg-amber-500 text-black px-4 py-2 text-sm font-medium rounded-full hover:bg-amber-400 transition-colors duration-300"
                      whileHover={{ scale: 1.05 }}
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
                    <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-500 px-4 py-2 text-sm font-bold rounded-full">
                      <Crown size={14} />
                      Pro
                      <Check size={14} />
                    </div>
                  ) : (
                    <Link href="/pricing">
                      <motion.button
                        className="flex items-center gap-2 bg-linear-to-r from-amber-500 to-amber-600 text-black px-4 py-2 text-sm font-bold rounded-full hover:from-amber-400 hover:to-amber-500 transition-all duration-300 shadow-lg shadow-amber-500/20"
                        whileHover={{ scale: 1.05 }}
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
                  className="flex items-center gap-2 bg-white text-black px-5 py-2.5 text-sm font-medium rounded-full hover:bg-amber-500 hover:text-white transition-colors duration-300"
                  whileHover={{ scale: 1.05 }}
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
                      className="absolute right-0 mt-2 w-48 bg-black border border-white/10 rounded-lg overflow-hidden shadow-xl"
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
                          className="block px-4 py-3 text-white text-sm font-light hover:bg-white/10 hover:text-amber-500 transition-colors duration-200 border-b border-white/5 last:border-b-0"
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
                className="lg:hidden text-white p-2"
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
            className="fixed inset-0 z-40 bg-black pt-24 px-6"
          >
            <div className="flex flex-col gap-6">
              {NAV_ITEMS.map((item, i) => (
                <Link
                  key={item.name}
                  href={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-white text-3xl font-light"
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
                <span className="text-white/60 text-sm mb-2">Mi cuenta:</span>
                <SignedOut>
                  <Link href="/sign-in" onClick={() => setIsMenuOpen(false)}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.65 }}
                      className="flex items-center justify-between gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 text-base font-light rounded-full transition-colors"
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
                      className="flex items-center justify-between gap-2 bg-amber-500 hover:bg-amber-400 text-black px-6 py-3 text-base font-medium rounded-full transition-colors"
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
                    className="flex items-center gap-4 px-6 py-3 bg-white/10 hover:bg-amber-500/10 rounded-full transition-colors"
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
                    <span className="text-white font-light">Mi perfil</span>
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
                <span className="text-white/60 text-sm mb-2">Acceder al Campus:</span>
                {CAMPUS_OPTIONS.map((option, index) => (
                  <motion.a
                    key={option.name}
                    href={option.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="flex items-center justify-between gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 text-base font-light rounded-full transition-colors"
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
