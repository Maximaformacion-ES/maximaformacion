'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FontStyles } from '../components/FontStyles';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

interface LegalLayoutProps {
  title: string;
  lastUpdated?: string;
  bodyHtml: string;
}

export default function LegalLayout({ title, lastUpdated, bodyHtml }: LegalLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-mx-bg text-mx-text overflow-x-hidden">
      <FontStyles />
      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      <main className="relative z-10 pt-32 md:pt-40 pb-20 px-6 md:px-12">
        <article className="max-w-3xl mx-auto">
          <header className="mb-10 md:mb-14 border-b border-mx-border pb-8">
            <p className="text-mx-orange text-label-sm md:text-label-md tracking-[0.3em] uppercase font-medium mb-4">
              Legal
            </p>
            <h1 className="text-mx-blue text-heading-lg md:text-display-sm font-black leading-display tracking-display mb-4 text-balance">
              {title}
            </h1>
            {lastUpdated && (
              <p className="text-mx-text-muted text-body-sm font-light">
                Última actualización: {lastUpdated}
              </p>
            )}
          </header>

          <style>{`
            .legal-body { color: var(--color-mx-text); font-size: var(--text-body-sm); line-height: 1.75; }
            @media (min-width: 768px) { .legal-body { font-size: var(--text-body-md); } }
            .legal-body p { margin: 0 0 1.1em; }
            .legal-body h2 { font-size: var(--text-heading-sm); font-weight: 700; color: var(--color-mx-blue); margin: 2.2em 0 1em; line-height: 1.3; }
            .legal-body h3 { font-size: var(--text-body-lg); font-weight: 700; color: var(--color-mx-text); margin: 1.8em 0 0.8em; line-height: 1.35; }
            .legal-body strong { color: var(--color-mx-text); font-weight: 700; }
            .legal-body ul, .legal-body ol { padding-left: 1.5em; margin: 0 0 1.2em; }
            .legal-body li { margin: 0.4em 0; }
            .legal-body a { color: var(--color-mx-orange); text-decoration: underline; }
            .legal-body a:hover { color: var(--color-mx-orange-dark); }
            .legal-body table { width: 100%; border-collapse: collapse; margin: 1.4em 0; font-size: var(--text-body-sm); }
            .legal-body th, .legal-body td { border: 1px solid var(--color-mx-border); padding: 0.65em 0.85em; text-align: left; vertical-align: top; }
            .legal-body th { background: rgba(247,160,0,0.05); font-weight: 600; }
            .legal-body hr { border: 0; border-top: 1px solid var(--color-mx-border); margin: 2.5em 0; }
          `}</style>

          <div className="legal-body" dangerouslySetInnerHTML={{ __html: bodyHtml }} />

          <footer className="mt-16 pt-8 border-t border-mx-border text-mx-text-muted text-body-sm font-light">
            <p>
              Si tienes dudas sobre este documento, contacta con nosotros en{' '}
              <a href="mailto:info@maximaformacion.es" className="text-mx-orange hover:text-mx-orange-dark underline">
                info@maximaformacion.es
              </a>{' '}
              o consulta el resto de documentos legales:
            </p>
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
              <li>
                <Link href="/politica-de-privacidad" className="text-mx-orange hover:text-mx-orange-dark underline">
                  Política de privacidad
                </Link>
              </li>
              <li>
                <Link href="/aviso-legal" className="text-mx-orange hover:text-mx-orange-dark underline">
                  Aviso legal
                </Link>
              </li>
              <li>
                <Link href="/politica-de-cookies" className="text-mx-orange hover:text-mx-orange-dark underline">
                  Política de cookies
                </Link>
              </li>
            </ul>
          </footer>
        </article>
      </main>

      <Footer />
    </div>
  );
}
