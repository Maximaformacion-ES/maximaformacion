'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Globe, ArrowRight, X, Menu, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { FontStyles } from '../components/FontStyles';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

const ContactPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navItems = ['Conócenos', 'Másters', 'Cursos', 'Opiniones', 'Blog', 'Recursos', 'Contacto'];
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
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-white selection:text-black">
      <FontStyles />
      
      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      <main>
        {/* Hero Section */}
        <section className="relative pt-40 pb-20 px-6 md:px-12 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-white/40 text-[10px] uppercase tracking-[0.5em] mb-4 block">Atención Personalizada</span>
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.9] mb-12">
                ¿EN QUÉ PODEMOS <br />
                <span className="text-white/20">AYUDARTE?</span>
              </h1>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 1 }}
              className="max-w-2xl text-white/60 text-lg md:text-xl font-light leading-relaxed"
            >
              Creemos en ti, llegarás hasta donde tú quieras llegar. En Máxima Formación te proporcionamos los conocimientos y las herramientas para que puedas lograrlo.
            </motion.p>
          </div>
        </section>

        {/* Contact Grid */}
        <section className="py-20 px-6 md:px-12 bg-white/5 border-y border-white/10">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
            {/* Form Side */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold tracking-tight mb-8">Escríbenos</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40">Nombre Completo</label>
                    <input 
                      type="text" 
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus:outline-none focus:border-white/40 transition-colors"
                      placeholder="Tu nombre..."
                      value={formState.name}
                      onChange={(e) => setFormState({...formState, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40">Email Corporativo</label>
                    <input 
                      type="email" 
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus:outline-none focus:border-white/40 transition-colors"
                      placeholder="tu@email.com"
                      value={formState.email}
                      onChange={(e) => setFormState({...formState, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40">Teléfono</label>
                  <input 
                    type="tel" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus:outline-none focus:border-white/40 transition-colors"
                    placeholder="+34 600 000 000"
                    value={formState.phone}
                    onChange={(e) => setFormState({...formState, phone: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40">Mensaje</label>
                  <textarea 
                    rows={5}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus:outline-none focus:border-white/40 transition-colors resize-none"
                    placeholder="¿Cómo podemos ayudarte?"
                    value={formState.message}
                    onChange={(e) => setFormState({...formState, message: e.target.value})}
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  className="group w-full bg-white text-black py-5 rounded-xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white/90 transition-all"
                >
                  Enviar Mensaje
                  <Send size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </motion.div>

            {/* Info Side */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              <div>
                <h2 className="text-3xl font-bold tracking-tight mb-8">Vías de contacto</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-8 bg-white/5 rounded-2xl border border-white/10 hover:border-white/30 transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-black transition-all">
                      <Mail size={20} />
                    </div>
                    <h3 className="font-bold mb-2">Email</h3>
                    <p className="text-white/40 text-sm mb-4">Para consultas generales y soporte.</p>
                    <a href="mailto:cursos@maximaformacion.es" className="text-sm font-medium hover:underline">cursos@maximaformacion.es</a>
                  </div>

                  <div className="p-8 bg-white/5 rounded-2xl border border-white/10 hover:border-white/30 transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-black transition-all">
                      <Phone size={20} />
                    </div>
                    <h3 className="font-bold mb-2">Llámanos</h3>
                    <p className="text-white/40 text-sm mb-4">Lunes a Viernes de 9:00 a 18:00.</p>
                    <a href="tel:+34635659391" className="text-sm font-medium hover:underline">+34 635 65 93 91</a>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-white/[0.02] rounded-3xl border border-white/10">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <MessageSquare className="text-white/40" />
                  Escríbenos si:
                </h3>
                <ul className="space-y-4">
                  {[
                    "Tienes una necesidad formativa concreta.",
                    "Eres responsable de formación de una empresa.",
                    "Quieres ampliar información sobre convocatorias.",
                    "Te ha surgido alguna duda durante el proceso.",
                    "Estás organizando un congreso o evento."
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-4 text-sm text-white/60">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-white/40 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-6 pt-6">
                <div className="flex -space-x-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-12 h-12 rounded-full border-2 border-[#0a0a0a] bg-white/10 overflow-hidden">
                      <img src={`https://i.pravatar.cc/150?u=${i+10}`} alt="Support" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-bold">Nuestro equipo está online</p>
                  <p className="text-xs text-white/40">Respuesta media en menos de 24h</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Map/Location Section */}
        <section className="py-20 px-6 md:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
              <div className="lg:col-span-1">
                <h2 className="text-4xl font-black tracking-tighter mb-6">DÓNDE <br /><span className="text-white/20">ESTAMOS</span></h2>
                <div className="space-y-6 text-white/60">
                  <div className="flex gap-4">
                    <MapPin className="shrink-0 text-white" />
                    <p className="text-sm leading-relaxed">
                      Av. de la Innovación, 1, <br />
                      18016 Granada <br />
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <Clock className="shrink-0 text-white" />
                    <p className="text-sm">9:00 AM — 6:00 PM (GMT+1)</p>
                  </div>
                  <div className="flex gap-4">
                    <Globe className="shrink-0 text-white" />
                    <p className="text-sm">Servicio Global / 100% Online</p>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2 aspect-video bg-white/5 rounded-3xl overflow-hidden border border-white/10 relative group">
                <img 
                  src="https://pquxfbbxflqvtidtlrhl.supabase.co/storage/v1/object/public/hmac-uploads/brand/bde01d02-151f-488e-8abd-30af12bc9ef0/assets/931e7cfc-3c9f-4db2-a8aa-48a2f9ee891d.png" 
                  alt="Location Map" 
                  className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-700"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center animate-pulse">
                    <MapPin className="text-black" size={32} />
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
