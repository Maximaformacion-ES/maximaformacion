'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import type { Logo } from '@/lib/strapi/types';

const FALLBACK_LOGOS: Logo[] = [
  'AEC-LOGO 1.svg',
  'Abbott_Laboratories_logo.svg',
  'Coviran 1.svg',
  'Enac 1.svg',
  'Incarlopsa 1.svg',
  'Itss 1.svg',
  'Logo_RTVE.svg 1.svg',
  'Logotipo_del_CSIC.svg 1.svg',
  'Logotipo_del_Servicio_Andaluz_de_Salud.svg 1.svg',
  'Mapfre_logo.svg 1.svg',
  'Mercamadrid 1.svg',
  'grupotragsa 1.svg',
  'logo-asispa 1.svg',
  'logo_hero_c 1.svg',
].map((file, i) => ({
  id: i,
  companyName: file.replace(/\.svg.*$/, '').replace(/\s*1$/, ''),
  imageUrl: `/logos/${file}`,
}));

interface LogoMarqueeProps {
  logos?: Logo[];
}

function LogoRow({ direction, logos }: { direction: 'left' | 'right'; logos: Logo[] }) {
  const ordered = direction === 'left' ? logos : [...logos].reverse();
  const items = [...ordered, ...ordered, ...ordered, ...ordered];
  const from = direction === 'left' ? 0 : -25;
  const to = direction === 'left' ? -25 : 0;

  return (
    <div className="overflow-hidden relative"
      style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}
    >
      <motion.div
        className="flex items-center gap-12 md:gap-16 w-max"
        animate={{ x: [`${from}%`, `${to}%`] }}
        transition={{ duration: 90, ease: 'linear', repeat: Infinity }}
      >
        {items.map((logo, i) => (
          <div
            key={`${logo.id}-${i}`}
            className="flex-shrink-0 h-8 md:h-10 w-24 md:w-32 relative opacity-80 transition-opacity duration-300 grayscale"
          >
            <Image
              src={logo.imageUrl}
              alt={logo.companyName}
              fill
              className="object-contain"
              sizes="128px"
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export const LogoMarquee: React.FC<LogoMarqueeProps> = ({ logos = [] }) => {
  const displayLogos = logos.length > 0 ? logos : FALLBACK_LOGOS;

  return (
    <section className="pb-24 md:pb-32 2xl:pb-64 2xl:pt-32 overflow-hidden h-[full]">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <p className="text-amber-500 text-sm tracking-[0.5em] uppercase mb-4">
            Partners
          </p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">
            Confían en nosotros
          </h2>
          <div className="w-16 h-px bg-amber-500 mx-auto mb-6" />
          <p className="text-neutral-400 text-base md:text-lg font-light max-w-xl mx-auto">
            Más de 50 empresas e instituciones han elegido nuestra formación para impulsar el talento de sus equipos
          </p>
        </motion.div>
      </div>

      {/* Logo rows */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.3 }}
        className="flex flex-col gap-8 max-w-[1400px] mx-auto"
      >
        <LogoRow direction="right" logos={displayLogos} />
        <LogoRow direction="left" logos={displayLogos} />
      </motion.div>
    </section>
  );
};
