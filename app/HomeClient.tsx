"use client";

import { useState } from "react";
import { FontStyles } from "./components/FontStyles";
import { MarketingHeader as Header } from "./components/MarketingHeader";
import FloatingConsultCTA from "./components/FloatingConsultCTA";
import { HeroSection } from "./components/HeroSection";
import { StatsSection } from "./components/StatsSection";
import { CoursesSection } from "./components/CoursesSection";
import { TestimonialsSection } from "./components/TestimonialsSection";
import { LogoMarquee } from "./components/LogoMarquee";
import { BadgesSection } from "./components/BadgesSection";
import { FAQSection } from "./components/FAQSection";
import { CTASection } from "./components/CTASection";
import { Footer } from "./components/Footer";
import type { Program, Badge, HomeData } from "@/lib/strapi/types";

interface HomeClientProps {
  programs: Program[];
  badges: Badge[];
  homeData: HomeData;
}

export default function HomeClient({ programs, badges, homeData }: HomeClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-mx-bg text-mx-text overflow-x-hidden">
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
      <FAQSection
        overline={homeData.faqSection.faqOverline}
        title={homeData.faqSection.faqTitle}
        faqs={homeData.faqSection.faqs}
      />
      <CTASection
        overline={homeData.ctaSection.ctaOverline}
        title={homeData.ctaSection.ctaTitle}
        description={homeData.ctaSection.ctaDescription}
      />
      <Footer />
      <FloatingConsultCTA />
    </div>
  );
}
