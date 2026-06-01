'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { m } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Users,
  FlaskConical,
  Award,
  Route,
  Check,
  BookOpen,
  Play,
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Header } from '../components/Header';
import { MaxymiaFooter } from '../components/MaxymiaFooter';
import { useSiteBranding } from '../components/SiteBrandingProvider';
import { FontStyles } from '../components/FontStyles';
import { ColoredTitle, StyledTitle } from '../components/StyledTitle';
import type { MaxymiaHomeData, MaxymiaCard } from '../../lib/strapi/types';
import type { MaxymiaCourse } from './types';
import MaxymiaCourseCard from './components/MaxymiaCourseCard';

const CAMPUS_URL = '/maxymia/campus';
const CAMPUS_PUBLIC_HREF = '/sign-in?redirect_url=/maxymia/campus';

// Icon/gradient maps for cards that don't have images from Strapi
const FEATURE_VISUALS = [
  { icon: Users, gradient: 'from-blue-600/30 via-indigo-500/20 to-transparent' },
  { icon: Award, gradient: 'from-mx-orange/25 via-amber-500/15 to-transparent' },
  { icon: FlaskConical, gradient: 'from-emerald-600/25 via-teal-500/15 to-transparent' },
  { icon: Route, gradient: 'from-purple-600/25 via-violet-500/15 to-transparent' },
];

const WHY_VISUALS = [
  { icon: BookOpen, gradient: 'from-blue-600/20 via-cyan-500/10 to-transparent', accent: 'text-blue-400/10' },
  { icon: Users, gradient: 'from-mx-orange/20 via-amber-500/10 to-transparent', accent: 'text-mx-orange/10' },
  { icon: Award, gradient: 'from-emerald-600/20 via-teal-500/10 to-transparent', accent: 'text-emerald-400/10' },
  { icon: FlaskConical, gradient: 'from-purple-600/20 via-violet-500/10 to-transparent', accent: 'text-purple-400/10' },
];

// The `href` is intentionally set to the sign-in route so server-rendered
// HTML (and SEO crawlers) never see a link into the protected /maxymia/campus
// area. `handleCampusClick` then intercepts on the client so already
// signed-in visitors get routed straight to the campus.
function useCampusLink() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  const handleCampusClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      router.push(isSignedIn ? CAMPUS_URL : CAMPUS_PUBLIC_HREF);
    },
    [isSignedIn, router],
  );

  return { handleCampusClick, isSignedIn };
}

// ─── HERO SECTION ──────────────────────────────────────

function HeroSection({ hero }: { hero: MaxymiaHomeData['hero'] }) {
  const { handleCampusClick } = useCampusLink();

  return (
    <section className="relative flex items-center overflow-hidden pt-12">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-32 right-[30%] w-125 h-125 bg-mx-orange/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 left-[20%] w-100 h-100 bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 right-10 w-50 h-50 bg-mx-orange/3 rounded-full blur-[80px]" />
      </div>

      <div className="max-w-[1800px] mx-auto px-6 md:px-[128px] w-full py-16 md:py-0 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <div>
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-mx-blue/80 bg-mx-blue/10 mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-mx-orange animate-pulse" />
              <span className="text-mx-blue text-label-md tracking-wider">{hero.overline}</span>
            </m.div>

            <m.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-display-sm md:text-display-md lg:text-display-md 2xl:text-display-lg font-black leading-[0.95] tracking-tight mb-8"
            >
              <ColoredTitle text={hero.title} />
            </m.h1>


            <m.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-white/60 text-body-md md:text-body-lg 2xl:text-heading-sm font-light leading-relaxed max-w-lg mb-10"
            >
              {hero.description}
            </m.p>

            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-wrap gap-4 mb-12"
            >
              <Link
                href={CAMPUS_PUBLIC_HREF}
                onClick={handleCampusClick}
                className="inline-flex items-center gap-2 bg-mx-orange text-white px-7 py-3.5 rounded-full text-body-sm font-medium hover:bg-mx-orange-dark transition-colors"
              >
                Ir al Campus
                <ArrowRight size={18} />
              </Link>
              <a
                href="#cursos"
                className="inline-flex items-center gap-2 border border-white/20 text-white px-7 py-3.5 rounded-full text-body-sm font-medium hover:bg-white/5 transition-colors"
              >
                <Play size={16} />
                Explorar cursos
              </a>
            </m.div>

            {/* Stats */}
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex items-center gap-6 pt-8 border-t border-white/10"
            >
              {[
                { value: '2.500+', label: 'Alumnado activo' },
                { value: '44', label: 'Cursos especializados' },
                { value: '98%', label: 'Satisfacción' },
              ].map((stat, i) => (
                <React.Fragment key={stat.label}>
                  {i > 0 && <div className="w-px h-10 bg-white/10" />}
                  <div>
                    <div className="text-white text-heading-sm md:text-heading-md 2xl:text-heading-lg font-bold">{stat.value}</div>
                    <div className="text-white/40 text-label-md 2xl:text-label-lg">{stat.label}</div>
                  </div>
                </React.Fragment>
              ))}
            </m.div>
          </div>

          {/* Right - Logo decoration */}
          <m.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="hidden lg:flex items-center justify-center"
          >
            <div className="relative w-[550px] h-[550px]">
              {/* Background hero image — round with faded edges */}
              <div
                className="absolute inset-0 rounded-full overflow-hidden m-12"
                style={{ maskImage: 'radial-gradient(circle, black 40%, transparent 70%)', WebkitMaskImage: 'radial-gradient(circle, black 40%, transparent 70%)' }}
              >
                <Image
                  src="/hero-image.webp"
                  alt=""
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border-2 border-white/10" />
              <div className="absolute inset-4 rounded-full border border-white/5" />
              {/* Floating icons — alternating orange/blue bg, dark icon */}
              {[
                { top: '2%', left: '45%', size: 48, color: 'orange' as const },
                { top: '82%', left: '3%', size: 48, color: 'orange' as const },
                { top: '35%', left: '90%', size: 48, color: 'blue' as const },
                { top: '88%', left: '85%', size: 48, color: 'orange' as const },
                { top: '28%', left: '-2%', size: 48, color: 'blue' as const },
              ].map((pos, i) => (
                <m.div
                  key={`${pos.top}-${pos.left}`}
                  className={`absolute rounded-full flex items-center justify-center shadow-lg ${
                    pos.color === 'orange'
                      ? 'bg-mx-orange/20 text-mx-orange border border-mx-orange/80 shadow-mx-orange/20'
                      : 'bg-mx-blue/20 text-mx-blue border border-mx-blue/80 shadow-mx-blue/20'
                  }`}
                  style={{ top: pos.top, left: pos.left, width: pos.size, height: pos.size }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                >
                  {[FlaskConical, BookOpen, Award, Route, Users][i] &&
                    React.createElement([FlaskConical, BookOpen, Award, Route, Users][i], {
                      size: pos.size * 0.35,
                      className: 'text-current',
                    })}
                </m.div>
              ))}
            </div>
          </m.div>
        </div>
      </div>

      {/* Scroll indicator */}
      {/* <m.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-mx-orange/40 text-label-md tracking-widest">SCROLL</span>
        <ChevronDown size={18} className="text-mx-orange/40" />
      </m.div> */}
    </section>
  );
}

// ─── FEATURES SECTION ──────────────────────────────────

function FeaturesSection({ section }: { section: MaxymiaHomeData['whatIsSection'] }) {
  return (
    <section className="py-24 md:py-32 relative">
      <div className="max-w-[1800px] mx-auto px-6 md:px-[128px]">
        {/* Header */}
        <m.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 md:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-mx-blue/80 bg-mx-blue/10 mb-6">
            <FlaskConical size={14} className="text-mx-blue" />
            <span className="text-mx-blue text-label-md tracking-wider">{section.overline}</span>
          </div>
          <h2
            className="text-heading-lg md:text-display-sm 2xl:text-display-md font-black text-white mb-6"
          >
            <ColoredTitle text={section.title}/> 
          </h2>
          <p className="text-white/50 text-body-md md:text-body-lg 2xl:text-heading-sm font-light max-w-2xl mx-auto leading-relaxed">
            {section.description}
          </p>
        </m.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {section.cards.map((card: MaxymiaCard, i: number) => {
            const visual = FEATURE_VISUALS[i % FEATURE_VISUALS.length];
            return (
              <m.div
                key={card.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group relative rounded-2xl border border-white/10 overflow-hidden h-[320px] md:h-[360px] hover:border-mx-orange/30 transition-all duration-500"
              >
                {/* Background image from Strapi or gradient fallback */}
                {card.image ? (
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${card.image})` }}
                  />
                ) : (
                  <div className={`absolute inset-0 bg-linear-to-br ${visual.gradient}`} />
                )}
                <div className="absolute inset-0 bg-[#0b1018]/60 group-hover:bg-[#0b1018]/50 transition-colors duration-500" />

                {/* Content — pinned to top left */}
                <div className="absolute top-0 left-0 right-0 p-8 md:p-10">
                  <h3 className="text-white text-body-lg md:text-heading-sm 2xl:text-heading-md font-bold mb-2">{card.title}</h3>
                  <p className="text-white/50 text-body-sm 2xl:text-body-md font-light leading-relaxed max-w-md">{card.description}</p>
                </div>
              </m.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── COURSES SECTION ───────────────────────────────────

function CoursesSection({
  section,
  courses,
}: {
  section: MaxymiaHomeData['coursesSection'];
  courses: MaxymiaCourse[];
}) {
  const { handleCampusClick } = useCampusLink();

  return (
    <section id="cursos" className="py-24 md:py-32 relative border-t border-white/5">
      <div className="max-w-[1800px] mx-auto px-6 md:px-[128px]">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16">
          <m.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-mx-blue/80 bg-mx-blue/10 mb-5">
              <BookOpen size={14} className="text-mx-blue" />
              <span className="text-mx-blue text-label-md tracking-wider">{section.overline}</span>
            </div>
            <h2 className="text-display-sm md:text-display-md font-black leading-[0.95] text-white mb-4">
              <StyledTitle text={section.title} color="orange" mode="dark" />
            </h2>
            <p className="text-white/50 text-body-md 2xl:text-body-lg font-light max-w-md">
              {section.description}
            </p>
          </m.div>

          <m.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Link
              href={CAMPUS_PUBLIC_HREF}
              onClick={handleCampusClick}
              className="mt-6 md:mt-0 inline-flex items-center gap-2 text-white/50 hover:text-mx-orange text-label-lg font-light transition-colors border border-white/10 hover:border-mx-orange/30 px-5 py-2.5 rounded-full"
            >
              Ver cursos del campus
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/programas"
              className="md:mt-0 inline-flex items-center gap-2 text-white hover:text-mx-orange text-label-lg font-medium transition-colors border border-mx-orange/40 bg-mx-orange/10 hover:border-mx-orange px-5 py-2.5 rounded-full"
            >
              Catálogo completo de formaciones
              <ArrowRight size={14} />
            </Link>
          </m.div>
        </div>

        {/* Disclaimer to clarify these are campus-specific courses */}
        <p className="text-white/40 text-body-sm font-light mb-8 -mt-4">
          Estos son los cursos que se imparten dentro del campus Maxymia (IA aplicada a ciencias).
          Si buscas másters, otros cursos especializados o formación en consultoría, explora el{' '}
          <Link href="/programas" className="text-mx-orange hover:underline">
            catálogo completo
          </Link>
          .
        </p>

        {/* Course Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-3 md:gap-5">
          {courses.map((course, i) => (
            <div key={course.id} className={i >= 5 ? 'hidden sm:block' : ''}>
              <MaxymiaCourseCard
                course={course}
                locale="es"
                index={i}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── WHY SECTION ───────────────────────────────────────

function WhySection({ section }: { section: MaxymiaHomeData['whyMaxymia'] }) {
  const [activeCard, setActiveCard] = useState(0);

  return (
    <section className="relative py-24 md:py-32">
      <div className="max-w-[1800px] mx-auto px-6 md:px-[128px]">
        {/* Header */}
        <m.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-right mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-mx-blue/80 bg-mx-blue/10 mb-5">
            <Check size={14} className="text-mx-blue" />
            <span className="text-mx-blue text-label-md tracking-wider">{section.overline}</span>
          </div>
          <h2 className="text-heading-lg md:text-display-sm 2xl:text-display-md font-black text-white mb-4">{section.title}</h2>
          <p className="text-white/50 text-body-md font-light max-w-lg ml-auto leading-relaxed">
            {section.description}
          </p>
        </m.div>

        {/* Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Left — differentiator cards */}
          <div className="space-y-5">
            {section.cards.map((diff: MaxymiaCard, i: number) => (
              <m.div
                key={diff.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                onClick={() => setActiveCard(i)}
                className={`relative p-5 md:p-6 rounded-2xl border cursor-pointer transition-all duration-500 group ${
                  activeCard === i
                    ? 'border-mx-orange/50 bg-white/5'
                    : 'border-white/10 bg-white/0.02 hover:border-mx-orange/30 hover:bg-white/5'
                }`}
              >
                {activeCard === i && (
                  <div className="absolute -top-6 -left-6 w-32 h-32 bg-mx-orange/10 rounded-full blur-[50px] pointer-events-none" />
                )}
                <span className={`text-label-md font-mono tracking-widest mb-2 block relative z-10 ${
                  activeCard === i ? 'text-mx-orange' : 'text-mx-orange/40'
                }`}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="text-white text-body-lg md:text-heading-sm 2xl:text-heading-md font-bold mb-2 relative z-10">{diff.title}</h3>
                <p className="text-white/50 text-body-sm 2xl:text-body-md font-light leading-relaxed relative z-10">
                  {diff.description}
                </p>
              </m.div>
            ))}
          </div>

          {/* Right — image that changes on card click */}
          <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="hidden lg:block rounded-2xl overflow-hidden bg-[#0d1025] border border-white/5 aspect-4/3 sticky top-32"
          >
            {section.cards.map((card: MaxymiaCard, i: number) => {
              const visual = WHY_VISUALS[i % WHY_VISUALS.length];
              const Icon = visual.icon;
              return (
                <m.div
                  key={card.title}
                  className="absolute inset-0"
                  initial={false}
                  animate={{ opacity: activeCard === i ? 1 : 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {card.image ? (
                    <Image src={card.image} alt={card.title} className="absolute inset-0 w-full h-full object-cover" fill sizes="(max-width: 1024px) 100vw, 50vw" unoptimized />
                  ) : (
                    <>
                      <div className={`absolute inset-0 bg-linear-to-br ${visual.gradient}`} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Icon size={200} strokeWidth={0.4} className={visual.accent} />
                      </div>
                    </>
                  )}
                </m.div>
              );
            })}
            {/* Active indicator dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {section.cards.map((card: MaxymiaCard, i: number) => (
                <button
                  key={card.title}
                  onClick={() => setActiveCard(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    activeCard === i ? 'bg-mx-orange w-6' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
          </m.div>
        </div>
      </div>
    </section>
  );
}

// ─── CTA SECTION ───────────────────────────────────────

function CTASection({ section }: { section: MaxymiaHomeData['ctaSection'] }) {
  const { handleCampusClick } = useCampusLink();
  const { logoMaxymia } = useSiteBranding();
  const ctaLogo = section.logo || logoMaxymia;

  return (
    <section className="py-32 md:py-40 relative overflow-hidden border-t border-white/5 border-b border-b-white/5">
      {/* Background blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-mx-orange/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[900px] mx-auto px-6 text-center relative z-10">
        {/* Logo */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-6"
        >
          {ctaLogo && (
            <Image src={ctaLogo} alt="Maxymia" className="h-12 w-auto" width={240} height={48} unoptimized />
          )}
        </m.div>

        <m.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-heading-lg md:text-display-sm 2xl:text-display-md font-black text-white leading-tight mb-6"
        >
          <ColoredTitle text={section.title}/>
        </m.h2>

        <m.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-white/50 text-body-md md:text-body-lg 2xl:text-heading-sm font-light leading-relaxed max-w-2xl mx-auto mb-10"
        >
          {section.description}
        </m.p>

        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8"
        >
          <Link
            href={CAMPUS_PUBLIC_HREF}
            onClick={handleCampusClick}
            className="inline-flex items-center gap-2.5 bg-mx-orange text-white px-10 py-4.5 rounded-full text-body-md font-medium hover:bg-mx-orange-dark transition-colors"
          >
            Ir al Campus Virtual
            <ArrowRight size={20} />
          </Link>
        </m.div>

        <m.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-6 text-white/60 text-label-lg"
        >
          {[
            { icon: Check, text: 'Registro gratuito' },
            { icon: BookOpen, text: 'Cursos de prueba' },
            { icon: Check, text: 'Sin compromiso' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2">
              <Icon size={14} className="text-mx-orange" />
              <span>{text}</span>
            </div>
          ))}
        </m.div>
      </div>
    </section>
  );
}

// ─── MAIN PAGE ──────────────────────────────────────────

interface MaxymiaClientProps {
  data: MaxymiaHomeData;
  courses: MaxymiaCourse[];
}

export default function MaxymiaClient({ data, courses }: MaxymiaClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0b1018] text-white overflow-x-hidden relative">

      {/* Sub-brand banner */}
      <div className="relative top-0 left-0 right-0 z-60 bg-white/0.03 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-[1800px] mx-auto px-6 md:px-[128px] flex items-center justify-between h-8">
          <Link
            href="/"
            className="group flex items-center gap-2 text-white/30 hover:text-mx-orange transition-colors text-label-sm tracking-wide"
          >
            <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Volver a</span>
            <span className="font-medium text-white/50 group-hover:text-mx-orange transition-colors">Máxima Formación</span>
          </Link>
          <span className="text-white/80 text-label-sm tracking-widest uppercase hidden md:block">Campus de IA Aplicada a Ciencias</span>
        </div>
      </div>
      <FontStyles />
      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} variant="maxymia" />

      <main className="relative z-10">
        <HeroSection hero={data.hero} />
        <FeaturesSection section={data.whatIsSection} />
        <CoursesSection section={data.coursesSection} courses={courses} />
        <WhySection section={data.whyMaxymia} />
        <CTASection section={data.ctaSection} />
      </main>

      <MaxymiaFooter />
    </div>
  );
}
