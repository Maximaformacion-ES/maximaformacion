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
    <section ref={containerRef} className="relative h-[120dvh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Background */}
        <m.div style={{ y }} className="absolute inset-0 bg-mx-bg" />

        {/* Decorative chevrons */}
        <div className="absolute left-[2%] top-1/2 -translate-y-1/2 hidden lg:block pointer-events-none w-32 xl:w-48 2xl:w-[266px]">
          <svg
            viewBox="0 0 266 273"
            className="w-full h-auto"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M136.501 0H265.816L64.6584 201.158L0.000427246 136.5L136.501 0Z"
              fill="#527BE7"
            />
            <path
              d="M64.659 201.158L129.317 136.5L258.633 273H136.501L64.659 201.158Z"
              fill="url(#paint0_linear_85_9)"
            />
            <defs>
              <linearGradient
                id="paint0_linear_85_9"
                x1="161.646"
                y1="136.5"
                x2="161.646"
                y2="273"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#2E4581" />
                <stop offset="1" stopColor="#527BE7" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="absolute right-[2%] top-1/2 -translate-y-1/2 hidden lg:block pointer-events-none w-32 xl:w-48 2xl:w-[266px]">
          <svg
            viewBox="0 0 266 273"
            className="w-full h-auto"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M129.162 272.676H0L200.919 71.7569L265.5 136.338L129.162 272.676Z"
              fill="#F7A000"
            />
            <path
              d="M200.919 71.7568L136.338 136.338L7.17578 4.57764e-05H129.162L200.919 71.7568Z"
              fill="url(#paint0_linear_85_4)"
            />
            <defs>
              <linearGradient
                id="paint0_linear_85_4"
                x1="104.047"
                y1="136.338"
                x2="104.047"
                y2="4.57764e-05"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#8E5C00" />
                <stop offset="1" stopColor="#F7A000" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Content */}
        <m.div
          style={{ scale, opacity }}
          className="relative h-full flex flex-col items-center justify-center px-6 pt-20"
        >
          <m.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-mx-blue text-label-md md:text-body-md leading-label tracking-[0.3em] uppercase mb-8"
          >
            {overline}
          </m.p>

          <m.h1
            style={{ y: titleY }}
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="text-center text-mx-blue text-display-sm md:text-display-md lg:text-display-lg font-black leading-display tracking-display"
          >
            <StyledTitle text={title} />
          </m.h1>

          <m.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="mt-8 md:mt-12 text-mx-text-muted text-body-md md:text-heading-sm font-light text-center max-w-2xl leading-body"
          >
            {description}
          </m.p>

          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 my-12"
          >
            <m.a
              href="/programas"
              className="group flex items-center justify-center gap-3 bg-mx-orange text-white px-8 py-4 text-body-md font-medium rounded-full hover:bg-mx-orange-dark transition-colors duration-300"
              
              whileTap={{ scale: 0.98 }}
            >
              Explorar Másters
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </m.a>
            <m.a
              href="/programas"
              className="flex items-center justify-center gap-3 border border-mx-orange text-mx-orange px-8 py-4 text-body-md font-light rounded-full hover:bg-mx-orange/10 hover:border-mx-orange transition-colors"
              
              whileTap={{ scale: 0.98 }}
            >
              Ver Cursos
            </m.a>
          </m.div>

          {/* Scroll indicator */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <span className="text-mx-orange text-label-md leading-label tracking-widest uppercase">
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
