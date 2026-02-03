"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import type { Badge, BadgeImportance } from "@/lib/strapi/types";
import Image from "next/image";
import { renderStyledTitle } from "./StyledTitle";

const COLS = 7;
const ROWS = 5;

const IMPORTANCE_ORDER: Record<BadgeImportance, number> = {
  Highest: 0,
  Medium: 1,
  Low: 2,
};

/**
 * Build a ROWS × COLS grid ensuring every badge appears at least once.
 * Badges are sorted by importance so Highest end up in the most central
 * cells and Low on the edges. Remaining cells are filled cycling.
 */
function buildRows(badges: Badge[]): Badge[][] {
  const n = badges.length;
  const total = ROWS * COLS;

  // Sort badges by importance: Highest first → they get the central cells
  const sorted = [...badges].sort(
    (a, b) => IMPORTANCE_ORDER[a.importance] - IMPORTANCE_ORDER[b.importance]
  );

  // All cells sorted by distance to grid center (central cells first)
  const cx = (COLS - 1) / 2;
  const cy = (ROWS - 1) / 2;
  const cells = Array.from({ length: total }, (_, i) => ({
    r: Math.floor(i / COLS),
    c: i % COLS,
  })).sort((a, b) => {
    const da = ((a.c - cx) / cx) ** 2 + ((a.r - cy) / cy) ** 2;
    const db = ((b.c - cx) / cx) ** 2 + ((b.r - cy) / cy) ** 2;
    return da - db;
  });

  const grid: number[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

  // Place each unique badge once: Highest → most central cell
  for (let i = 0; i < Math.min(n, total); i++) {
    grid[cells[i].r][cells[i].c] = i;
  }

  // Fill remaining cells picking the badge whose nearest copy is farthest away
  for (let i = n; i < total; i++) {
    const { r, c } = cells[i];
    let bestIdx = 0;
    let bestMinDist = -1;

    for (let b = 0; b < n; b++) {
      // Find the closest existing copy of badge b
      let minDist = Infinity;
      for (let rr = 0; rr < ROWS; rr++) {
        for (let cc = 0; cc < COLS; cc++) {
          if (grid[rr][cc] === b && !(rr === r && cc === c)) {
            const d = (rr - r) ** 2 + (cc - c) ** 2;
            if (d < minDist) minDist = d;
          }
        }
      }
      // Pick the badge whose nearest copy is the farthest
      if (minDist > bestMinDist) {
        bestMinDist = minDist;
        bestIdx = b;
      }
    }

    grid[r][c] = bestIdx;
  }

  return grid.map((row) => row.map((idx) => sorted[idx]));
}

interface BadgesSectionProps {
  badges?: Badge[];
  overline?: string;
  title?: string;
  description?: string;
}

export const BadgesSection: React.FC<BadgesSectionProps> = ({
  badges = [],
  overline = 'Certificaciones y reconocimientos',
  title = 'CALIDAD {ACREDITADA}',
  description = 'Contamos con certificaciones ISO 9001, ISO 14001 e ISO 27001, el sello Cum Laude de Emagister desde 2018 y una valoración de 5.0 en Google con más de 120 reseñas.',
}) => {
  const rows = useMemo(
    () => (badges.length > 0 ? buildRows(badges) : []),
    [badges]
  );

  if (badges.length === 0) return null;

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
                  "radial-gradient(ellipse 60% 90% at 50% 50%, black 20%, transparent 80%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 60% 90% at 50% 55%, black 20%, transparent 80%)",
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
                      style={
                        r % 2 === 1
                          ? { paddingLeft: `calc(100% / ${COLS} / 2)` }
                          : undefined
                      }
                    >
                      {row.map((badge, c) => (
                        <div
                          key={`${r}-${c}`}
                          className="relative flex-shrink-0 aspect-square rounded-xl overflow-hidden w-[16%] opacity-40 grayscale hover:grayscale-0 hover:opacity-100 hover:scale-[1.2] transition-all duration-500"
                        >
                          <Image
                            src={badge.imageUrl}
                            alt={badge.name}
                            fill
                            unoptimized
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
              {overline}
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-white text-4xl md:text-6xl font-black tracking-tight mb-8"
            >
              {renderStyledTitle(title)}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-neutral-400 text-base md:text-lg font-light max-w-md leading-relaxed"
            >
              {description}
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
};
