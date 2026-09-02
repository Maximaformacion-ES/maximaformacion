'use client';

import React, { useState } from 'react';
import { m } from 'framer-motion';
import { toast } from 'sonner';
import { Mail, Phone, MapPin, Send, MessageSquare, Globe } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import { FontStyles } from '../components/FontStyles';
import { MarketingHeader as Header } from '../components/MarketingHeader';
import { Footer } from '../components/Footer';

export default function ContactClient({
  courses = [],
  initialCourse,
}: {
  /** Títulos de cursos/programas (de Strapi) para el selector "¿Sobre qué curso…?". */
  courses?: string[];
  /** Curso preseleccionado vía /contacto?curso=… (desde las fichas de curso). */
  initialCourse?: string;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    subject: initialCourse || 'general'
  });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'No se pudo enviar el mensaje');
      }
      toast.success('Mensaje enviado correctamente. Te contactaremos pronto.');
      setFormState({ name: '', email: '', phone: '', message: '', subject: initialCourse || 'general' });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'No se pudo enviar el mensaje',
        { description: 'Inténtalo de nuevo o escríbenos a cursos@maximaformacion.es.' },
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-mx-bg text-mx-text overflow-x-hidden">
      <FontStyles />
      <Toaster richColors position="top-right" />

      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      <main>
        {/* Hero Section */}
        <section className="relative pt-40 pb-20 px-6 md:px-12 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <m.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-mx-orange text-label-sm md:text-label-md xl:text-label-lg font-medium tracking-[0.5em] uppercase mb-4 block">
                Atención Personalizada
              </span>
              <h1 className="text-display-sm md:text-display-md  font-black leading-heading mb-12 text-mx-blue">
                ¿EN QUÉ PODEMOS <br />
                <span className="text-stroke text-mx-orange">AYUDARTE?</span>
              </h1>
            </m.div>

            <m.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 1 }}
              className="max-w-2xl text-mx-text-muted text-body-sm md:text-body-md xl:text-body-lg font-light leading-relaxed"
            >
              Creemos en ti, llegarás hasta donde tú quieras llegar. En Máxima Formación te proporcionamos los conocimientos y las herramientas para que puedas lograrlo.
            </m.p>
          </div>
        </section>

        {/* Contact Grid */}
        <section className="py-20 px-6 md:px-12 bg-mx-card border-y border-mx-border">
          <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-2 gap-16 xl:gap-20">
            {/* Form Side */}
            <m.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-heading-sm md:text-heading-md xl:text-heading-lg font-bold text-mx-blue tracking-tight mb-8">Escríbenos</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="contact-name" className="text-label-sm md:text-label-md xl:text-label-lg uppercase tracking-widest text-mx-text-muted font-medium">Nombre Completo</label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      className="w-full bg-mx-bg border border-mx-border rounded-xl px-4 py-4 text-body-sm md:text-body-md xl:text-body-lg text-mx-text focus:outline-none focus:border-mx-orange transition-colors placeholder:text-mx-text-muted/50"
                      placeholder="Tu nombre..."
                      value={formState.name}
                      onChange={(e) => setFormState({...formState, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="contact-email" className="text-label-sm md:text-label-md xl:text-label-lg uppercase tracking-widest text-mx-text-muted font-medium">Email Corporativo</label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      className="w-full bg-mx-bg border border-mx-border rounded-xl px-4 py-4 text-body-sm md:text-body-md xl:text-body-lg text-mx-text focus:outline-none focus:border-mx-orange transition-colors placeholder:text-mx-text-muted/50"
                      placeholder="tu@email.com"
                      value={formState.email}
                      onChange={(e) => setFormState({...formState, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="contact-phone" className="text-label-sm md:text-label-md xl:text-label-lg uppercase tracking-widest text-mx-text-muted font-medium">Teléfono</label>
                  <input
                    id="contact-phone"
                    type="tel"
                    className="w-full bg-mx-bg border border-mx-border rounded-xl px-4 py-4 text-body-sm md:text-body-md text-mx-text focus:outline-none focus:border-mx-orange transition-colors placeholder:text-mx-text-muted/50"
                    placeholder="+34 600 000 000"
                    value={formState.phone}
                    onChange={(e) => setFormState({...formState, phone: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="contact-course" className="text-label-sm md:text-label-md xl:text-label-lg uppercase tracking-widest text-mx-text-muted font-medium">
                    ¿Sobre qué curso nos escribes? <span className="normal-case tracking-normal text-mx-text-muted/60">(opcional)</span>
                  </label>
                  <select
                    id="contact-course"
                    className="w-full bg-mx-bg border border-mx-border rounded-xl px-4 py-4 text-body-sm md:text-body-md text-mx-text focus:outline-none focus:border-mx-orange transition-colors cursor-pointer"
                    value={formState.subject}
                    onChange={(e) => setFormState({...formState, subject: e.target.value})}
                  >
                    <option value="general">Consulta general / otro tema</option>
                    {initialCourse && !courses.includes(initialCourse) && (
                      <option value={initialCourse}>{initialCourse}</option>
                    )}
                    {courses.map((title) => (
                      <option key={title} value={title}>{title}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="contact-message" className="text-label-sm md:text-label-md xl:text-label-lg uppercase tracking-widest text-mx-text-muted font-medium">Mensaje</label>
                  <textarea
                    id="contact-message"
                    rows={5}
                    required
                    className="w-full bg-mx-bg border border-mx-border rounded-xl px-4 py-4 text-body-sm md:text-body-md text-mx-text focus:outline-none focus:border-mx-orange transition-colors resize-none placeholder:text-mx-text-muted/50"
                    placeholder="¿Cómo podemos ayudarte?"
                    value={formState.message}
                    onChange={(e) => setFormState({...formState, message: e.target.value})}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="group w-full bg-mx-orange text-white py-5 rounded-xl font-bold text-label-sm md:text-label-md uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-mx-orange-dark transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {sending ? 'Enviando…' : 'Enviar Mensaje'}
                  <Send size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </m.div>

            {/* Info Side */}
            <m.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex flex-col gap-6"
            >
              <h2 className="text-heading-sm md:text-heading-md xl:text-heading-lg font-bold text-mx-blue tracking-tight">Vías de contacto</h2>

              <a href="mailto:cursos@maximaformacion.es" className="flex items-center gap-4 p-5 bg-mx-bg rounded-xl border border-mx-border hover:border-mx-orange/30 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-mx-orange/10 flex items-center justify-center shrink-0 group-hover:bg-mx-orange group-hover:text-white text-mx-orange transition-all">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="font-bold text-mx-text text-body-sm">Email</p>
                  <p className="text-mx-orange text-body-sm">cursos@maximaformacion.es</p>
                </div>
              </a>

              <a href="tel:+34635659391" className="flex items-center gap-4 p-5 bg-mx-bg rounded-xl border border-mx-border hover:border-mx-orange/30 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-mx-orange/10 flex items-center justify-center shrink-0 group-hover:bg-mx-orange group-hover:text-white text-mx-orange transition-all">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="font-bold text-mx-text text-body-sm">Teléfono</p>
                  <p className="text-mx-orange text-body-sm">+34 635 65 93 91</p>
                </div>
              </a>

              <div className="p-5 bg-mx-bg rounded-xl border border-mx-border mt-2">
                <p className="font-bold text-mx-text text-body-sm mb-3 flex items-center gap-2">
                  <MessageSquare className="text-mx-orange" size={16} />
                  Escríbenos si:
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                  {[
                    "Necesidad formativa concreta",
                    "Formación para empresas",
                    "Info sobre convocatorias",
                    "Dudas en el proceso",
                    "Congresos o eventos"
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-body-sm text-mx-text-muted">
                      <div className="w-1 h-1 rounded-full bg-mx-orange shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </m.div>
          </div>
        </section>

        {/* Map/Location Section */}
        <section className="py-20 px-6 md:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-12 items-center">
              <div className="xl:col-span-1">
                <h2 className="text-heading-sm md:text-heading-md xl:text-heading-lg font-black text-mx-blue mb-6 leading-heading">
                  DÓNDE <br /><span className="text-stroke text-mx-orange">ESTAMOS</span>
                </h2>
                <div className="space-y-6 text-mx-text-muted">
                  <div className="flex gap-4">
                    <MapPin className="shrink-0 text-mx-orange" />
                    <p className="text-body-sm leading-relaxed">
                      Av. de la Innovación, 1, <br />
                      18016 Granada <br />
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <Globe className="shrink-0 text-mx-orange" />
                    <p className="text-body-sm">Servicio Global / 100% Online</p>
                  </div>
                </div>
              </div>
              <div className="xl:col-span-2 aspect-video bg-mx-card rounded-2xl overflow-hidden border border-mx-border relative">
                <iframe
                  src="https://maps.google.com/maps?q=Av.+de+la+Innovaci%C3%B3n+1,+18016+Granada,+Spain&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  className="w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación de Máxima Formación"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
