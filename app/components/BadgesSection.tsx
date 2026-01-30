'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import type { Badge } from '@/lib/strapi/types';

const FALLBACK_BADGES: Badge[] = [
  { id: 1, name: 'ISO 9001:2015 – Quality Management Certified', imageUrl: '/parches/ISO 9001.png' },
  { id: 2, name: 'ISO 14001 – Environmental Management Certified', imageUrl: '/parches/ISO 14001.png' },
  { id: 3, name: 'ISO 27001 – Information Security Certified', imageUrl: '/parches/ISO 27001.png' },
  { id: 4, name: 'Cum Laude Emagister 2018–2025', imageUrl: '/parches/cum_laude_emagister_2018_2025.png' },
  { id: 5, name: 'Google Reviews – 5.0 de 120 reseñas', imageUrl: '/parches/parche_reseñas_google.png' },
];

// 7 columns × 5 rows. Each row is offset by half a cell to create a brick pattern.
// The 5 colored badges sit in the visual center (row 2 center cluster).
const COLS = 7;
const ROWS = 4;

// Each row shuffled independently so badges are interleaved.
// Center colored cells are designed so each has a unique badge type.
const ROW_ORDERS = [
  [3, 0, 4, 1, 2, 3, 1],
  [1, 4, 2, 0, 3, 2, 4],  // col 2 → badge 2 (ISO 27001), col 3 → badge 0 (ISO 9001)
  [4, 2, 3, 4, 1, 0, 2],  // col 1 → badge 2 (ISO 27001), col 2 → badge 3 (Cum Laude), col 3 → badge 4 (Google)
  [0, 3, 1, 4, 2, 1, 3],
];

// Colored cell positions: (row, col) — one per badge type, clustered at center.
//   1-2 → badge 2 (ISO 27001)
//   1-3 → badge 0 (ISO 9001)
//   2-2 → badge 3 (Cum Laude)
//   2-3 → badge 4 (Google — right of Cum Laude)
//   2-4 → badge 1 (ISO 14001)
const COLORED_SET = new Set([
  '1-2',
  '1-3',
  '2-2',
  '2-3',
  '2-4',
]);

// Map: "row-col" → true if that specific badge index at that cell should be colored
// We mark the cell colored only if the badge there hasn't been colored yet.
function buildRows(badges: Badge[]) {
  const usedBadges = new Set<number>();
  const rows: { badge: Badge; colored: boolean }[][] = [];

  for (let r = 0; r < ROWS; r++) {
    const row: { badge: Badge; colored: boolean }[] = [];
    for (let c = 0; c < COLS; c++) {
      const badgeIdx = ROW_ORDERS[r][c] % badges.length;
      const badge = badges[badgeIdx];
      const key = `${r}-${c}`;
      const colored = COLORED_SET.has(key) && !usedBadges.has(badgeIdx);
      if (colored) usedBadges.add(badgeIdx);
      row.push({ badge, colored });
    }
    rows.push(row);
  }
  return rows;
}

interface BadgesSectionProps {
  badges?: Badge[];
}

export const BadgesSection: React.FC<BadgesSectionProps> = ({ badges: badgesProp }) => {
  const badges = badgesProp && badgesProp.length > 0 ? badgesProp : FALLBACK_BADGES;
  const rows = buildRows(badges);

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background accent – mirrored from testimonials */}
      <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-amber-500/5 to-transparent" />

      <div className="max-w-[1800px] mx-auto px-6 md:px-12 relative">
        <div className="flex flex-col-reverse md:flex-row gap-12 items-center">
          {/* Left side (desktop) / Bottom (mobile) – Badge mosaic */}
          <div className="relative md:w-3/5 w-full">
            {/* Brick-pattern mosaic with radial fade on edges */}
            <div
              style={{
                maskImage:
                  'radial-gradient(ellipse 60% 55% at 50% 50%, black 20%, transparent 80%)',
                WebkitMaskImage:
                  'radial-gradient(ellipse 60% 58% at 50% 50%, black 20%, transparent 80%)',
              }}
            >
              <div className="flex flex-col gap-2 md:gap-3 -mx-8">
                {rows.map((row, r) => {
                  const slideFrom = r % 2 === 0 ? -40 : 40;
                  return (
                  <motion.div
                    key={r}
                    initial={{ opacity: 0, x: slideFrom }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.1 * r }}
                    className="flex gap-2 md:gap-3 justify-center"
                    style={r % 2 === 1 ? { paddingLeft: 'calc(100% / 7 / 2)' } : undefined}
                  >
                    {row.map((cell, c) => (
                      <div
                        key={`${r}-${c}`}
                        className={`relative flex-shrink-0 aspect-square rounded-xl overflow-hidden transition-all duration-500 ${
                          cell.colored
                            ? 'opacity-100 w-[16%] -m-[0%] z-10'
                            : 'opacity-30 grayscale w-[13%]'
                        }`}
                      >
                        <Image
                          src={cell.badge.imageUrl}
                          alt={cell.badge.name}
                          fill
                          unoptimized={cell.badge.imageUrl.includes('localhost')}
                          className="object-contain p-2"
                          sizes="(max-width: 768px) 20vw, (max-width: 1200px) 13vw, 10vw"
                        />
                      </div>
                    ))}
                  </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right side (desktop) / Top (mobile) – Text */}
          <div className="md:w-2/5 w-full text-center md:text-left">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-amber-400 text-sm tracking-[0.3em] uppercase mb-4"
            >
              Certificaciones y reconocimientos
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-white text-4xl md:text-6xl font-black tracking-tight mb-8"
            >
              CALIDAD<br />
              <span className="text-stroke">ACREDITADA</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-neutral-400 text-base md:text-lg font-light max-w-md leading-relaxed"
            >
              Contamos con certificaciones ISO 9001, ISO 14001 e ISO 27001, el sello Cum Laude de Emagister desde 2018 y una valoración de 5.0 en Google con más de 120 reseñas.
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
};
