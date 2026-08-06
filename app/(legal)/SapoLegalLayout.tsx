'use client';

import React, { useState } from 'react';
import { FontStyles } from '../components/FontStyles';
import { MarketingHeader as Header } from '../components/MarketingHeader';
import { Footer } from '../components/Footer';

interface SapoLegalLayoutProps {
  title: string;
  bodyHtml: string;
}

// Layout for the SAPO legal documents (owned by Biomáxima, in English). It
// uses the standard Máxima Formación site chrome (Header + Footer) but drops
// the cross-linked legal footer of LegalLayout, since those links point to
// Máxima's Spanish legal docs and don't apply to SAPO. These pages exist to be
// referenced from the SAPO mobile app; each document carries its own contact
// section in the body.
export default function SapoLegalLayout({ title, bodyHtml }: SapoLegalLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-mx-bg text-mx-text overflow-x-hidden">
      <FontStyles />
      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      <main className="relative z-10 pt-32 md:pt-40 pb-20 px-6 md:px-12">
        <article className="max-w-3xl mx-auto">
          <header className="mb-10 md:mb-14 border-b border-mx-border pb-8">
            <p className="text-mx-orange text-label-sm md:text-label-md tracking-[0.3em] uppercase font-medium mb-4">
              SAPO
            </p>
            <h1 className="text-mx-blue text-heading-lg md:text-display-sm font-black leading-display tracking-display text-balance">
              {title}
            </h1>
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
            .legal-body hr { border: 0; border-top: 1px solid var(--color-mx-border); margin: 2.5em 0; }
          `}</style>

          <div className="legal-body" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
        </article>
      </main>

      <Footer />
    </div>
  );
}
