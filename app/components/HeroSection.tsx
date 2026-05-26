"use client";

import React, { useRef } from "react";
import { m, useScroll, useTransform, useSpring } from "framer-motion";
import { ChevronDown, ArrowRight } from "lucide-react";
import { StyledTitle } from "./StyledTitle";

interface HeroSectionProps {
  overline?: string;
  title?: string;
  description?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  overline = "Formación 100% Online",
  title = "TRANSFORMA {TU FUTURO}",
  description = "Formación especializada que impulsa tu carrera profesional al siguiente nivel",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const titleY = useSpring(useTransform(scrollYProgress, [0, 0.3], [0, -100]), {
    stiffness: 100,
    damping: 30,
  });

  return (
    <section ref={containerRef} className="relative min-h-[100dvh] lg:h-[120dvh]">
      <div className="lg:sticky lg:top-0 min-h-[100dvh] lg:h-screen lg:overflow-hidden">
        {/* Background */}
        <m.div style={{ y }} className="absolute inset-0 bg-mx-bg" />

        {/* Content */}
        <m.div
          style={{ scale, opacity }}
          className="relative min-h-[100dvh] lg:h-full flex flex-col items-center justify-center px-6 pt-24 pb-12 lg:pt-20 lg:pb-0"
        >
          <m.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-mx-blue text-label-sm md:text-label-md xl:text-label-lg leading-label tracking-[0.3em] uppercase mb-4 md:mb-8"
          >
            {overline}
          </m.p>

          {/* Title with decorative chevrons */}
          <div className="relative w-full flex items-center justify-center">
            <img
              src="/iconBlue.svg"
              alt=""
              className="absolute left-[2%] hidden lg:block pointer-events-none w-32 xl:w-48 2xl:w-[266px]"
            />

            <m.h1
              style={{ y: titleY }}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="text-center text-mx-blue text-display-sm md:text-display-md xl:text-display-lg font-black leading-display tracking-display"
            >
              <StyledTitle text={title} />
            </m.h1>

            <img
              src="/iconOrange.svg"
              alt=""
              className="absolute right-[2%] hidden lg:block pointer-events-none w-32 xl:w-48 2xl:w-[266px]"
            />
          </div>

          <m.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="mt-5 md:mt-12 text-mx-text-muted text-body-sm md:text-body-md xl:text-body-lg font-light text-center max-w-2xl leading-body"
            >
            {description}
          </m.p>

          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-8 md:my-12 mb-4 md:mb-12"
          >
            <m.a
              href="/programas?type=master"
              className="group flex items-center justify-center gap-3 bg-mx-orange text-white px-8 py-4 text-label-sm md:text-label-md font-medium rounded-full hover:bg-mx-orange-dark transition-colors duration-300"

              whileTap={{ scale: 0.98 }}
            >
              Explorar Másters
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </m.a>
            <m.a
              href="/programas?type=cursos"
              className="flex items-center justify-center gap-3 border border-mx-orange text-mx-orange px-8 py-4 text-label-sm md:text-label-md font-light rounded-full hover:bg-mx-orange/10 hover:border-mx-orange transition-colors"

              whileTap={{ scale: 0.98 }}
            >
              Ver Cursos
            </m.a>
          </m.div>

          {/* Scroll indicator — bottom of the hero, no pill background
              now that StatsSection no longer overlaps the hero. Small
              gap from the bottom edge so it doesn't fight the system
              chrome on tall phones. */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="flex absolute bottom-6 md:bottom-12 left-1/2 -translate-x-1/2 z-[9999] flex-col items-center gap-1.5 md:gap-2 pointer-events-none"
          >
            <span className="text-mx-orange text-label-sm md:text-label-md leading-label tracking-widest uppercase">
              Scroll
            </span>
            <m.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ChevronDown size={20} className="text-mx-orange" />
            </m.div>
          </m.div>
        </m.div>
      </div>
    </section>
  );
};
