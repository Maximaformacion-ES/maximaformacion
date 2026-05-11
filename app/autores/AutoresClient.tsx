'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, User } from 'lucide-react';
import { FontStyles } from '../components/FontStyles';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { StyledTitle } from '../components/StyledTitle';
import type { TeacherProfile } from '@/lib/strapi/types';

interface AutoresClientProps {
  authors: TeacherProfile[];
}

export default function AutoresClient({ authors }: AutoresClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-mx-bg text-mx-text overflow-x-hidden">
      <FontStyles />
      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      <main className="relative z-10">
        <section className="relative pt-28 pb-10 md:pt-36 md:pb-14 px-6 md:px-12">
          <div className="max-w-5xl mx-auto text-center">
            <span className="inline-block text-mx-orange text-label-sm md:text-label-md tracking-[0.3em] uppercase font-medium mb-5">
              Autores
            </span>
            <h1 className="text-mx-blue text-heading-lg md:text-display-sm xl:text-display-md font-black leading-display tracking-display mb-6 text-balance">
              <StyledTitle text="Las {personas} que firman nuestro contenido" color="blue" />
            </h1>
            <p className="text-mx-text-muted text-body-sm md:text-body-md xl:text-body-lg font-light leading-body max-w-3xl mx-auto text-balance">
              Colaboradores, alumni y profesionales del sector que han firmado artículos,
              recursos y trabajos publicados en Máxima Formación.
            </p>
          </div>
        </section>

        <section className="px-6 md:px-12 pb-20 md:pb-24">
          <div className="max-w-6xl mx-auto">
            {authors.length === 0 ? (
              <p className="text-center text-mx-text-muted text-body-md">
                Pronto publicaremos los perfiles de nuestros autores.
              </p>
            ) : (
              <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                {authors.map((a) => (
                  <li key={a.documentId}>
                    <Link
                      href={`/autores/${a.slug}`}
                      className="group flex items-center gap-4 bg-mx-card border border-mx-border rounded-xl p-4 hover:border-mx-orange/40 hover:shadow-md transition-all duration-300"
                    >
                      <div className="w-14 h-14 rounded-full bg-mx-bg border border-mx-border overflow-hidden shrink-0 flex items-center justify-center">
                        {a.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={a.avatarUrl}
                            alt={a.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <User size={20} className="text-mx-text-muted" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-mx-text text-body-md font-bold truncate group-hover:text-mx-orange transition-colors">
                          {a.name}
                        </p>
                        <p className="text-mx-text-muted text-label-md font-light truncate">
                          {a.role}
                        </p>
                      </div>
                      <ArrowUpRight size={16} className="text-mx-text-muted group-hover:text-mx-orange transition-colors shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
