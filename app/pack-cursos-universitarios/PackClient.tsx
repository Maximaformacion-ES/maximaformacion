'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { m, AnimatePresence } from 'framer-motion';
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock,
  GraduationCap,
  Loader2,
  Mail,
  Sparkles,
  X,
} from 'lucide-react';
import { FontStyles } from '../components/FontStyles';
import { MarketingHeader as Header } from '../components/MarketingHeader';
import { Footer } from '../components/Footer';
import {
  COURSE_PRICE,
  PACK_COURSES,
  PACK_ITEM_ID,
  PACK_PRICE,
  PACK_TITLE,
  type PackCourse,
} from '../data/pack-cursos';

const INDIVIDUAL_TOTAL = COURSE_PRICE * PACK_COURSES.length;
const SAVINGS = INDIVIDUAL_TOTAL - PACK_PRICE;

/** Modal de compra: pedimos nombre y email ANTES de ir a Stripe porque el
 *  email es la clave de deduplicación (quien compró el pack no puede volver a
 *  comprar un curso suelto) y queda fijado como customer_email del checkout. */
function PurchaseModal({
  item,
  title,
  price,
  onClose,
}: {
  item: string;
  title: string;
  price: number;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setError(null);
    setSending(true);
    try {
      const res = await fetch('/api/pack/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item, email, name }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'No se pudo iniciar el pago. Inténtalo de nuevo.');
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar el pago.');
      setSending(false);
    }
  };

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <m.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.98 }}
        className="w-full max-w-md bg-mx-card rounded-2xl border border-mx-border p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-2">
          <h3 className="text-heading-sm font-bold text-mx-blue leading-tight">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="shrink-0 text-mx-text-muted hover:text-mx-text transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-body-sm text-mx-text-muted mb-6">
          Importe: <span className="font-bold text-mx-text">{price} €</span> · pago único y seguro con Stripe.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="pack-name" className="text-label-sm uppercase tracking-widest text-mx-text-muted font-medium">
              Nombre y apellidos
            </label>
            <input
              id="pack-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre completo"
              className="w-full bg-mx-bg border border-mx-border rounded-xl px-4 py-3 text-body-sm text-mx-text focus:outline-none focus:border-mx-orange transition-colors placeholder:text-mx-text-muted/50"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="pack-email" className="text-label-sm uppercase tracking-widest text-mx-text-muted font-medium">
              Email
            </label>
            <input
              id="pack-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full bg-mx-bg border border-mx-border rounded-xl px-4 py-3 text-body-sm text-mx-text focus:outline-none focus:border-mx-orange transition-colors placeholder:text-mx-text-muted/50"
            />
            <p className="text-[13px] text-mx-text-muted/80 leading-snug">
              Usaremos este email para confirmarte la compra y avisarte cuando tu acceso esté disponible.
            </p>
          </div>

          {error && (
            <p className="text-body-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={sending}
            className="group w-full bg-mx-orange text-white py-4 rounded-xl font-bold text-label-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-mx-orange-dark transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {sending ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Preparando el pago…
              </>
            ) : (
              <>Continuar al pago seguro</>
            )}
          </button>
        </form>
      </m.div>
    </m.div>
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
          <p className="text-heading-sm font-black text-mx-text">{COURSE_PRICE} €</p>
          <p className="text-[13px] text-mx-text-muted">Curso individual</p>
        </div>
        <button
          type="button"
          onClick={onBuy}
          className="bg-mx-bg border border-mx-orange text-mx-orange px-6 py-3 rounded-xl font-bold text-label-sm uppercase tracking-widest hover:bg-mx-orange hover:text-white transition-all cursor-pointer"
        >
          Comprar este curso
        </button>
      </div>
      </div>
    </m.article>
  );
}

export default function PackClient() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [buying, setBuying] = useState<{ item: string; title: string; price: number } | null>(null);

  const buyPack = () => setBuying({ item: PACK_ITEM_ID, title: PACK_TITLE, price: PACK_PRICE });

  return (
    <div className="min-h-screen bg-mx-bg text-mx-text overflow-x-hidden">
      <FontStyles />
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
                <span className="font-bold text-mx-text"> 4 ECTS por curso — 12 ECTS en total.</span>
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
                    <Sparkles size={14} /> Oferta de lanzamiento
                  </p>
                  <div className="flex flex-wrap items-end gap-x-4 gap-y-2 mb-3">
                    <span className="text-heading-md text-white/50 line-through font-bold leading-none">
                      {INDIVIDUAL_TOTAL} €
                    </span>
                    <span className="text-display-sm md:text-display-md font-black leading-none">
                      {PACK_PRICE} €
                    </span>
                    <span className="bg-mx-orange text-white text-label-sm font-bold uppercase tracking-widest rounded-full px-4 py-2 mb-1">
                      Ahorras {SAVINGS} €
                    </span>
                  </div>
                  <p className="text-body-md font-bold mb-1">
                    Los 3 Cursos Universitarios · 12 ECTS · certificación incluida
                  </p>
                  <p className="text-body-sm text-white/70">
                    También puedes comprar cada curso por separado por {COURSE_PRICE} €.
                  </p>
                </div>

                <div className="shrink-0 flex flex-col items-stretch lg:items-center gap-3">
                  <button
                    type="button"
                    onClick={buyPack}
                    className="bg-mx-orange text-white px-12 py-5 rounded-xl font-bold text-label-sm md:text-label-md uppercase tracking-widest hover:bg-mx-orange-dark hover:scale-[1.02] transition-all cursor-pointer shadow-lg shadow-black/20"
                  >
                    Comprar el pack
                  </button>
                  <p className="text-center text-[13px] text-white/70">Pago único y seguro con Stripe</p>
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
                  onBuy={() => setBuying({ item: course.id, title: course.title, price: COURSE_PRICE })}
                />
              ))}
            </div>
          </div>
        </section>

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
                  'Certificación universitaria de cada curso (4 ECTS, 100 horas por curso).',
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
                  'Elige el pack completo (190 €) o el curso que te interese (95 €).',
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
                ¿Dudas antes de comprar? Escríbenos a{' '}
                <a href="mailto:cursos@maximaformacion.es" className="text-mx-orange font-bold">
                  cursos@maximaformacion.es
                </a>
                .
              </p>
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
                12 ECTS POR <span className="text-stroke text-mx-orange">{PACK_PRICE} €</span>
              </h2>
              <p className="text-body-md text-mx-text-muted mb-8 max-w-2xl mx-auto">
                Los tres Cursos Universitarios por menos de lo que cuestan dos por separado.
              </p>
              <button
                type="button"
                onClick={buyPack}
                className="bg-mx-orange text-white px-12 py-5 rounded-xl font-bold text-label-sm md:text-label-md uppercase tracking-widest hover:bg-mx-orange-dark transition-all cursor-pointer"
              >
                Comprar el pack — {PACK_PRICE} €
              </button>
            </m.div>
          </div>
        </section>
      </main>

      <AnimatePresence>
        {buying && (
          <PurchaseModal
            item={buying.item}
            title={buying.title}
            price={buying.price}
            onClose={() => setBuying(null)}
          />
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
