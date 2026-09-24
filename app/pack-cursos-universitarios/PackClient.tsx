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
  CheckCircle2,
  ChevronDown,
  Clock,
  GraduationCap,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { FontStyles } from '../components/FontStyles';
import { FAQSection } from '../components/FAQSection';
import { DocenteSection, type Docente } from '../components/DocenteSection';
import { PACK_FAQ_GROUPS } from './faqs';
import { ConsultaForm, PurchaseModal } from './shared';
import { MarketingHeader as Header } from '../components/MarketingHeader';
import { Footer } from '../components/Footer';
import {
  PACK_COURSES,
  PACK_INDIVIDUAL_TOTAL,
  PACK_ITEM_ID,
  PACK_PRICE,
  PACK_SAVINGS,
  PACK_TITLE,
  PACK_TOTAL_ECTS,
  PACK_TOTAL_HOURS,
  courseLandingPath,
  type PackCourse,
} from '../data/pack-cursos';

const PACK_PATH = '/pack-cursos-universitarios';

// Barra de matrícula fija inferior: aparece pasado el hero para que el CTA y
// el precio acompañen durante toda la lectura (el momento de decisión no
// siempre llega arriba). Suscripción al scroll vía useSyncExternalStore, igual
// que la tira anunciadora (sin setState síncrono en efectos).
function subscribeScroll(cb: () => void) {
  window.addEventListener('scroll', cb, { passive: true });
  return () => window.removeEventListener('scroll', cb);
}

function StickyBuyBar({ onBuy }: { onBuy: () => void }) {
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
                Pack 3 Cursos Universitarios · {PACK_TOTAL_ECTS} ECTS
              </p>
              <p className="text-[13px] text-white/75">
                <s className="text-white/50">{PACK_INDIVIDUAL_TOTAL} €</s>{' '}
                <span className="font-black text-white text-body-sm">{PACK_PRICE} €</span> · ahorras{' '}
                {PACK_SAVINGS} €
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

function CourseCard({ course, index, onBuy }: { course: PackCourse; index: number; onBuy: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <m.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="flex flex-col bg-mx-card rounded-2xl border border-mx-border hover:border-mx-orange/40 transition-all overflow-hidden"
    >
      {course.image && (
        <Image
          src={course.image}
          alt={`Portada del curso ${course.title}`}
          width={1200}
          height={675}
          sizes="(max-width: 1024px) 100vw, 33vw"
          className="w-full h-auto border-b border-mx-border"
        />
      )}
      <div className="flex flex-col flex-1 p-8">
      <span className="text-mx-orange text-label-sm font-medium tracking-[0.3em] uppercase mb-3">
        Curso Universitario
      </span>
      <h3 className="text-heading-sm font-bold text-mx-blue leading-tight mb-3">{course.title}</h3>
      <p className="text-body-sm text-mx-text-muted leading-relaxed mb-6">{course.summary}</p>

      <ul className="flex flex-wrap gap-x-5 gap-y-2 mb-6 text-body-sm text-mx-text-muted">
        <li className="flex items-center gap-2">
          <Award size={16} className="text-mx-orange" /> {course.ects} ECTS
        </li>
        <li className="flex items-center gap-2">
          <Clock size={16} className="text-mx-orange" /> {course.hours} horas
        </li>
        <li className="flex items-center gap-2">
          <GraduationCap size={16} className="text-mx-orange" /> Certificación universitaria
        </li>
      </ul>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center justify-between w-full text-left text-body-sm font-bold text-mx-text py-3 border-t border-mx-border cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <BookOpen size={16} className="text-mx-orange" /> Temario ({course.modules.length} módulos)
        </span>
        <ChevronDown size={18} className={`text-mx-text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <m.ol
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden space-y-2 text-body-sm text-mx-text-muted"
          >
            {course.modules.map((mod, i) => (
              <li key={mod} className="flex gap-3">
                <span className="text-mx-orange font-bold shrink-0 w-5 text-right">{i + 1}.</span>
                <span>{mod}</span>
              </li>
            ))}
            <li aria-hidden className="h-2" />
          </m.ol>
        )}
      </AnimatePresence>

      <div className="mt-auto pt-6 border-t border-mx-border flex items-center justify-between gap-4">
        <div>
          <p className="text-heading-sm font-black text-mx-text">{course.price} €</p>
          <p className="text-[13px] text-mx-text-muted">Curso individual</p>
        </div>
        <button
          type="button"
          onClick={onBuy}
          className="bg-mx-bg border border-mx-orange text-mx-orange px-6 py-3 rounded-xl font-bold text-label-sm uppercase tracking-widest hover:bg-mx-orange hover:text-white transition-all cursor-pointer"
        >
          Matricúlate
        </button>
      </div>
      <Link
        href={courseLandingPath(course.id)}
        className="mt-4 inline-flex items-center gap-2 text-body-sm font-bold text-mx-orange hover:underline underline-offset-4"
      >
        Ver ficha completa del curso <ArrowRight size={16} />
      </Link>
      </div>
    </m.article>
  );
}

export default function PackClient({ docentes }: { docentes?: Docente[] }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [buying, setBuying] = useState<{ item: string; title: string; price: number } | null>(null);

  const buyPack = () => setBuying({ item: PACK_ITEM_ID, title: PACK_TITLE, price: PACK_PRICE });

  return (
    <div className="min-h-screen bg-mx-bg text-mx-text overflow-x-hidden">
      <FontStyles />
      <Toaster richColors position="top-right" />
      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      <main>
        {/* Hero estilo "ficha de streaming": el banner del cliente a sangre
            completa, fundido con el fondo de la página mediante un degradado,
            y el texto entrando por debajo sobre la zona ya legible. */}
        <section className="relative pb-16 overflow-hidden">
          <div className="relative mt-[72px] sm:mt-[96px] h-[42vh] min-h-[280px] md:h-[60vh] md:min-h-[440px] max-h-[720px] w-full">
            <Image
              src="/pack/banner-pack-cursos.webp"
              alt="Pack 3 Cursos Universitarios: IA con eXeLearning, H5P e IA para Moodle, y atención educativa con SAAC"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
            {/* Fundido hacia el fondo de la página para que el texto que se
                superpone abajo sea legible sobre una zona casi lisa. */}
            <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-mx-bg via-mx-bg/70 to-transparent" />
          </div>

          <div className="relative max-w-7xl mx-auto px-6 md:px-12 -mt-20 md:-mt-32">
            <m.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-mx-orange text-label-sm md:text-label-md xl:text-label-lg font-medium tracking-[0.5em] uppercase mb-4 block">
                Formación Universitaria para Docentes
              </span>
              <h1 className="text-display-sm md:text-display-md font-black leading-heading mb-8 text-mx-blue">
                PACK 3 CURSOS <br />
                <span className="text-stroke text-mx-orange">UNIVERSITARIOS</span>
              </h1>
              <p className="max-w-3xl text-body-md text-mx-text-muted leading-relaxed mb-10">
                Tres Cursos Universitarios con certificación, pensados para llevar la innovación a tu
                aula: Inteligencia Artificial con eXeLearning, actividades interactivas con H5P e IA
                para Moodle, y atención educativa al alumnado con discapacidad motora y SAAC.
                <span className="font-bold text-mx-text"> {PACK_TOTAL_ECTS} ECTS en total con Certificado Universitario de la UCAV.</span>
              </p>
            </m.div>

            {/* Panel de oferta del pack: precio protagonista sobre azul de
                marca, con el aviso de disponibilidad integrado como pie. */}
            <m.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="relative overflow-hidden rounded-3xl bg-mx-blue text-white p-8 md:p-12"
            >
              <div className="relative flex flex-col lg:flex-row lg:items-center gap-10">
                <div className="flex-1">
                  <p className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 text-label-sm uppercase tracking-widest font-bold mb-6">
                    <Sparkles size={14} /> Oferta de lanzamiento · Pack completo
                  </p>
                  <div className="flex flex-wrap items-end gap-x-4 gap-y-2 mb-3">
                    <span className="text-heading-md text-white/50 line-through font-bold leading-none">
                      {PACK_INDIVIDUAL_TOTAL} €
                    </span>
                    <span className="text-display-sm md:text-display-md font-black leading-none">
                      {PACK_PRICE} €
                    </span>
                    <span className="bg-mx-orange text-white text-label-sm font-bold uppercase tracking-widest rounded-full px-4 py-2 mb-1">
                      Ahorras {PACK_SAVINGS} €
                    </span>
                  </div>
                  <p className="text-body-md font-bold mb-1">
                    Los tres Cursos Universitarios juntos: {PACK_TOTAL_ECTS} ECTS con certificación
                    universitaria por {PACK_PRICE} € en lugar de {PACK_INDIVIDUAL_TOTAL} €.
                  </p>
                  <p className="text-body-sm text-white/70">
                    También puedes matricularte en cada curso por separado: 95 € los cursos de IA y
                    195 € el de Atención Educativa y SAAC (6 ECTS).
                  </p>
                </div>

                <div className="shrink-0 flex flex-col items-stretch lg:items-center gap-3">
                  <button
                    type="button"
                    onClick={buyPack}
                    className="bg-mx-orange text-white px-12 py-5 rounded-xl font-bold text-label-sm md:text-label-md uppercase tracking-widest hover:bg-mx-orange-dark hover:scale-[1.02] transition-all cursor-pointer shadow-lg shadow-black/20"
                  >
                    Matricúlate en el pack
                  </button>
                  <p className="text-center text-[13px] text-white/70">
                    Pago único y seguro · Factura automática
                  </p>
                </div>
              </div>

              {/* Aviso de disponibilidad: se cobra ahora, el acceso llega después */}
              <div className="relative mt-8 pt-6 border-t border-white/15 flex items-start gap-3 text-body-sm text-white/80">
                <Mail size={18} className="shrink-0 mt-0.5 text-mx-orange" />
                <p>
                  Los cursos están en fase de lanzamiento: al completar tu compra reservas tu plaza y{' '}
                  <span className="font-bold text-white">
                    te contactaremos por email en cuanto tu acceso esté disponible
                  </span>
                  , muy pronto.
                </p>
              </div>
            </m.div>

            {/* Franja de confianza: credenciales y reducción de riesgo */}
            <m.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4"
            >
              {[
                { icon: GraduationCap, text: 'Certificación universitaria' },
                { icon: Award, text: `${PACK_TOTAL_ECTS} ECTS · ${PACK_TOTAL_HOURS} horas en total` },
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

        {/* Cursos */}
        <section className="py-16 px-6 md:px-12">
          <div className="max-w-7xl mx-auto">
            <m.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-heading-md md:text-heading-lg font-black text-mx-blue leading-heading mb-12"
            >
              LOS 3 CURSOS <span className="text-stroke text-mx-orange">DEL PACK</span>
            </m.h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
              {PACK_COURSES.map((course, i) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  index={i}
                  onBuy={() => setBuying({ item: course.id, title: course.title, price: course.price })}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Docente de los tres cursos, justo tras las tarjetas: visto el
            temario, lo siguiente es quién lo imparte. El componente no trae
            contenedor propio — en las fichas vive dentro de una columna — así
            que aquí lo alineamos con el resto de secciones. */}
        <div className="px-6 md:px-12">
          <div className="max-w-7xl mx-auto">
            <DocenteSection docentes={docentes} courseTitle={PACK_TITLE} align="center" />
          </div>
        </div>

        {/* Qué incluye / cómo funciona */}
        <section className="py-16 px-6 md:px-12">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
            <m.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-heading-sm md:text-heading-md font-black text-mx-blue leading-heading mb-6">
                QUÉ <span className="text-stroke text-mx-orange">INCLUYE</span>
              </h2>
              <ul className="space-y-4">
                {[
                  'Certificación universitaria de cada curso: 4 ECTS (100 h) los cursos de IA y 6 ECTS (150 h) el de Atención Educativa y SAAC.',
                  'Formación 100 % online, a tu ritmo, con evaluación continua.',
                  'Temario práctico y actualizado, diseñado para docentes en activo.',
                  'Factura de tu compra emitida automáticamente.',
                ].map((t) => (
                  <li key={t} className="flex gap-3 text-body-sm text-mx-text-muted leading-relaxed">
                    <CheckCircle2 size={18} className="text-mx-orange shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </m.div>
            <m.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <h2 className="text-heading-sm md:text-heading-md font-black text-mx-blue leading-heading mb-6">
                CÓMO <span className="text-stroke text-mx-orange">FUNCIONA</span>
              </h2>
              <ol className="space-y-4">
                {[
                  `Elige el pack completo (${PACK_PRICE} €) o el curso que te interese (95 € o 195 €).`,
                  'Completa el pago seguro con Stripe: recibirás la confirmación y tu factura por email.',
                  'En cuanto abramos el acceso, te contactaremos con las instrucciones para empezar. No tienes que hacer nada más.',
                ].map((t, i) => (
                  <li key={t} className="flex gap-4 text-body-sm text-mx-text-muted leading-relaxed">
                    <span className="w-8 h-8 rounded-lg bg-mx-orange/10 text-mx-orange font-black flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <span className="pt-1">{t}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-8 text-body-sm text-mx-text-muted">
                ¿Dudas antes de matricularte?{' '}
                <a href="#consulta" className="text-mx-orange font-bold">
                  Haznos tu consulta aquí abajo
                </a>{' '}
                o escríbenos a{' '}
                <a href="mailto:cursos@maximaformacion.es" className="text-mx-orange font-bold">
                  cursos@maximaformacion.es
                </a>
                .
              </p>
            </m.div>
          </div>
        </section>

        {/* Preguntas frecuentes: las 21 del documento del cliente, en pestañas
            por categoría para no convertir la página en un scroll infinito */}
        <FAQSection compact groups={PACK_FAQ_GROUPS} />

        {/* Consulta sobre el pack */}
        <section id="consulta" className="py-16 px-6 md:px-12 scroll-mt-32">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12">
            <m.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-2"
            >
              <h2 className="text-heading-sm md:text-heading-md font-black text-mx-blue leading-heading mb-6">
                ¿DUDAS SOBRE <span className="text-stroke text-mx-orange">EL PACK?</span>
              </h2>
              <p className="text-body-sm text-mx-text-muted leading-relaxed mb-6">
                Pregúntanos lo que necesites: contenidos, certificación, fechas de inicio, facturas
                para tu centro… Te respondemos por email lo antes posible.
              </p>
              <p className="flex items-center gap-3 text-body-sm text-mx-text-muted">
                <Mail size={16} className="text-mx-orange shrink-0" />
                <a href="mailto:cursos@maximaformacion.es" className="text-mx-orange font-bold">
                  cursos@maximaformacion.es
                </a>
              </p>
            </m.div>
            <m.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="lg:col-span-3 bg-mx-card border border-mx-border rounded-2xl p-8"
            >
              <ConsultaForm
                subject={PACK_TITLE}
                placeholder="Cuéntanos qué te gustaría saber sobre el pack o sobre alguno de los cursos…"
              />
            </m.div>
          </div>
        </section>

        {/* CTA final */}
        <section className="py-20 px-6 md:px-12">
          <div className="max-w-7xl mx-auto text-center">
            <m.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-heading-md md:text-heading-lg font-black text-mx-blue leading-heading mb-6">
                LOS 3 CURSOS, <span className="text-stroke text-mx-orange">UN SOLO PACK</span>
              </h2>
              <p className="text-body-md text-mx-text-muted mb-10 max-w-2xl mx-auto">
                Los tres Cursos Universitarios ({PACK_TOTAL_ECTS} ECTS) por {PACK_PRICE} € en lugar de{' '}
                {PACK_INDIVIDUAL_TOTAL} €: ahorras {PACK_SAVINGS} €.
              </p>

              {/* Los 3 cursos en versión mini (curso + curso + curso): la
                  información completa ya está en las tarjetas de arriba. */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4 mb-10">
                {PACK_COURSES.map((course, i) => (
                  <React.Fragment key={course.id}>
                    {i > 0 && (
                      <span aria-hidden className="text-heading-md font-black text-mx-orange leading-none">
                        +
                      </span>
                    )}
                    <div className="w-full max-w-xs md:w-64 bg-mx-card border border-mx-border rounded-2xl overflow-hidden text-left">
                      {course.image && (
                        <Image
                          src={course.image}
                          alt=""
                          width={1200}
                          height={675}
                          sizes="(max-width: 768px) 100vw, 256px"
                          className="w-full h-auto"
                        />
                      )}
                      <div className="px-4 py-3">
                        <p className="text-body-sm font-bold text-mx-text leading-snug">{course.shortTitle}</p>
                        <p className="text-[13px] text-mx-text-muted">{course.ects} ECTS · {course.price} €</p>
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>

              <button
                type="button"
                onClick={buyPack}
                className="bg-mx-orange text-white px-12 py-5 rounded-xl font-bold text-label-sm md:text-label-md uppercase tracking-widest hover:bg-mx-orange-dark transition-all cursor-pointer"
              >
                Matricúlate en el pack
              </button>
            </m.div>
          </div>
        </section>
      </main>

      <StickyBuyBar onBuy={buyPack} />

      <AnimatePresence>
        {buying && (
          <PurchaseModal
            item={buying.item}
            title={buying.title}
            price={buying.price}
            returnPath={PACK_PATH}
            onClose={() => setBuying(null)}
          />
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
