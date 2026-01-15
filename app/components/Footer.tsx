'use client';

import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';

export const Footer: React.FC = () => {
  const footerLinks = {
    Programas: ['Másters', 'Cursos', 'Bootcamps', 'Empresas'],
    Recursos: ['Blog', 'Webinars', 'Ebooks', 'Podcast'],
    Empresa: ['Sobre nosotros', 'Equipo', 'Carreras', 'Prensa'],
    Legal: ['Privacidad', 'Términos', 'Cookies', 'Contacto'],
  };
  
  return (
    <footer className="bg-[#0a0a0a] border-t border-white/10 py-16 md:py-24">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="/" className="inline-block">
              <Image 
                src="/logo.png" 
                alt="Maxima Formación" 
                width={200} 
                height={66}
                className="h-10 md:h-12 w-auto"
              />
            </a>
            <p className="text-white/50 text-sm font-light mt-4 max-w-xs leading-relaxed">
              Formación profesional de élite para impulsar tu carrera al siguiente nivel.
            </p>
            
            {/* Social links */}
            <div className="flex gap-4 mt-6">
              {['LinkedIn', 'Twitter', 'Instagram', 'YouTube'].map((social) => (
                <a
                  key={social}
                  href={`#${social.toLowerCase()}`}
                  className="text-white/40 hover:text-white text-sm transition-colors"
                >
                  {social.charAt(0)}
                </a>
              ))}
            </div>
          </div>
          
          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-white font-bold mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href={`#${link.toLowerCase()}`}
                      className="text-white/50 hover:text-white text-sm font-light transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Bottom */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-sm">
            © 2026 Maximaformación. Todos los derechos reservados.
          </p>
          <p className="text-white/40 text-sm">
            Diseñado con pasión en España 🇪🇸
          </p>
        </div>
      </div>
    </footer>
  );
};
