'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FontStyles } from '../../components/FontStyles';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { ResourceHeroSection } from '../../components/ResourceHeroSection';
import { ResourceContent } from '../../components/ResourceContent';
import { ResourceRelatedClient } from '../../components/ResourceRelatedClient';
import type { Resource } from '@/lib/strapi/types';

interface RecursoDetailClientProps {
  resource: Resource | null;
  bodyHtml: string;
  relatedResources: Resource[];
}

export default function RecursoDetailClient({
  resource,
  bodyHtml,
  relatedResources,
}: RecursoDetailClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!resource) {
    return (
      <div className="bg-mx-bg min-h-screen text-mx-text selection:bg-mx-orange/30 overflow-x-hidden">
        <FontStyles />

        <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

        <main className="relative z-10 flex items-center justify-center min-h-screen px-6">
          <div className="text-center max-w-2xl">
            <h1 className="text-display-sm md:text-display-md font-black text-mx-blue mb-6">
              404
            </h1>
            <h2 className="text-heading-sm md:text-heading-md xl:text-heading-lg font-bold text-mx-text mb-4">
              Recurso no encontrado
            </h2>
            <p className="text-body-sm md:text-body-md text-mx-text-muted mb-8 font-light">
              El recurso que buscas no existe o ha sido eliminado.
            </p>
            <Link
              href="/recursos"
              className="inline-flex items-center gap-3 bg-mx-orange text-white px-8 py-4 text-label-sm md:text-label-md font-medium rounded-full hover:bg-mx-orange-dark transition-colors duration-300"
            >
              Ver todos los recursos
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-mx-bg min-h-screen text-mx-text selection:bg-mx-orange/30 overflow-x-clip">
      <FontStyles />

      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      <main className="relative z-10">
        <ResourceHeroSection resource={resource} />
        <ResourceContent resource={resource} bodyHtml={bodyHtml} />
        <ResourceRelatedClient resources={relatedResources} />
      </main>

      <Footer />
    </div>
  );
}
