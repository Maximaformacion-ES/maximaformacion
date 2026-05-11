"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { FontStyles } from "./components/FontStyles";
import { Header } from "./components/Header";
import FloatingConsultCTA from "./components/FloatingConsultCTA";
import { HeroSection } from "./components/HeroSection";
import { StatsSection } from "./components/StatsSection";
import { CoursesSection } from "./components/CoursesSection";
import type { Program, Badge, HomeData } from "@/lib/strapi/types";

// Below-the-fold sections loaded lazily to reduce initial JS
const TestimonialsSection = dynamic(
  () => import("./components/TestimonialsSection").then((mod) => ({ default: mod.TestimonialsSection })),
  { ssr: false }
);
const LogoMarquee = dynamic(
  () => import("./components/LogoMarquee").then((mod) => ({ default: mod.LogoMarquee })),
  { ssr: false }
);
const BadgesSection = dynamic(
  () => import("./components/BadgesSection").then((mod) => ({ default: mod.BadgesSection })),
  { ssr: false }
);
const FAQSection = dynamic(
  () => import("./components/FAQSection").then((mod) => ({ default: mod.FAQSection })),
  { ssr: false }
);
const CTASection = dynamic(
  () => import("./components/CTASection").then((mod) => ({ default: mod.CTASection })),
  { ssr: false }
);
const Footer = dynamic(
  () => import("./components/Footer").then((mod) => ({ default: mod.Footer })),
  { ssr: false }
);

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
