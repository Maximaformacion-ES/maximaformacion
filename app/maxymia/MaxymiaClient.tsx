'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { m } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Star,
  ChevronDown,
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
import { FontStyles } from '../components/FontStyles';
import { ColoredTitle, StyledTitle } from '../components/StyledTitle';
import type { MaxymiaHomeData, MaxymiaCard, Program } from '../../lib/strapi/types';

const CAMPUS_URL = 'https://maxymia.com/';

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

function useCampusLink() {
  const { isSignedIn } = useUser();
  const router = useRouter();

  const handleCampusClick = useCallback(
    (e: React.MouseEvent) => {
      if (!isSignedIn) {
        e.preventDefault();
        router.push('/sign-in?redirect_url=/maxymia');
      }
    },
    [isSignedIn, router],
  );

  return { handleCampusClick, isSignedIn };
}

// ─── HERO SECTION ──────────────────────────────────────

function HeroSection({ hero }: { hero: MaxymiaHomeData['hero'] }) {
  const { handleCampusClick } = useCampusLink();

  return (
    <section className="relative min-h-dvh flex items-center overflow-hidden pt-20">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-32 right-[30%] w-125 h-125 bg-mx-orange/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 left-[20%] w-100 h-100 bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 right-10 w-50 h-50 bg-mx-orange/3 rounded-full blur-[80px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full py-16 md:py-24 relative z-10">
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
              <span className="text-mx-blue text-xs tracking-wider">{hero.overline}</span>
            </m.div>

            <m.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight mb-8"
            >
              <ColoredTitle text={hero.title} />
            </m.h1>


            <m.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-white/60 text-base md:text-lg font-light leading-relaxed max-w-lg mb-10"
            >
              {hero.description}
            </m.p>

            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-wrap gap-4 mb-12"
            >
              <a
                href={CAMPUS_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleCampusClick}
                className="inline-flex items-center gap-2 bg-mx-orange text-white px-7 py-3.5 rounded-full text-sm font-medium hover:bg-mx-orange-dark transition-colors"
              >
                Ir al Campus
                <ArrowUpRight size={18} />
              </a>
              <a
                href="#cursos"
                className="inline-flex items-center gap-2 border border-white/20 text-white px-7 py-3.5 rounded-full text-sm font-medium hover:bg-white/5 transition-colors"
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
                { value: '2.500+', label: 'Alumnos activos' },
                { value: '44', label: 'Cursos especializados' },
                { value: '98%', label: 'Satisfacción' },
              ].map((stat, i) => (
                <React.Fragment key={stat.label}>
                  {i > 0 && <div className="w-px h-10 bg-white/10" />}
                  <div>
                    <div className="text-white text-xl md:text-2xl font-bold">{stat.value}</div>
                    <div className="text-white/40 text-xs">{stat.label}</div>
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
            <div className="relative w-[470px] h-[470px]">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border-2 border-white/10" />
              <div className="absolute inset-4 rounded-full border border-white/5" />
              {/* Central logo */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Image src="/logo.webp" alt="Maxymia" className="w-[200px] h-[200px] object-contain" width={200} height={200} />
              </div>
              {/* Floating icons */}
              {[
                { top: '2%', left: '45%', size: 56 },
                { top: '82%', left: '3%', size: 48 },
                { top: '35%', left: '90%', size: 48 },
                { top: '88%', left: '85%', size: 44 },
                { top: '28%', left: '-2%', size: 40 },
              ].map((pos, i) => (
                <m.div
                  key={`${pos.top}-${pos.left}`}
                  className="absolute bg-white/5 border border-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm"
                  style={{ top: pos.top, left: pos.left, width: pos.size, height: pos.size }}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {[FlaskConical, BookOpen, Award, Route, Users][i] &&
                    React.createElement([FlaskConical, BookOpen, Award, Route, Users][i], {
                      size: pos.size * 0.35,
                      className: 'text-mx-orange/70',
                    })}
                </m.div>
              ))}
            </div>
          </m.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <m.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-mx-orange/40 text-xs tracking-widest">SCROLL</span>
        <ChevronDown size={18} className="text-mx-orange/40" />
      </m.div>
    </section>
  );
}

// ─── FEATURES SECTION ──────────────────────────────────

function FeaturesSection({ section }: { section: MaxymiaHomeData['whatIsSection'] }) {
  return (
    <section className="py-24 md:py-32 relative">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12">
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
            <span className="text-mx-blue text-xs tracking-wider">{section.overline}</span>
          </div>
          <h2
            className="text-3xl md:text-5xl font-black text-white mb-6"
          >
            <ColoredTitle text={section.title}/> 
          </h2>
          <p className="text-white/50 text-base md:text-lg font-light max-w-2xl mx-auto leading-relaxed">
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
                <div className="absolute inset-0 bg-[#060918]/60 group-hover:bg-[#060918]/50 transition-colors duration-500" />

                {/* Content — pinned to top left */}
                <div className="absolute top-0 left-0 right-0 p-8 md:p-10">
                  <h3 className="text-white text-lg md:text-xl font-bold mb-2">{card.title}</h3>
                  <p className="text-white/50 text-sm font-light leading-relaxed max-w-md">{card.description}</p>
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
  programs,
}: {
  section: MaxymiaHomeData['coursesSection'];
  programs: Program[];
}) {
  const { handleCampusClick } = useCampusLink();

  return (
    <section id="cursos" className="py-24 md:py-32 relative border-t border-white/5">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
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
              <span className="text-mx-blue text-xs tracking-wider">{section.overline}</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black leading-[0.95] text-white mb-4">
              <StyledTitle text={section.title} color="orange" mode="dark" />
            </h2>
            <p className="text-white/50 text-base font-light max-w-md">
              {section.description}
            </p>
          </m.div>

          <m.a
            href={CAMPUS_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleCampusClick}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 md:mt-0 inline-flex items-center gap-2 text-white/50 hover:text-mx-orange text-sm font-light transition-colors border border-white/10 hover:border-mx-orange/30 px-5 py-2.5 rounded-full"
          >
            Ver todos los cursos
            <ArrowRight size={14} />
          </m.a>
        </div>

        {/* Course Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {programs.map((course, i) => (
            <m.div
              key={course.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group rounded-2xl border border-white/10 bg-white/0.02 overflow-hidden hover:border-mx-orange/30 transition-all duration-500"
            >
              {/* Image */}
              <div className="relative h-[200px] overflow-hidden bg-[#0d1025]">
                <div className="absolute inset-0 bg-linear-to-t from-[#060918] via-transparent to-transparent z-10" />
                <div className="absolute top-3 left-3 z-20">
                  <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white text-xs border border-white/10">
                    {course.type}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 z-20 flex gap-1.5 flex-wrap">
                  {course.topics.slice(0, 2).map((topic) => (
                    <span
                      key={topic.id}
                      className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white/80 text-xs border border-white/10"
                    >
                      {topic.name}
                    </span>
                  ))}
                  {course.topics.length > 2 && (
                    <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white/60 text-xs border border-white/10">
                      +{course.topics.length - 2}
                    </span>
                  )}
                </div>
                {/* Image or placeholder gradient */}
                {course.image ? (
                  <Image src={course.image} alt={course.title} className="absolute inset-0 w-full h-full object-cover" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" unoptimized />
                ) : (
                  <div className="absolute inset-0 bg-linear-to-br from-mx-orange/10 via-blue-500/10 to-transparent" />
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={14}
                        className={s <= 4 ? 'text-mx-orange fill-mx-orange' : 'text-white/20'}
                      />
                    ))}
                  </div>
                  <span className="text-white/70 text-xs">4.0</span>
                </div>

                <h3 className="text-white text-base font-semibold mb-2 line-clamp-1">{course.title}</h3>
                <p className="text-white/40 text-sm font-light line-clamp-2 mb-5">{course.description}</p>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {course.originalPrice && (
                      <span className="text-white/30 text-sm line-through">{course.originalPrice}&euro;</span>
                    )}
                    <span className="text-white text-lg font-bold">{course.price}&euro;</span>
                  </div>
                  <ArrowUpRight
                    size={20}
                    className="text-white/30 group-hover:text-mx-orange transition-colors"
                  />
                </div>
              </div>
            </m.div>
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
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
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
            <span className="text-mx-blue text-xs tracking-wider">{section.overline}</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">{section.title}</h2>
          <p className="text-white/50 text-base font-light max-w-lg ml-auto leading-relaxed">
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
                <span className={`text-xs font-mono tracking-widest mb-2 block relative z-10 ${
                  activeCard === i ? 'text-mx-orange' : 'text-mx-orange/40'
                }`}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="text-white text-lg md:text-xl font-bold mb-2 relative z-10">{diff.title}</h3>
                <p className="text-white/50 text-sm font-light leading-relaxed relative z-10">
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
          <Image src={section.logo || '/logo-completo.webp'} alt="Maxymia" className="h-12 w-auto" width={240} height={48} unoptimized />
        </m.div>

        <m.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-3xl md:text-5xl font-black text-white leading-tight mb-6"
        >
          <ColoredTitle text={section.title}/>
        </m.h2>

        <m.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-white/50 text-base md:text-lg font-light leading-relaxed max-w-2xl mx-auto mb-10"
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
          <a
            href={CAMPUS_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleCampusClick}
            className="inline-flex items-center gap-2.5 bg-mx-orange text-white px-10 py-4.5 rounded-full text-base font-medium hover:bg-mx-orange-dark transition-colors"
          >
            Ir al Campus Virtual
            <ArrowUpRight size={20} />
          </a>
        </m.div>

        <m.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-6 text-white/60 text-sm"
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
  programs: Program[];
}

export default function MaxymiaClient({ data, programs }: MaxymiaClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#060918] text-white overflow-x-hidden relative">

      {/* Sub-brand banner */}
      <div className="fixed top-0 left-0 right-0 z-60 bg-white/0.03 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 flex items-center justify-between h-8">
          <Link
            href="/"
            className="group flex items-center gap-2 text-white/30 hover:text-mx-orange transition-colors text-[11px] tracking-wide"
          >
            <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Volver a</span>
            <span className="font-medium text-white/50 group-hover:text-mx-orange transition-colors">Máxima Formación</span>
          </Link>
          <span className="text-white/80 text-[10px] tracking-widest uppercase hidden md:block">Campus de IA Aplicada a Ciencias</span>
        </div>
      </div>
      <FontStyles />
      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} variant="maxymia" />

      <main className="relative z-10">
        <HeroSection hero={data.hero} />
        <FeaturesSection section={data.whatIsSection} />
        <CoursesSection section={data.coursesSection} programs={programs} />
        <WhySection section={data.whyMaxymia} />
        <CTASection section={data.ctaSection} />
      </main>

      <MaxymiaFooter />
    </div>
  );
}
