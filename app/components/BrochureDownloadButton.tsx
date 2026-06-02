'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { LeadFormModal, hasLeadCookie, type LeadFormResult } from './LeadFormModal';
import { BrochureConsentModal } from './BrochureConsentModal';
import type { Program } from '@/lib/strapi/types';

interface BrochureDownloadButtonProps {
  program: Program;
}

/**
 * "Descarga el temario (PDF)" button shown under the course description
 * (MF-18). The PDF is gated to capture the visitor in Klaviyo, but the gate
 * adapts to who's asking:
 *
 *   • Anonymous, no cookie → full lead form (Nombre + email + consentimiento)
 *     via LeadFormModal → /api/leads/brochure.
 *   • Signed-in, no cookie → minimal consent-only modal (we already have
 *     their name/email in Clerk); a checked box subscribes them to the
 *     newsletter, and either way the profile + "Temario Descargado" event are
 *     recorded so the campaign can segment them.
 *   • Already a known lead (cookie `mx_lead_captured`, also set by /recursos)
 *     → download straight away.
 */
export function BrochureDownloadButton({ program }: BrochureDownloadButtonProps) {
  const { isSignedIn } = useUser();
  const [formOpen, setFormOpen] = useState(false);
  const [consentOpen, setConsentOpen] = useState(false);
  const brochureUrl = program.brochurePdfUrl;

  if (!brochureUrl) return null;

  const triggerDownload = () => {
    if (typeof window !== 'undefined') {
      window.open(brochureUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleClick = () => {
    // Known lead (left details here or on /recursos) → no gate.
    if (hasLeadCookie()) {
      triggerDownload();
      return;
    }
    // Signed-in → lightweight consent step (no re-asking name/email).
    if (isSignedIn) {
      setConsentOpen(true);
      return;
    }
    // Anonymous → full lead-capture form.
    setFormOpen(true);
  };

  const handleFormSuccess = (result: LeadFormResult) => {
    setFormOpen(false);
    // The endpoint returns the PDF url as externalUrl; fall back to the prop.
    if (typeof window !== 'undefined') {
      window.open(result.externalUrl || brochureUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleConsentConfirmed = () => {
    setConsentOpen(false);
    triggerDownload();
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
        open={formOpen}
        onClose={() => setFormOpen(false)}
        endpoint="/api/leads/brochure"
        consentRequired={false}
        resourceSlug={program.slug}
        resourceTitle={`el temario de ${program.title}`}
        onSuccess={handleFormSuccess}
      />

      <BrochureConsentModal
        open={consentOpen}
        onClose={() => setConsentOpen(false)}
        programSlug={program.slug}
        programTitle={program.title}
        onConfirmed={handleConsentConfirmed}
      />
    </>
  );
}
