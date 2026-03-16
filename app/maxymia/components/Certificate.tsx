'use client';

import React, { useRef } from 'react';
import { Download, Award } from 'lucide-react';
import type { Locale } from '../types';

interface CertificateProps {
  studentName: string;
  courseTitle: string;
  instructor: string;
  completedAt: string;
  locale: Locale;
}

export default function Certificate({
  studentName,
  courseTitle,
  instructor,
  completedAt,
  locale,
}: CertificateProps) {
  const certRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const date = new Date(completedAt).toLocaleDateString(
    locale === 'es' ? 'es-ES' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  return (
    <div>
      {/* Print button */}
      <div className="flex justify-end mb-4 print:hidden">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-mx-orange text-white px-4 py-2 rounded-lg text-body-sm font-medium hover:bg-mx-orange-dark transition-colors"
        >
          <Download size={16} />
          {locale === 'es' ? 'Imprimir / Descargar PDF' : 'Print / Download PDF'}
        </button>
      </div>

      {/* Certificate */}
      <div
        ref={certRef}
        className="bg-white rounded-2xl p-12 md:p-16 border-2 border-[#F7A000] relative overflow-hidden print:border-4 print:rounded-none"
      >
        {/* Decorative corners */}
        <div className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 border-[#F7A000]/40" />
        <div className="absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 border-[#F7A000]/40" />
        <div className="absolute bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 border-[#F7A000]/40" />
        <div className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 border-[#F7A000]/40" />

        <div className="text-center">
          {/* Logo / Brand */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <Award className="text-[#F7A000]" size={32} />
            <span className="text-[#060918] text-heading-sm font-bold tracking-wide">MAXYMIA</span>
          </div>

          {/* Title */}
          <h1 className="text-[#060918] text-heading-lg md:text-display-sm font-bold mb-2">
            {locale === 'es' ? 'Certificado de Finalización' : 'Certificate of Completion'}
          </h1>
          <div className="w-24 h-0.5 bg-[#F7A000] mx-auto mb-8" />

          {/* Body */}
          <p className="text-[#666] text-body-lg mb-2">
            {locale === 'es' ? 'Se certifica que' : 'This certifies that'}
          </p>
          <p className="text-[#060918] text-heading-lg font-bold mb-6 font-serif italic">
            {studentName}
          </p>
          <p className="text-[#666] text-body-lg mb-2">
            {locale === 'es'
              ? 'ha completado satisfactoriamente el curso'
              : 'has successfully completed the course'}
          </p>
          <p className="text-[#060918] text-heading-md font-semibold mb-8">
            {courseTitle}
          </p>

          {/* Date and instructor */}
          <div className="flex justify-center gap-16 mt-12">
            <div className="text-center">
              <div className="w-32 border-b border-[#333] mb-2" />
              <p className="text-[#666] text-body-sm">{date}</p>
              <p className="text-[#999] text-label-md">
                {locale === 'es' ? 'Fecha' : 'Date'}
              </p>
            </div>
            <div className="text-center">
              <div className="w-32 border-b border-[#333] mb-2" />
              <p className="text-[#666] text-body-sm">{instructor}</p>
              <p className="text-[#999] text-label-md">
                {locale === 'es' ? 'Instructor' : 'Instructor'}
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-[#ccc] text-label-md mt-12">
            Campus de IA Aplicada a Ciencias — maxymia.com
          </p>
        </div>
      </div>
    </div>
  );
}
