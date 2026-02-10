"use client";

import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { HeroSection } from "@/lib/strapi/types";
import { CONOCENOS_HERO_FALLBACK } from "@/app/data/hero-sections";

interface AboutHeroSectionProps {
  data?: HeroSection;
}

export const AboutHeroSection: React.FC<AboutHeroSectionProps> = ({ data }) => {
  const { scrollYProgress } = useScroll();
  const yRange = useTransform(scrollYProgress, [0, 1], [0, -200]);

  const heroImage = data?.heroImage || CONOCENOS_HERO_FALLBACK.heroImage;
  const heroOverline = data?.heroOverline || CONOCENOS_HERO_FALLBACK.heroOverline;
  const heroTitle = data?.heroTitle || CONOCENOS_HERO_FALLBACK.heroTitle;

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <motion.div
        style={{ y: yRange }}
        className="absolute inset-0 z-0 h-[120%] flex items-center justify-center"
      >
        {/* Vignette overlay */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              "radial-gradient(ellipse 90% 60% at center, transparent 0%, rgba(255,252,248,0.3) 50%, rgba(255,252,248,0.8) 80%, var(--color-mx-bg) 100%)",
          }}
        />
        {/* Top fade */}
        <div
          className="absolute inset-x-0 top-0 h-[50%] z-10"
          style={{
            background: "linear-gradient(to bottom, var(--color-mx-bg) 0%, rgba(255,252,248,0.9) 10%, transparent 100%)",
          }}
        />
        {/* Bottom fade */}
        <div
          className="absolute inset-x-0 bottom-0 h-[40%] z-10"
          style={{
            background: "linear-gradient(to top, var(--color-mx-bg) 0%, rgba(255,252,248,0.9) 54%, transparent 100%)",
          }}
        />
        {/* Image with blue tint */}
        <div className="w-full h-full relative">
          <img
            src={heroImage}
            className="w-full h-full object-cover object-[center_25%] opacity-50"
            alt="Máxima Formación"
          />
          <div
            className="absolute inset-0 mix-blend-color"
            style={{ backgroundColor: "var(--color-mx-blue)", opacity: 0.5 }}
          />
        </div>
      </motion.div>

      <div className="relative z-20 text-center px-6 mt-[-10vh]">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block text-mx-orange text-sm font-medium tracking-[0.5em] uppercase mb-6"
        >
          {heroOverline}
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-mx-blue text-6xl md:text-8xl lg:text-9xl font-black "
        >
          {heroTitle}
        </motion.h1>
      </div>
    </section>
  );
};
