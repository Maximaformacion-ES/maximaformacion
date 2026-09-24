'use client';

import React, { useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { m, AnimatePresence } from 'framer-motion';
import { Toaster } from '@/components/ui/sonner';
import {
  ArrowRight,
  Award,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Clock,
  FlaskConical,
  GraduationCap,
  Mail,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { FontStyles } from '@/app/components/FontStyles';
import { FAQSection } from '@/app/components/FAQSection';
import { DocenteSection, type Docente } from '@/app/components/DocenteSection';
import { MarketingHeader as Header } from '@/app/components/MarketingHeader';
import { Footer } from '@/app/components/Footer';
import { PACK_FAQ_GROUPS } from '@/app/pack-cursos-universitarios/faqs';
import { ConsultaForm, PurchaseModal } from '@/app/pack-cursos-universitarios/shared';
import {
  PACK_COURSES,
  PACK_INDIVIDUAL_TOTAL,
  PACK_PRICE,
  PACK_SAVINGS,
  PACK_TOTAL_ECTS,
  courseLandingPath,
  type PackCourse,
} from '@/app/data/pack-cursos';

const PACK_PATH = '/pack-cursos-universitarios';

function subscribeScroll(cb: () => void) {
  window.addEventListener('scroll', cb, { passive: true });
  return () => window.removeEventListener('scroll', cb);
}

// Barra de matrícula fija inferior (misma lógica que en la landing del pack).
function StickyBuyBar({ course, onBuy }: { course: PackCourse; onBuy: () => void }) {
  const visible = useSyncExternalStore(
    subscribeScroll,
    () => window.scrollY > 700,
    () => false,
  );
  return (
    <AnimatePresence>
      {visible && (
        <m.div
          initial={{ y: 96 }}
          animate={{ y: 0 }}
          exit={{ y: 96 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 inset-x-0 z-40 bg-mx-blue text-white shadow-[0_-4px_24px_rgba(0,0,0,0.18)]"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-3 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-body-sm font-bold truncate">
                {course.shortTitle} · {course.ects} ECTS
              </p>
              <p className="text-[13px] text-white/75">
                <span className="font-black text-white text-body-sm">{course.price} €</span> · Certificado
                Universitario UCAV
              </p>
            </div>
            <button
              type="button"
              onClick={onBuy}
              className="shrink-0 bg-mx-orange text-white px-6 sm:px-10 py-3 rounded-xl font-bold text-label-sm uppercase tracking-widest hover:bg-mx-orange-dark transition-all cursor-pointer"
            >
              Matricúlate
            </button>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8 },
} as const;

export default function CursoClient({ course, docentes }: { course: PackCourse; docentes?: Docente[] }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [buying, setBuying] = useState(false);
  const landing = course.landing;
  const otherCourses = PACK_COURSES.filter((c) => c.id !== course.id);
  const returnPath = courseLandingPath(course.id);

  return (
    <div className="min-h-screen bg-mx-bg text-mx-text overflow-x-hidden">
      <FontStyles />
      <Toaster richColors position="top-right" />
      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      <main>
        {/* Hero: portada del curso a sangre, fundida con el fondo, y el texto
            entrando por debajo (mismo patrón que la landing del pack). */}
        <section className="relative pb-16 overflow-hidden">
          <div className="relative mt-[72px] sm:mt-[96px] h-[42vh] min-h-[280px] md:h-[56vh] md:min-h-[420px] max-h-[680px] w-full">
            {course.image && (
              <Image
                src={course.image}
                alt={`Portada del curso ${course.title}`}
                fill
                priority
                sizes="100vw"
                className="object-cover object-center"
              />
            )}
            <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-mx-bg via-mx-bg/70 to-transparent" />
          </div>

          <div className="relative max-w-7xl mx-auto px-6 md:px-12 -mt-20 md:-mt-32">
            <m.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <span className="text-mx-orange text-label-sm md:text-label-md xl:text-label-lg font-medium tracking-[0.5em] uppercase mb-4 block">
                {landing?.eyebrow ?? `Curso Universitario · ${course.ects} ECTS · UCAV`}
              </span>
              <h1 className="max-w-5xl text-heading-lg md:text-display-sm font-black leading-heading mb-6 text-mx-blue">
                {course.title}
              </h1>
              <p className="max-w-3xl text-body-md text-mx-text-muted leading-relaxed mb-10">
                {landing?.tagline ?? course.summary}
              </p>
            </m.div>

            {/* Panel de matrícula: precio protagonista sobre azul de marca */}
            <m.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="relative overflow-hidden rounded-3xl bg-mx-blue text-white p-8 md:p-12"
            >
              <div className="relative flex flex-col lg:flex-row lg:items-center gap-10">
                <div className="flex-1">
                  <p className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 text-label-sm uppercase tracking-widest font-bold mb-6">
                    <GraduationCap size={14} /> Matrícula abierta · inicio 5 de octubre de 2026
                  </p>
                  <div className="flex flex-wrap items-end gap-x-4 gap-y-2 mb-3">
                    <span className="text-display-sm md:text-display-md font-black leading-none">
                      {course.price} €
                    </span>
                    <span className="bg-mx-orange text-white text-label-sm font-bold uppercase tracking-widest rounded-full px-4 py-2 mb-1">
                      {course.ects} ECTS · {course.hours} h
                    </span>
                  </div>
                  <p className="text-body-md font-bold mb-1">
                    Certificado Universitario de la Universidad Católica de Ávila (UCAV).
                  </p>
                  <p className="text-body-sm text-white/70">
                    Pago único · 100 % online, a tu ritmo · Factura automática.
                  </p>
                </div>

                <div className="shrink-0 flex flex-col items-stretch lg:items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setBuying(true)}
                    className="bg-mx-orange text-white px-12 py-5 rounded-xl font-bold text-label-sm md:text-label-md uppercase tracking-widest hover:bg-mx-orange-dark hover:scale-[1.02] transition-all cursor-pointer shadow-lg shadow-black/20"
                  >
                    Matricúlate ahora
                  </button>
                  <p className="text-center text-[13px] text-white/70">Pago seguro con Stripe</p>
                </div>
              </div>

              {/* Se cobra ahora, el acceso llega después */}
              <div className="relative mt-8 pt-6 border-t border-white/15 flex items-start gap-3 text-body-sm text-white/80">
                <Mail size={18} className="shrink-0 mt-0.5 text-mx-orange" />
                <p>
                  El curso está en fase de lanzamiento: al completar tu compra reservas tu plaza y{' '}
                  <span className="font-bold text-white">
                    te contactaremos por email en cuanto tu acceso esté disponible
                  </span>
                  , muy pronto.
                </p>
              </div>
            </m.div>

            <m.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4"
            >
              {[
                { icon: GraduationCap, text: 'Certificado Universitario UCAV' },
                { icon: Award, text: `${course.ects} ECTS · ${course.hours} horas` },
                { icon: Clock, text: '100 % online, a tu ritmo' },
                { icon: ShieldCheck, text: 'Pago seguro y factura automática' },
              ].map((item) => (
                <li key={item.text} className="flex items-center gap-3 text-body-sm text-mx-text-muted">
                  <item.icon size={18} className="text-mx-orange shrink-0" />
                  <span>{item.text}</span>
                </li>
              ))}
            </m.ul>
          </div>
        </section>

        {/* Bloque de la plaza / convocatoria (solo si el curso lo trae) */}
        {landing?.plaza && (
          <section className="py-8 px-6 md:px-12">
            <div className="max-w-7xl mx-auto">
              <m.div
                {...fadeUp}
                className="rounded-3xl border border-mx-orange/40 bg-mx-orange/5 p-8 md:p-12 grid grid-cols-1 lg:grid-cols-5 gap-10"
              >
                <div className="lg:col-span-3">
                  <p className="inline-flex items-center gap-2 text-mx-orange text-label-sm font-bold uppercase tracking-widest mb-4">
                    <Briefcase size={16} /> Oposiciones y plazas docentes
                  </p>
                  <h2 className="text-heading-sm md:text-heading-md font-black text-mx-blue leading-heading mb-4">
                    {landing.plaza.title}
                  </h2>
                  <p className="text-body-sm md:text-body-md text-mx-text-muted leading-relaxed">
                    {landing.plaza.intro}
                  </p>
                  {landing.plaza.details.length > 0 && (
                    <ul className="mt-6 space-y-2">
                      {landing.plaza.details.map((d) => (
                        <li key={d} className="flex gap-3 text-body-sm text-mx-text leading-relaxed">
                          <ArrowRight size={16} className="text-mx-orange shrink-0 mt-1" />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <ul className="lg:col-span-2 space-y-4 self-center">
                  {landing.plaza.points.map((t) => (
                    <li key={t} className="flex gap-3 text-body-sm text-mx-text leading-relaxed">
                      <CheckCircle2 size={18} className="text-mx-orange shrink-0 mt-0.5" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </m.div>
            </div>
          </section>
        )}

        {/* Qué vas a aprender + a quién va dirigido */}
        <section className="py-16 px-6 md:px-12">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
            <m.div {...fadeUp}>
              <h2 className="text-heading-sm md:text-heading-md font-black text-mx-blue leading-heading mb-6">
                QUÉ VAS A <span className="text-stroke text-mx-orange">APRENDER</span>
              </h2>
              <p className="text-body-sm md:text-body-md text-mx-text-muted leading-relaxed mb-6">{course.summary}</p>
              <ul className="space-y-4">
                {[
                  `Certificado Universitario "${course.certificate}".`,
                  `${course.ects} créditos ECTS (${course.hours} horas de trabajo del estudiante) en ${course.modules.length} módulos con evaluación continua.`,
                  'Formación 100 % online y a distancia, a tu ritmo, con tutorías.',
                  'Factura de tu compra emitida automáticamente.',
                ].map((t) => (
                  <li key={t} className="flex gap-3 text-body-sm text-mx-text-muted leading-relaxed">
                    <CheckCircle2 size={18} className="text-mx-orange shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </m.div>
            {landing?.audience && (
              <m.div {...fadeUp} transition={{ duration: 0.8, delay: 0.1 }}>
                <h2 className="text-heading-sm md:text-heading-md font-black text-mx-blue leading-heading mb-6">
                  A QUIÉN VA <span className="text-stroke text-mx-orange">DIRIGIDO</span>
                </h2>
                <ul className="space-y-4">
                  {landing.audience.map((t) => (
                    <li key={t} className="flex gap-3 text-body-sm text-mx-text-muted leading-relaxed">
                      <Users size={18} className="text-mx-orange shrink-0 mt-0.5" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </m.div>
            )}
          </div>
        </section>

        {/* Temario */}
        <section className="py-16 px-6 md:px-12">
          <div className="max-w-7xl mx-auto">
            <m.h2
              {...fadeUp}
              className="text-heading-md md:text-heading-lg font-black text-mx-blue leading-heading mb-4"
            >
              TEMARIO <span className="text-stroke text-mx-orange">DEL CURSO</span>
            </m.h2>
            <p className="text-body-sm text-mx-text-muted mb-12">
              {course.modules.length} módulos · {course.ects} ECTS · {course.hours} horas
            </p>
            <ol className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(course.moduleDetails ?? course.modules.map((title) => ({ title, theory: '', practice: '' }))).map(
                (mod, i) => (
                  <m.li
                    key={mod.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: (i % 2) * 0.1 }}
                    className="bg-mx-card border border-mx-border rounded-2xl p-6 md:p-8 flex gap-5"
                  >
                    <span className="w-10 h-10 rounded-xl bg-mx-orange/10 text-mx-orange font-black flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-body-md font-bold text-mx-blue leading-snug mb-3">{mod.title}</h3>
                      {mod.theory && (
                        <p className="flex gap-2 text-body-sm text-mx-text-muted leading-relaxed mb-2">
                          <BookOpen size={16} className="text-mx-orange shrink-0 mt-1" />
                          <span>{mod.theory}</span>
                        </p>
                      )}
                      {mod.practice && (
                        <p className="flex gap-2 text-body-sm text-mx-text-muted leading-relaxed">
                          <FlaskConical size={16} className="text-mx-orange shrink-0 mt-1" />
                          <span>
                            <span className="font-bold text-mx-text">Práctica: </span>
                            {mod.practice}
                          </span>
                        </p>
                      )}
                    </div>
                  </m.li>
                ),
              )}
            </ol>
          </div>
        </section>

        {/* Docente */}
        <div className="px-6 md:px-12">
          <div className="max-w-7xl mx-auto">
            <DocenteSection docentes={docentes} courseTitle={course.title} align="center" />
          </div>
        </div>

        {/* Cross-sell del pack: los otros dos cursos + ahorro */}
        <section className="py-16 px-6 md:px-12">
          <div className="max-w-7xl mx-auto rounded-3xl bg-mx-card border border-mx-border p-8 md:p-12">
            <m.div {...fadeUp} className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-center">
              <div className="lg:col-span-3">
                <p className="text-mx-orange text-label-sm font-bold uppercase tracking-widest mb-3">
                  ¿Te interesa más de uno?
                </p>
                <h2 className="text-heading-sm md:text-heading-md font-black text-mx-blue leading-heading mb-4">
                  Pack 3 Cursos Universitarios: {PACK_TOTAL_ECTS} ECTS por {PACK_PRICE} €
                </h2>
                <p className="text-body-sm md:text-body-md text-mx-text-muted leading-relaxed mb-6">
                  Este curso junto con{' '}
                  {otherCourses.map((c, i) => (
                    <React.Fragment key={c.id}>
                      {i > 0 && ' y '}
                      <Link href={courseLandingPath(c.id)} className="font-bold text-mx-text hover:text-mx-orange">
                        {c.shortTitle}
                      </Link>
                    </React.Fragment>
                  ))}
                  , por {PACK_PRICE} € en lugar de {PACK_INDIVIDUAL_TOTAL} €: ahorras {PACK_SAVINGS} €.
                </p>
                <Link
                  href={PACK_PATH}
                  className="inline-flex items-center gap-2 bg-mx-bg border border-mx-orange text-mx-orange px-8 py-4 rounded-xl font-bold text-label-sm uppercase tracking-widest hover:bg-mx-orange hover:text-white transition-all"
                >
                  Ver el pack <ArrowRight size={16} />
                </Link>
              </div>
              <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                {otherCourses.map((c) => (
                  <Link
                    key={c.id}
                    href={courseLandingPath(c.id)}
                    className="bg-mx-bg border border-mx-border hover:border-mx-orange/50 rounded-2xl overflow-hidden transition-colors"
                  >
                    {c.image && (
                      <Image src={c.image} alt="" width={1200} height={675} sizes="240px" className="w-full h-auto" />
                    )}
                    <div className="px-4 py-3">
                      <p className="text-body-sm font-bold text-mx-text leading-snug">{c.shortTitle}</p>
                      <p className="text-[13px] text-mx-text-muted">
                        {c.ects} ECTS · {c.price} €
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </m.div>
          </div>
        </section>

        <FAQSection compact groups={PACK_FAQ_GROUPS} />

        {/* Consulta */}
        <section id="consulta" className="py-16 px-6 md:px-12 scroll-mt-32">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12">
            <m.div {...fadeUp} className="lg:col-span-2">
              <h2 className="text-heading-sm md:text-heading-md font-black text-mx-blue leading-heading mb-6">
                ¿DUDAS SOBRE <span className="text-stroke text-mx-orange">EL CURSO?</span>
              </h2>
              <p className="text-body-sm text-mx-text-muted leading-relaxed mb-6">
                Pregúntanos lo que necesites: contenidos, certificación, validez para tu convocatoria,
                fechas de inicio, facturas para tu centro… Te respondemos por email lo antes posible.
              </p>
              <p className="flex items-center gap-3 text-body-sm text-mx-text-muted">
                <Mail size={16} className="text-mx-orange shrink-0" />
                <a href="mailto:cursos@maximaformacion.es" className="text-mx-orange font-bold">
                  cursos@maximaformacion.es
                </a>
              </p>
            </m.div>
            <m.div
              {...fadeUp}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="lg:col-span-3 bg-mx-card border border-mx-border rounded-2xl p-8"
            >
              <ConsultaForm
                subject={course.title}
                placeholder="Cuéntanos qué te gustaría saber sobre el curso…"
              />
            </m.div>
          </div>
        </section>

        {/* CTA final */}
        <section className="py-20 px-6 md:px-12">
          <div className="max-w-7xl mx-auto text-center">
            <m.div {...fadeUp}>
              <h2 className="text-heading-md md:text-heading-lg font-black text-mx-blue leading-heading mb-6">
                RESERVA <span className="text-stroke text-mx-orange">TU PLAZA</span>
              </h2>
              <p className="text-body-md text-mx-text-muted mb-10 max-w-2xl mx-auto">
                {course.shortTitle}: {course.ects} ECTS con Certificado Universitario UCAV por {course.price} €.
              </p>
              <button
                type="button"
                onClick={() => setBuying(true)}
                className="bg-mx-orange text-white px-12 py-5 rounded-xl font-bold text-label-sm md:text-label-md uppercase tracking-widest hover:bg-mx-orange-dark transition-all cursor-pointer"
              >
                Matricúlate ahora
              </button>
            </m.div>
          </div>
        </section>
      </main>

      <StickyBuyBar course={course} onBuy={() => setBuying(true)} />

      <AnimatePresence>
        {buying && (
          <PurchaseModal
            item={course.id}
            title={course.title}
            price={course.price}
            returnPath={returnPath}
            onClose={() => setBuying(false)}
          />
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
