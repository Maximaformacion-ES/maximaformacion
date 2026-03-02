'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

const footerLinks = {
  Campus: [
    { label: 'Catálogo de cursos', href: '#cursos' },
    { label: 'Rutas de aprendizaje', href: '#' },
    { label: 'Labs virtuales', href: '#' },
    { label: 'Comunidad', href: '#' },
    { label: 'Certificaciones', href: '#' },
  ],
  Especialidades: [
    { label: 'Machine Learning', href: '#' },
    { label: 'Bioinformática', href: '#' },
    { label: 'Visión Artificial', href: '#' },
    { label: 'NLP Científico', href: '#' },
    { label: 'IA Farmacéutica', href: '#' },
  ],
};

const maximaLinks = [
  { label: 'Ir a la web', href: '/', external: true },
  { label: 'Másters', href: '/programas' },
  { label: 'Cursos', href: '/programas' },
  { label: 'Contacto', href: '/contacto' },
  { label: 'Blog', href: '/blog' },
];

export const MaxymiaFooter: React.FC = () => {
  return (
    <footer className="bg-[#060918] border-t border-white/10 py-16 md:py-20">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          {/* Brand */}
          <div>
            <Link href="/maxymia" className="inline-block mb-5">
              <Image src="/logo-completo.webp" alt="Maxymia" className="h-10" style={{ width: 'auto' }} width={200} height={40} />
            </Link>
            <p className="text-white/50 text-sm font-light leading-relaxed max-w-[268px]">
              El campus virtual de IA aplicada a ciencias de Máxima Formación. Formación especializada para investigadores y profesionales.
            </p>
            {/* Social links */}
            <div className="flex gap-3 mt-5">
              {[
                { href: 'https://www.linkedin.com/company/maximaformacion/', icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
                { href: 'https://www.instagram.com/maximaformacion/', icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' },
                { href: 'https://www.youtube.com/@maximaformacion', icon: 'M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
              ].map(({ href, icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-white/10 text-white/50 hover:text-mx-orange hover:border-mx-orange/30 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d={icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-5">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-white/60 hover:text-white text-sm font-light transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Máxima Formación Column */}
          <div>
            <h4 className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-5">Máxima Formación</h4>
            <ul className="space-y-3">
              {maximaLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="text-white/60 hover:text-white text-sm font-light transition-colors inline-flex items-center gap-1"
                  >
                    {link.label}
                    {link.external && <ArrowUpRight size={10} className="opacity-60" />}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/30 text-xs">
            &copy; 2025 Maxymia &mdash; Campus Virtual de Máxima Formación. Todos los derechos reservados.
          </p>
          <div className="flex gap-5">
            {['Política de Privacidad', 'Aviso Legal', 'Cookies'].map((text) => (
              <button key={text} type="button" className="text-white/30 hover:text-white/60 text-xs transition-colors">
                {text}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
