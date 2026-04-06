'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { m } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Globe } from 'lucide-react';
import { FontStyles } from '../components/FontStyles';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

const ContactPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    subject: 'general'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Mensaje enviado correctamente. Te contactaremos pronto.');
  };

  return (
    <div className="min-h-screen bg-mx-bg text-mx-text overflow-x-hidden">
      <FontStyles />

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
              <span className="text-mx-orange text-body-sm font-medium tracking-[0.5em] uppercase mb-4 block">
                Atención Personalizada
              </span>
              <h1 className="text-display-sm md:text-display-md lg:text-display-lg font-black leading-[0.9] mb-12 text-mx-blue">
                ¿EN QUÉ PODEMOS <br />
                <span className="text-stroke text-mx-orange">AYUDARTE?</span>
              </h1>
            </m.div>

            <m.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 1 }}
              className="max-w-2xl text-mx-text-muted text-body-lg md:text-heading-sm font-light leading-relaxed"
            >
              Creemos en ti, llegarás hasta donde tú quieras llegar. En Máxima Formación te proporcionamos los conocimientos y las herramientas para que puedas lograrlo.
            </m.p>
          </div>
        </section>

        {/* Contact Grid */}
        <section className="py-20 px-6 md:px-12 bg-mx-card border-y border-mx-border">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20">
            {/* Form Side */}
            <m.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-heading-lg font-bold text-mx-blue tracking-tight mb-8">Escríbenos</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="contact-name" className="text-label-md uppercase tracking-widest text-mx-text-muted font-medium">Nombre Completo</label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      className="w-full bg-mx-bg border border-mx-border rounded-xl px-4 py-4 text-mx-text focus:outline-none focus:border-mx-orange transition-colors placeholder:text-mx-text-muted/50"
                      placeholder="Tu nombre..."
                      value={formState.name}
                      onChange={(e) => setFormState({...formState, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="contact-email" className="text-label-md uppercase tracking-widest text-mx-text-muted font-medium">Email Corporativo</label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      className="w-full bg-mx-bg border border-mx-border rounded-xl px-4 py-4 text-mx-text focus:outline-none focus:border-mx-orange transition-colors placeholder:text-mx-text-muted/50"
                      placeholder="tu@email.com"
                      value={formState.email}
                      onChange={(e) => setFormState({...formState, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="contact-phone" className="text-label-md uppercase tracking-widest text-mx-text-muted font-medium">Teléfono</label>
                  <input
                    id="contact-phone"
                    type="tel"
                    className="w-full bg-mx-bg border border-mx-border rounded-xl px-4 py-4 text-mx-text focus:outline-none focus:border-mx-orange transition-colors placeholder:text-mx-text-muted/50"
                    placeholder="+34 600 000 000"
                    value={formState.phone}
                    onChange={(e) => setFormState({...formState, phone: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="contact-message" className="text-label-md uppercase tracking-widest text-mx-text-muted font-medium">Mensaje</label>
                  <textarea
                    id="contact-message"
                    rows={5}
                    required
                    className="w-full bg-mx-bg border border-mx-border rounded-xl px-4 py-4 text-mx-text focus:outline-none focus:border-mx-orange transition-colors resize-none placeholder:text-mx-text-muted/50"
                    placeholder="¿Cómo podemos ayudarte?"
                    value={formState.message}
                    onChange={(e) => setFormState({...formState, message: e.target.value})}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="group w-full bg-mx-orange text-white py-5 rounded-xl font-bold text-body-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-mx-orange-dark transition-all cursor-pointer"
                >
                  Enviar Mensaje
                  <Send size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </m.div>

            {/* Info Side */}
            <m.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-10"
            >
              <div>
                <h2 className="text-heading-lg font-bold text-mx-blue tracking-tight mb-8">Vías de contacto</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-8 bg-mx-bg rounded-2xl border border-mx-border hover:border-mx-orange/30 transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-mx-orange/10 flex items-center justify-center mb-6 group-hover:bg-mx-orange group-hover:text-white text-mx-orange transition-all">
                      <Mail size={20} />
                    </div>
                    <h3 className="font-bold text-mx-text mb-2">Email</h3>
                    <p className="text-mx-text-muted text-body-sm mb-4">Para consultas generales y soporte.</p>
                    <a href="mailto:cursos@maximaformacion.es" className="text-body-sm font-medium text-mx-orange hover:underline">cursos@maximaformacion.es</a>
                  </div>

                  <div className="p-8 bg-mx-bg rounded-2xl border border-mx-border hover:border-mx-orange/30 transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-mx-orange/10 flex items-center justify-center mb-6 group-hover:bg-mx-orange group-hover:text-white text-mx-orange transition-all">
                      <Phone size={20} />
                    </div>
                    <h3 className="font-bold text-mx-text mb-2">Llámanos</h3>
                    <p className="text-mx-text-muted text-body-sm mb-4">Lunes a Viernes de 9:00 a 18:00.</p>
                    <a href="tel:+34635659391" className="text-body-sm font-medium text-mx-orange hover:underline">+34 635 65 93 91</a>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-mx-bg rounded-2xl border border-mx-border">
                <h3 className="text-heading-sm font-bold text-mx-text mb-6 flex items-center gap-3">
                  <MessageSquare className="text-mx-orange" size={20} />
                  Escríbenos si:
                </h3>
                <ul className="space-y-4">
                  {[
                    "Tienes una necesidad formativa concreta.",
                    "Eres responsable de formación de una empresa.",
                    "Quieres ampliar información sobre convocatorias.",
                    "Te ha surgido alguna duda durante el proceso.",
                    "Estás organizando un congreso o evento."
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-4 text-body-sm text-mx-text-muted">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-mx-orange shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-4">
                  {[1,2,3,4].map(avatarId => (
                    <div key={`avatar-${avatarId}`} className="w-12 h-12 rounded-full border-2 border-mx-card bg-mx-border overflow-hidden">
                      <Image src={`https://i.pravatar.cc/150?u=${avatarId+10}`} alt="Support" className="w-full h-full object-cover" width={48} height={48} unoptimized />
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-body-sm font-bold text-mx-text">Nuestro equipo está online</p>
                  <p className="text-label-md text-mx-text-muted">Respuesta media en menos de 24h</p>
                </div>
              </div>
            </m.div>
          </div>
        </section>

        {/* Map/Location Section */}
        <section className="py-20 px-6 md:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
              <div className="lg:col-span-1">
                <h2 className="text-display-sm font-black text-mx-blue mb-6 leading-heading">
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
                    <Clock className="shrink-0 text-mx-orange" />
                    <p className="text-body-sm">9:00 AM — 6:00 PM (GMT+1)</p>
                  </div>
                  <div className="flex gap-4">
                    <Globe className="shrink-0 text-mx-orange" />
                    <p className="text-body-sm">Servicio Global / 100% Online</p>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2 aspect-video bg-mx-card rounded-2xl overflow-hidden border border-mx-border relative group">
                <Image
                  src="https://pquxfbbxflqvtidtlrhl.supabase.co/storage/v1/object/public/hmac-uploads/brand/bde01d02-151f-488e-8abd-30af12bc9ef0/assets/931e7cfc-3c9f-4db2-a8aa-48a2f9ee891d.png"
                  alt="Location Map"
                  className="w-full h-full object-cover opacity-80 saturate-[0.3] group-hover:saturate-100 group-hover:opacity-100 transition-all duration-700"
                  fill
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  unoptimized
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-mx-orange flex items-center justify-center animate-pulse">
                    <MapPin className="text-white" size={32} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;
