'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { LeadFormModal, hasLeadCookie, type LeadFormResult } from './LeadFormModal';
import type { Program } from '@/lib/strapi/types';

interface BrochureDownloadButtonProps {
  program: Program;
}

/**
 * "Descarga el temario (PDF)" button shown under the course description
 * (MF-18). Instead of downloading directly it gates the PDF behind a
 * lead-capture form (Nombre + email + consentimiento) via the shared
 * LeadFormModal, posting to /api/leads/brochure. Once the visitor has left
 * their details (cookie `mx_lead_captured`, also set by /recursos) the form
 * is skipped and the download fires straight away.
 */
export function BrochureDownloadButton({ program }: BrochureDownloadButtonProps) {
  const [open, setOpen] = useState(false);
  const brochureUrl = program.brochurePdfUrl;

  if (!brochureUrl) return null;

  const triggerDownload = (href: string) => {
    if (typeof window !== 'undefined') {
      window.open(href, '_blank', 'noopener,noreferrer');
    }
  };

  const handleClick = () => {
    // Already a known lead (here or on /recursos) → no need to ask again.
    if (hasLeadCookie()) {
      triggerDownload(brochureUrl);
      return;
    }
    setOpen(true);
  };

  const handleSuccess = (result: LeadFormResult) => {
    setOpen(false);
    triggerDownload(result.externalUrl || brochureUrl);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center gap-2 mb-8 border border-mx-border bg-mx-card/60 backdrop-blur-sm text-mx-text-muted hover:text-mx-orange hover:border-mx-orange/40 px-5 py-2.5 text-body-sm font-medium rounded-lg transition-colors"
      >
        <Download size={16} />
        Descarga el temario (PDF)
      </button>

      <LeadFormModal
        open={open}
        onClose={() => setOpen(false)}
        endpoint="/api/leads/brochure"
        resourceSlug={program.slug}
        resourceTitle={`el temario de ${program.title}`}
        onSuccess={handleSuccess}
      />
    </>
  );
}
