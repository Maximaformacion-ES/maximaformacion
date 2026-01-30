"use client";

import { useState } from "react";
import { FontStyles } from "./components/FontStyles";
import { Header } from "./components/Header";
import { HeroSection } from "./components/HeroSection";
import { StatsSection } from "./components/StatsSection";
import { CoursesSection } from "./components/CoursesSection";
import { TestimonialsSection } from "./components/TestimonialsSection";
import { CTASection } from "./components/CTASection";
import { Footer } from "./components/Footer";
import type { Program, Logo } from "@/lib/strapi/types";
import { LogoMarquee } from "./components/LogoMarquee";

interface HomeClientProps {
  programs: Program[];
  logos: Logo[];
}

export default function HomeClient({ programs, logos }: HomeClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <FontStyles />

      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      <HeroSection />
      <StatsSection />
      <CoursesSection programs={programs} />
      <LogoMarquee logos={logos} />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
