'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
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
import { renderStyledTitle } from '../components/StyledTitle';

const CAMPUS_URL = 'https://maxymia.com/';

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

// ─── DATA ─────────────────────────────────────────────

const FEATURES = [
  {
    icon: Users,
    title: 'Mentorías Personalizadas',
    description:
      'Accede a sesiones 1:1 con investigadores y científicos de datos que aplican IA en su día a día profesional.',
    gradient: 'from-blue-600/30 via-indigo-500/20 to-transparent',
  },
  {
    icon: Award,
    title: 'Certificación Profesional',
    description:
      'Obtén certificaciones reconocidas en el sector científico y tecnológico, avaladas por Máxima Formación y con validez internacional.',
    gradient: 'from-mx-orange/25 via-amber-500/15 to-transparent',
  },
  {
    icon: FlaskConical,
    title: 'Labs Prácticos',
    description:
      'Laboratorios virtuales con datasets reales, entornos preconfigurados y proyectos de investigación aplicada en la nube.',
    gradient: 'from-emerald-600/25 via-teal-500/15 to-transparent',
  },
  {
    icon: Route,
    title: 'Rutas de Aprendizaje',
    description:
      'Itinerarios completos por especialidad: bioinformática, química computacional, diagnóstico médico y muchas más.',
    gradient: 'from-purple-600/25 via-violet-500/15 to-transparent',
  },
];

const COURSES = [
  {
    title: 'Especialización en Cloud Computing',
    description:
      'Domina los servicios cloud de AWS, Azure y GCP. Aprende a diseñar, desplegar y gestionar modelos de infraestructura...',
    type: 'Master',
    topics: ['Ciencia de Datos', 'Python'],
    extra: 3,
    rating: 4.0,
    students: '1.5k',
    originalPrice: 3490,
    price: 2490,
    image: '/maximia.png',
  },
  {
    title: 'Especialización en Cloud Computing',
    description:
      'Domina los servicios cloud de AWS, Azure y GCP. Aprende a diseñar, desplegar y gestionar modelos de infraestructura...',
    type: 'Master',
    topics: ['Ciencia de Datos', 'Python'],
    extra: 3,
    rating: 4.0,
    students: '1.5k',
    originalPrice: 3490,
    price: 2490,
    image: '/maximia.png',
  },
  {
    title: 'Especialización en Cloud Computing',
    description:
      'Domina los servicios cloud de AWS, Azure y GCP. Aprende a diseñar, desplegar y gestionar modelos de infraestructura...',
    type: 'Master',
    topics: ['Ciencia de Datos', 'Python'],
    extra: 3,
    rating: 4.0,
    students: '1.5k',
    originalPrice: 3490,
    price: 2490,
    image: '/maximia.png',
  },
  {
    title: 'Especialización en Cloud Computing',
    description:
      'Domina los servicios cloud de AWS, Azure y GCP. Aprende a diseñar, desplegar y gestionar modelos de infraestructura...',
    type: 'Master',
    topics: ['Ciencia de Datos', 'Python'],
    extra: 3,
    rating: 4.0,
    students: '1.5k',
    originalPrice: 3490,
    price: 4490,
    image: '/maximia.png',
  },
];

const DIFFERENTIATORS = [
  {
    title: 'Datasets Científicos Reales',
    description:
      'Trabaja con datos reales de investigaciones publicadas: secuencias genómicas, imágenes médicas, datos moleculares y registros clínicos.',
  },
  {
    title: 'Mentores Investigadores',
    description:
      'Aprende directamente de científicos e investigadores que publican papers y trabajan en proyectos reales de I+D+i.',
  },
  {
    title: 'Entornos Cloud Preconfigurados',
    description:
      'Accede a laboratorios virtuales con GPU, entornos Jupyter y herramientas de análisis listas para usar sin configuración.',
  },
  {
    title: 'Comunidad Científica Activa',
    description:
      'Conecta con una red de profesionales de ciencias aplicadas: comparte conocimiento, colabora en proyectos y crece profesionalmente.',
  },
];

// ─── HERO SECTION ──────────────────────────────────────

function HeroSection() {
  const { handleCampusClick } = useCampusLink();

  return (
    <section className="relative min-h-dvh flex items-center overflow-hidden pt-20">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-32 right-[30%] w-[500px] h-[500px] bg-mx-orange/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 left-[20%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 right-10 w-[200px] h-[200px] bg-mx-orange/3 rounded-full blur-[80px]" />
      </div>

      <div className="max-w-[1280px] mx-auto px-6 md:px-12 w-full py-16 md:py-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-mx-blue/80 bg-mx-blue/10 mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-mx-orange animate-pulse" />
              <span className="text-mx-blue/100 text-xs tracking-wider">Campus Virtual de IA</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight mb-8"
            >
            DOMINA LA <br /> <span className="text-mx-orange">IA APLICADA</span> <br /> A CIENCIAS
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-white/60 text-base md:text-lg font-light leading-relaxed max-w-lg mb-10"
            >
              El campus virtual de Máxima Formación donde la inteligencia artificial se encuentra con la investigación
              científica. Cursos especializados para profesionales que quieren liderar el futuro.
            </motion.p>

            <motion.div
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
            </motion.div>

            {/* Stats */}
            <motion.div
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
            </motion.div>
          </div>

          {/* Right - Logo decoration */}
          <motion.div
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
                <img src="/logo.webp" alt="Maxymia" className="w-[200px] h-[200px] object-contain" />
              </div>
              {/* Floating icons */}
              {[
                { top: '2%', left: '45%', size: 56 },
                { top: '82%', left: '3%', size: 48 },
                { top: '35%', left: '90%', size: 48 },
                { top: '88%', left: '85%', size: 44 },
                { top: '28%', left: '-2%', size: 40 },
              ].map((pos, i) => (
                <motion.div
                  key={i}
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
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-mx-orange/40 text-xs tracking-widest">SCROLL</span>
        <ChevronDown size={18} className="text-mx-orange/40" />
      </motion.div>
    </section>
  );
}

// ─── FEATURES SECTION ──────────────────────────────────

function FeaturesSection() {
  return (
    <section className="py-24 md:py-32 relative">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 md:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-mx-blue/80 bg-mx-blue/10 mb-6">
            <FlaskConical size={14} className="text-mx-blue" />
            <span className="text-mx-blue text-xs tracking-wider">Qué es Maxymia</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6 ">
            DONDE LA CIENCIA <br /> <span className="text-mx-orange">ABRAZA LA IA</span>
          </h2>
          <p className="text-white/50 text-base md:text-lg font-light max-w-2xl mx-auto leading-relaxed">
            Maxymia es el campus virtual de Máxima Formación dedicado exclusivamente a la inteligencia artificial
            aplicada a disciplinas científicas. Aquí no encontrarás cursos genéricos: cada programa está diseñado por
            investigadores y científicos en activo.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group relative rounded-2xl border border-white/10 overflow-hidden h-[320px] md:h-[360px] hover:border-mx-orange/30 transition-all duration-500"
            >
              {/* Background image / gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient}`} />
              <div className="absolute inset-0 bg-[#060918]/60 group-hover:bg-[#060918]/50 transition-colors duration-500" />

              {/* Content — pinned to top left */}
              <div className="absolute top-0 left-0 right-0 p-8 md:p-10">
                <h3 className="text-white text-lg md:text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-white/50 text-sm font-light leading-relaxed max-w-md">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── COURSES SECTION ───────────────────────────────────

function CoursesSection() {
  const { handleCampusClick } = useCampusLink();

  return (
    <section id="cursos" className="py-24 md:py-32 relative border-t border-white/5">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-mx-blue/80 bg-mx-blue/10 mb-5">
              <BookOpen size={14} className="text-mx-blue" />
              <span className="text-mx-blue text-xs tracking-wider">Destacados</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black leading-[0.95] text-white mb-4">
              {renderStyledTitle('CURSOS {POPULARES}', 'orange', 'dark')}
            </h2>
            <p className="text-white/50 text-base font-light max-w-md">
              Formación diseñada por científicos, para científicos. IA aplicada a problemas reales.
            </p>
          </motion.div>

          <motion.a
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
          </motion.a>
        </div>

        {/* Course Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {COURSES.map((course, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden hover:border-mx-orange/30 transition-all duration-500"
            >
              {/* Image */}
              <div className="relative h-[200px] overflow-hidden bg-[#0d1025]">
                <div className="absolute inset-0 bg-gradient-to-t from-[#060918] via-transparent to-transparent z-10" />
                <div className="absolute top-3 left-3 z-20">
                  <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white text-xs border border-white/10">
                    {course.type}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 z-20 flex gap-1.5 flex-wrap">
                  {course.topics.map((topic) => (
                    <span
                      key={topic}
                      className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white/80 text-xs border border-white/10"
                    >
                      {topic}
                    </span>
                  ))}
                  {course.extra > 0 && (
                    <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white/60 text-xs border border-white/10">
                      +{course.extra}
                    </span>
                  )}
                </div>
                {/* Placeholder gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-mx-orange/10 via-blue-500/10 to-transparent" />
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={14}
                        className={s <= Math.floor(course.rating) ? 'text-mx-orange fill-mx-orange' : 'text-white/20'}
                      />
                    ))}
                  </div>
                  <span className="text-white/70 text-xs">{course.rating}</span>
                  <span className="text-white/30 text-xs">({course.students} estudiantes)</span>
                </div>

                <h3 className="text-white text-base font-semibold mb-2 line-clamp-1">{course.title}</h3>
                <p className="text-white/40 text-sm font-light line-clamp-2 mb-5">{course.description}</p>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-white/30 text-sm line-through">{course.originalPrice}&euro;</span>
                    <span className="text-white text-lg font-bold">{course.price}&euro;</span>
                  </div>
                  <ArrowUpRight
                    size={20}
                    className="text-white/30 group-hover:text-mx-orange transition-colors"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── WHY SECTION ───────────────────────────────────────

const WHY_VISUALS = [
  { icon: BookOpen, gradient: 'from-blue-600/20 via-cyan-500/10 to-transparent', accent: 'text-blue-400/10' },
  { icon: Users, gradient: 'from-mx-orange/20 via-amber-500/10 to-transparent', accent: 'text-mx-orange/10' },
  { icon: Award, gradient: 'from-emerald-600/20 via-teal-500/10 to-transparent', accent: 'text-emerald-400/10' },
  { icon: FlaskConical, gradient: 'from-purple-600/20 via-violet-500/10 to-transparent', accent: 'text-purple-400/10' },
];

function WhySection() {
  const [activeCard, setActiveCard] = useState(0);

  return (
    <section className="relative py-24 md:py-32">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-right mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-mx-blue/80 bg-mx-blue/10 mb-5">
            <Check size={14} className="text-mx-blue" />
            <span className="text-mx-blue text-xs tracking-wider">Por qué elegir Maxymia</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">NO ES FORMACIÓN GENÉRICA</h2>
          <p className="text-white/50 text-base font-light max-w-lg ml-auto leading-relaxed">
            Maxymia está diseñado específicamente para profesionales de ciencias que necesitan dominar la IA aplicada a su campo.
          </p>
        </motion.div>

        {/* Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Left — differentiator cards */}
          <div className="space-y-5">
            {DIFFERENTIATORS.map((diff, i) => (
              <motion.div
                key={diff.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                onClick={() => setActiveCard(i)}
                className={`relative p-5 md:p-6 rounded-2xl border cursor-pointer transition-all duration-500 group ${
                  activeCard === i
                    ? 'border-mx-orange/50 bg-white/5'
                    : 'border-white/10 bg-white/[0.02] hover:border-mx-orange/30 hover:bg-white/5'
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
              </motion.div>
            ))}
          </div>

          {/* Right — image that changes on card click */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="hidden lg:block rounded-2xl overflow-hidden bg-[#0d1025] border border-white/5 aspect-4/3 sticky top-32"
          >
            {WHY_VISUALS.map((visual, i) => {
              const Icon = visual.icon;
              return (
                <motion.div
                  key={i}
                  className="absolute inset-0"
                  initial={false}
                  animate={{ opacity: activeCard === i ? 1 : 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${visual.gradient}`} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Icon size={200} strokeWidth={0.4} className={visual.accent} />
                  </div>
                </motion.div>
              );
            })}
            {/* Active indicator dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {WHY_VISUALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveCard(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    activeCard === i ? 'bg-mx-orange w-6' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── CTA SECTION ───────────────────────────────────────

function CTASection() {
  const { handleCampusClick } = useCampusLink();

  return (
    <section className="py-32 md:py-40 relative overflow-hidden border-t border-white/5 border-b border-b-white/5">
      {/* Background blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-mx-orange/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[900px] mx-auto px-6 text-center relative z-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-6"
        >
          <img src="/logo-completo.webp" alt="Maxymia" className="h-12 w-auto" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-3xl md:text-5xl font-black text-white leading-tight mb-6"
        >
          ¿LISTO PARA TRANSFORMAR <br /> <span className="text-mx-orange">TU INVESTIGACIÓN</span> <br /> CON IA?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-white/50 text-base md:text-lg font-light leading-relaxed max-w-2xl mx-auto mb-10"
        >
          Accede ahora al campus virtual. Explora nuestro catálogo completo de cursos, inscríbete en una ruta de
          aprendizaje y únete a una comunidad de científicos que ya están aplicando inteligencia artificial.
        </motion.p>

        <motion.div
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
        </motion.div>

        <motion.div
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
        </motion.div>
      </div>
    </section>
  );
}

// ─── MAIN PAGE ──────────────────────────────────────────

export default function MaxymiaClient() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#060918] text-white overflow-x-hidden relative">
      
      {/* Sub-brand banner */}
      <div className="fixed top-0 left-0 right-0 z-[60] bg-white/[0.03] backdrop-blur-sm border-b border-white/5">
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 flex items-center justify-between h-8">
          <a
            href="/"
            className="group flex items-center gap-2 text-white/30 hover:text-mx-orange transition-colors text-[11px] tracking-wide"
          >
            <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Volver a</span>
            <span className="font-medium text-white/50 group-hover:text-mx-orange transition-colors">Máxima Formación</span>
          </a>
          <span className="text-white/80 text-[10px] tracking-widest uppercase hidden md:block">Campus de IA Aplicada a Ciencias</span>
        </div>
      </div>
      <FontStyles />
      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} variant="maxymia" />

      <main className="relative z-10">
        <HeroSection />
        <FeaturesSection />
        <CoursesSection />
        <WhySection />
        <CTASection />
      </main>

      <MaxymiaFooter />
    </div>
  );
}
