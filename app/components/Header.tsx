'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (value: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ isMenuOpen, setIsMenuOpen }) => {
  const navItems = ['Conócenos', 'Másters', 'Cursos', 'Opiniones', 'Blog', 'Recursos', 'Contacto'];
  
  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 mix-blend-difference"
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
              {navItems.map((item) => {
                let href = `/#${item.toLowerCase()}`;
                if (item === 'Contacto') href = '/contacto';
                if (item === 'Conócenos') href = '/conocenos';
                if (item === 'Cursos') href = '/cursos';
                return (
                  <Link
                    key={item}
                    href={href}
                    className="text-white text-sm font-light tracking-wide relative group hover:text-amber-500 transition-colors duration-300"
                  >
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-amber-500 group-hover:w-full transition-all duration-300" />
                  </Link>
                );
              })}
            </div>
            
            <div className="flex items-center gap-4">
              <motion.a
                href="#campus"
                className="hidden md:flex items-center gap-2 bg-white text-black px-5 py-2.5 text-sm font-medium rounded-full hover:bg-amber-500 hover:text-white transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                Campus <ArrowUpRight size={14} />
              </motion.a>
              
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
              {navItems.map((item, i) => {
                let href = `/#${item.toLowerCase()}`;
                if (item === 'Contacto') href = '/contacto';
                if (item === 'Conócenos') href = '/conocenos';
                if (item === 'Cursos') href = '/cursos';
                return (
                  <Link
                    key={item}
                    href={href}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-white text-3xl font-light"
                  >
                    <motion.span
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      {item}
                    </motion.span>
                  </Link>
                );
              })}
              <motion.a
                href="#campus"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-8 flex items-center justify-center gap-2 bg-white text-black px-8 py-4 text-lg font-medium rounded-full w-fit"
              >
                Acceder al Campus <ArrowUpRight size={18} />
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
