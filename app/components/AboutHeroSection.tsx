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
              "radial-gradient(ellipse 90% 60% at center, transparent 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.8) 80%, black 100%)",
          }}
        />
        {/* Top fade */}
        <div className="absolute inset-x-0 top-0 h-[50%] bg-gradient-to-b from-black via-black/90 via-10% to-transparent z-10" />
        {/* Bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-t from-black via-black/90 via-54% to-transparent z-10" />
        {/* Image with noise and amber tint */}
        <div className="noise w-full h-full relative">
          <img
            src={heroImage}
            className="w-full h-full object-contain object-[center_25%] rotate-y-180 opacity-70"
            alt="Máxima Formación"
          />
          {/* Color tint overlay */}
          <div
            className="absolute inset-0 mix-blend-color"
            style={{ backgroundColor: "#000" }}
          />
          <div
            className="absolute inset-0 mix-blend-color"
            style={{ backgroundColor: "#ff9b06", opacity: 0.5 }}
          />
        </div>
      </motion.div>

      <div className="relative z-20 text-center px-6 mt-[-10vh]">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block text-amber-500 text-sm font-medium tracking-[0.5em] uppercase mb-6"
        >
          {heroOverline}
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter"
        >
          {heroTitle}
        </motion.h1>
      </div>
    </section>
  );
};
