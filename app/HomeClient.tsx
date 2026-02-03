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
import type { Program, Badge, HomeData } from "@/lib/strapi/types";
import { LogoMarquee } from "./components/LogoMarquee";
import { BadgesSection } from "./components/BadgesSection";

interface HomeClientProps {
  programs: Program[];
  badges: Badge[];
  homeData: HomeData;
}

export default function HomeClient({ programs, badges, homeData }: HomeClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <FontStyles />

      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      <HeroSection
        overline={homeData.heroOverline}
        title={homeData.heroTitle}
        description={homeData.heroDescription}
      />
      <StatsSection
        students={homeData.numericSection.students}
        bussiness={homeData.numericSection.bussiness}
        activePrograms={homeData.numericSection.activePrograms}
        mediaRating={homeData.numericSection.mediaRating}
      />
      <CoursesSection
        programs={programs}
        overline={homeData.programsSection.programsOverline}
        title={homeData.programsSection.programsTitle}
      />
      <LogoMarquee
        partnerLogos={homeData.partnersSection.partnersLogos}
        overline={homeData.partnersSection.partnersOverline}
        title={homeData.partnersSection.partnersTitle}
        description={homeData.partnersSection.partnersDescription}
      />
      <TestimonialsSection
        overline={homeData.testimonialsSection.testimonialsOverline}
        title={homeData.testimonialsSection.testimonialsTitle}
        testimonials={homeData.testimonialsSection.testimonials}
      />
      <BadgesSection
        badges={badges}
        overline={homeData.badgesSection.badgesOverline}
        title={homeData.badgesSection.badgesTitle}
        description={homeData.badgesSection.badgesDescription}
      />
      <CTASection
        overline={homeData.ctaSection.ctaOverline}
        title={homeData.ctaSection.ctaTitle}
        description={homeData.ctaSection.ctaDescription}
      />
      <Footer />
    </div>
  );
}
