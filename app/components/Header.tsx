'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Menu, X, ChevronDown } from 'lucide-react';
import Link from 'next/link';

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
              className="text-amber-500 text-xl md:text-2xl font-bold tracking-tight"
              whileHover={{ scale: 1.02 }}
            >
              MAXIMA<span className="text-white font-light">FORMACIÓN</span>
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
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-8 flex flex-col gap-3"
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
                    transition={{ delay: 0.7 + index * 0.1 }}
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
