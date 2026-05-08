'use client';

import React, { useRef } from 'react';
import { Download, Linkedin } from 'lucide-react';
import { useSiteBranding } from '@/app/components/SiteBrandingProvider';
import type { Locale } from '../types';

interface CertificateProps {
  studentName: string;
  courseTitle: string;
  instructor: string;
  completedAt: string;
  locale: Locale;
  certificateUrl?: string;
  certificateId?: string;
}

const LINKEDIN_ORG_ID = process.env.NEXT_PUBLIC_LINKEDIN_ORG_ID;

export default function Certificate({
  studentName,
  courseTitle,
  instructor,
  completedAt,
  locale,
  certificateUrl,
  certificateId,
}: CertificateProps) {
  const certRef = useRef<HTMLDivElement>(null);
  const { logoMaximaformacion, logoMaxymia } = useSiteBranding();

  const handlePrint = () => {
    window.print();
  };

  const completedDate = new Date(completedAt);
  const date = completedDate.toLocaleDateString(
    locale === 'es' ? 'es-ES' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  const linkedInShareUrl = LINKEDIN_ORG_ID
    ? (() => {
        const params = new URLSearchParams({
          startTask: 'CERTIFICATION_NAME',
          name: courseTitle,
          organizationId: LINKEDIN_ORG_ID,
          issueYear: String(completedDate.getFullYear()),
          issueMonth: String(completedDate.getMonth() + 1),
        });
        if (certificateUrl) params.set('certUrl', certificateUrl);
        if (certificateId) params.set('certId', certificateId);
        return `https://www.linkedin.com/profile/add?${params.toString()}`;
      })()
    : null;

  return (
    <div>
      {/* Action buttons */}
      <div className="flex flex-wrap justify-end gap-2 mb-4 print:hidden">
        {linkedInShareUrl && (
          <a
            href={linkedInShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#0A66C2] text-white px-4 py-2 rounded-lg text-body-sm font-medium hover:bg-[#004182] transition-colors"
          >
            <Linkedin size={16} />
            {locale === 'es' ? 'Añadir a LinkedIn' : 'Add to LinkedIn'}
          </a>
        )}
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-mx-orange text-white px-4 py-2 rounded-lg text-body-sm font-medium hover:bg-mx-orange-dark transition-colors"
        >
          <Download size={16} />
          {locale === 'es' ? 'Imprimir / Descargar PDF' : 'Print / Download PDF'}
        </button>
      </div>

      {/* Print rules: force A4 landscape and isolate the certificate portal */}
      <style>{`
        @media print {
          @page { size: 297mm 210mm; margin: 0; }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          /* Remove every body child from layout */
          body > * {
            display: none !important;
          }
          /* Re-enable only the certificate portal */
          body > [data-cert-portal] {
            display: block !important;
            position: static !important;
            inset: auto !important;
            width: 297mm !important;
            height: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            backdrop-filter: none !important;
            overflow: visible !important;
            z-index: auto !important;
            transform: none !important;
            opacity: 1 !important;
          }
          /* Reset framer-motion inner wrapper */
          body > [data-cert-portal] > * {
            display: block !important;
            width: 100% !important;
            height: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            transform: none !important;
            opacity: 1 !important;
          }
          /* Hide UI controls (close button, download/share) inside the portal */
          body > [data-cert-portal] button,
          body > [data-cert-portal] a {
            display: none !important;
          }
          /* The certificate itself = the printable area */
          body > [data-cert-portal] .certificate-print {
            display: flex !important;
            width: 297mm !important;
            height: 210mm !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            overflow: hidden !important;
            page-break-before: avoid !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      {/* Certificate — fixed A4 landscape aspect ratio. Container queries
          let inner content scale proportionally regardless of render size. */}
      <div
        ref={certRef}
        className="certificate-print bg-white rounded-2xl border-2 border-[#F7A000] relative overflow-hidden aspect-[297/210] w-full px-[6cqw] py-[5cqw] flex flex-col justify-center [container-type:inline-size]"
      >
        {/* Decorative corners */}
        <div className="absolute top-[2cqw] left-[2cqw] w-[5cqw] h-[5cqw] border-t-2 border-l-2 border-[#F7A000]/40" />
        <div className="absolute top-[2cqw] right-[2cqw] w-[5cqw] h-[5cqw] border-t-2 border-r-2 border-[#F7A000]/40" />
        <div className="absolute bottom-[2cqw] left-[2cqw] w-[5cqw] h-[5cqw] border-b-2 border-l-2 border-[#F7A000]/40" />
        <div className="absolute bottom-[2cqw] right-[2cqw] w-[5cqw] h-[5cqw] border-b-2 border-r-2 border-[#F7A000]/40" />

        <div className="text-center w-full">
          {/* Logos */}
          <div className="flex items-center justify-center gap-[3cqw] mb-[2.5cqw]">
            {logoMaximaformacion && (
              <img
                src={logoMaximaformacion}
                alt="Máxima Formación"
                className="h-[6cqw] w-auto object-contain"
              />
            )}
            {logoMaximaformacion && logoMaxymia && (
              <span className="block w-px h-[5cqw] bg-[#F7A000]/40" aria-hidden="true" />
            )}
            {logoMaxymia && (
              <img
                src={logoMaxymia}
                alt="Maxymia"
                className="h-[6cqw] w-auto object-contain"
                style={{ filter: 'brightness(0)' }}
              />
            )}
          </div>

          {/* Title */}
          <h1 className="text-[#060918] text-[5cqw] font-bold leading-tight mb-[0.5cqw]">
            {locale === 'es' ? 'Certificado de Finalización' : 'Certificate of Completion'}
          </h1>
          <div className="w-[8cqw] h-[0.3cqw] bg-[#F7A000] mx-auto mb-[2.5cqw]" />

          {/* Body */}
          <p className="text-[#666] text-[2cqw] mb-[0.5cqw]">
            {locale === 'es' ? 'Se certifica que' : 'This certifies that'}
          </p>
          <p className="text-[#060918] text-[4.5cqw] font-bold mb-[1.5cqw] font-serif italic leading-tight">
            {studentName}
          </p>
          <p className="text-[#666] text-[2cqw] mb-[0.5cqw]">
            {locale === 'es'
              ? 'ha completado satisfactoriamente el curso'
              : 'has successfully completed the course'}
          </p>

          {/* Course title with chevrons */}
          <div className="relative flex items-center justify-center mb-[3cqw]">
            <img
              src="/iconBlue.svg"
              alt=""
              aria-hidden="true"
              className="absolute left-[2cqw] w-[5cqw] h-auto"
            />
            <p className="text-[#060918] text-[3.2cqw] font-semibold px-[10cqw] leading-tight">
              {courseTitle}
            </p>
            <img
              src="/iconOrange.svg"
              alt=""
              aria-hidden="true"
              className="absolute right-[2cqw] w-[5cqw] h-auto"
            />
          </div>

          {/* Date and instructor */}
          <div className="flex justify-center gap-[8cqw] mt-[2cqw]">
            <div className="text-center">
              <div className="w-[18cqw] border-b border-[#333] mb-[0.8cqw]" />
              <p className="text-[#666] text-[1.6cqw]">{date}</p>
              <p className="text-[#999] text-[1.2cqw]">
                {locale === 'es' ? 'Fecha' : 'Date'}
              </p>
            </div>
            <div className="text-center">
              <div className="w-[18cqw] border-b border-[#333] mb-[0.8cqw]" />
              <p className="text-[#666] text-[1.6cqw]">{instructor}</p>
              <p className="text-[#999] text-[1.2cqw]">
                {locale === 'es' ? 'Instructor' : 'Instructor'}
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-[#999] text-[1.2cqw] mt-[3cqw]">
            Campus de IA Aplicada a Ciencias — maxymia.com
          </p>
        </div>
      </div>
    </div>
  );
}
