"use client";

import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { HeroSection } from "@/lib/strapi/types";
import { INNOVACION_HERO_FALLBACK } from "@/app/data/hero-sections";

interface InnovacionHeroSectionProps {
  data?: HeroSection;
}

export const InnovacionHeroSection: React.FC<InnovacionHeroSectionProps> = ({ data }) => {
  const { scrollYProgress } = useScroll();
  const yRange = useTransform(scrollYProgress, [0, 1], [0, -200]);

  const heroImage = data?.heroImage || INNOVACION_HERO_FALLBACK.heroImage;
  const heroOverline = data?.heroOverline || INNOVACION_HERO_FALLBACK.heroOverline;
  const heroTitle = data?.heroTitle || INNOVACION_HERO_FALLBACK.heroTitle;
  const heroDescription = data?.heroDescription || INNOVACION_HERO_FALLBACK.heroDescription;

  return (
    <section className="relative h-dvh flex items-center justify-center overflow-hidden">
      <motion.div
        style={{ y: yRange }}
        className="absolute inset-0 z-0 h-[120%]"
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
        <div className="absolute inset-x-0 top-0 h-[20%] bg-gradient-to-b from-mx-bg via-mx-bg/40 via-50% to-transparent z-10" />
        {/* Bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-[25%] bg-gradient-to-t from-mx-bg via-mx-bg/40 via-50% to-transparent z-10" />
        {/* Image with noise and blue tint */}
        <div className="noise w-full h-full relative">
          <img
            src={heroImage}
            className="w-full h-full object-cover object-[center_25%] rotate-y-180 opacity-100"
            alt="Máxima Formación"
          />
          {/* Color tint overlay */}
          <div
            className="absolute inset-0 mix-blend-color"
            style={{ backgroundColor: "#016157", opacity: 0.9 }}
          />
        </div>
      </motion.div>

      <div className="relative z-20 text-center px-6 max-w-5xl mx-auto">
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
          className="text-4xl md:text-7xl lg:text-8xl font-black mb-6 text-[#016157]"
        >
          {heroTitle}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-mx-text-muted text-lg md:text-xl font-light mb-10 max-w-2xl mx-auto"
        >
          {heroDescription}
        </motion.p>
        <motion.a
          href="#sobre-nosotros"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="group inline-flex items-center justify-center gap-3 bg-mx-orange text-white px-8 py-4 text-base font-medium rounded-full hover:bg-mx-orange-dark transition-colors duration-300"
        >
          Descubre más
          <ArrowRight
            size={18}
            className="group-hover:translate-x-1 transition-transform"
          />
        </motion.a>
      </div>
    </section>
  );
};
