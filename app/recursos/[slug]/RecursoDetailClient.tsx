'use client';

import React, { useCallback, useState } from 'react';
import Link from 'next/link';
import { FontStyles } from '../../components/FontStyles';
import { MarketingHeader as Header } from '../../components/MarketingHeader';
import { Footer } from '../../components/Footer';
import { ResourceHeroSection } from '../../components/ResourceHeroSection';
import { ResourceContent } from '../../components/ResourceContent';
import { ResourceRelatedClient } from '../../components/ResourceRelatedClient';
import { LeadFormModal, hasLeadCookie, type LeadFormResult } from '../../components/LeadFormModal';
import { Breadcrumb } from '../../components/Breadcrumb';
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
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingDownload, setPendingDownload] = useState<{ url: string; filename: string } | null>(null);

  const triggerDownload = useCallback((url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.rel = 'noopener noreferrer';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, []);

  const handleDownloadClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, url: string, filename: string) => {
      if (hasLeadCookie()) return;
      e.preventDefault();
      setPendingDownload({ url, filename });
      setModalOpen(true);
    },
    [],
  );

  const handleLeadSuccess = useCallback(
    (result: LeadFormResult) => {
      setModalOpen(false);
      const target =
        pendingDownload ??
        (result.downloads[0]
          ? { url: result.downloads[0].url, filename: result.downloads[0].name }
          : result.externalUrl
            ? { url: result.externalUrl, filename: resource?.title ?? 'recurso' }
            : null);
      if (target) triggerDownload(target.url, target.filename);
      setPendingDownload(null);
    },
    [pendingDownload, resource?.title, triggerDownload],
  );

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
        <Breadcrumb
          items={[
            { label: 'Recursos', href: '/recursos' },
            { label: resource.title },
          ]}
        />
        <ResourceHeroSection resource={resource} onDownloadClick={handleDownloadClick} compactTop />
        <ResourceContent resource={resource} bodyHtml={bodyHtml} onDownloadClick={handleDownloadClick} />
        <ResourceRelatedClient resources={relatedResources} />
      </main>

      <Footer />

      <LeadFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        resourceSlug={resource.slug}
        resourceTitle={resource.title}
        onSuccess={handleLeadSuccess}
      />
    </div>
  );
}
