'use client';

import React from 'react';
import { m } from 'framer-motion';
import Image from 'next/image';

interface PartnerLogo {
  url: string;
  alt: string;
}

const DEFAULT_PARTNER_LOGOS: PartnerLogo[] = [];

interface LogoMarqueeProps {
  partnerLogos?: PartnerLogo[];
  overline?: string;
  title?: string;
  description?: string;
}

function LogoRow({ direction, logos }: { direction: 'left' | 'right'; logos: PartnerLogo[] }) {
  const ordered = direction === 'left' ? logos : [...logos].reverse();
  const copies = [0, 1, 2, 3] as const;
  const from = direction === 'left' ? 0 : -25;
  const to = direction === 'left' ? -25 : 0;

  return (
    <div className="overflow-hidden relative"
      style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}
    >
      <m.div
        className="flex items-center gap-8 md:gap-16 w-max"
        animate={{ x: [`${from}%`, `${to}%`] }}
        transition={{ duration: 200, ease: 'linear', repeat: Infinity }}
      >
        {copies.map((copyIndex) =>
          ordered.map((logo, logoIndex) => (
            <div
              key={`${logo.alt}-${logoIndex}-copy${copyIndex}`}
              className="flex-shrink-0 h-8 md:h-16 w-24 md:w-48 relative opacity-50 grayscale hover:grayscale-0 hover:opacity-100 hover:scale-[1.01] transition-all duration-300"
            >
              <Image
                src={logo.url}
                alt={logo.alt}
                fill
                className="object-contain"
                sizes="128px"
              />
            </div>
          ))
        )}
      </m.div>
    </div>
  );
}

export const LogoMarquee: React.FC<LogoMarqueeProps> = ({
  partnerLogos = DEFAULT_PARTNER_LOGOS,
  overline = 'Partners',
  title = 'Confían en nosotros',
  description = 'Más de 50 empresas e instituciones han elegido nuestra formación para impulsar el talento de sus equipos',
}) => {

  return (
    <section className="pb-24 md:pb-32 2xl:pb-64 2xl:pt-32 overflow-hidden h-[full] bg-mx-bg">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-24">
        <m.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <p className="text-mx-orange text-label-sm md:text-label-md xl:text-label-lg tracking-[0.5em] uppercase mb-4">
            {overline}
          </p>
          <h2 className="text-mx-blue text-heading-lg md:text-display-sm font-black tracking-display leading-display mb-6">
            {title}
          </h2>
          <div className="w-16 h-px bg-mx-orange mx-auto mb-6" />
          <p className="text-mx-text-muted text-body-sm md:text-body-md font-light max-w-xl mx-auto">
            {description}
          </p>
        </m.div>
      </div>

      {/* Logo rows */}
      {partnerLogos.length > 0 && (
        <m.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3 }}
          className="flex flex-col gap-8 max-w-[1400px] mx-auto"
        >
          <LogoRow direction="right" logos={partnerLogos} />
          <LogoRow direction="left" logos={partnerLogos} />
        </m.div>
      )}
    </section>
  );
};
