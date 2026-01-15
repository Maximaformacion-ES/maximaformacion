'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "El máster en Marketing Digital transformó completamente mi carrera. En 6 meses pasé de junior a liderar el equipo de growth de una startup.",
    author: "María García",
    role: "Head of Growth @ TechStartup",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
  },
  {
    quote: "La metodología práctica y los profesores en activo hacen que cada clase sea aplicable directamente a tu trabajo del día a día.",
    author: "Carlos Rodríguez",
    role: "Data Scientist @ FinTech Corp",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
  },
  {
    quote: "Después del bootcamp de desarrollo, conseguí trabajo en menos de un mes. La bolsa de empleo de Maxima es increíble.",
    author: "Laura Martínez",
    role: "Full Stack Developer @ AgencyX",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
  },
];

export const TestimonialsSection: React.FC = () => {
  const [current, setCurrent] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);
  
  return (
    <section id="opiniones" className="relative py-24 md:py-32 bg-[#111]">
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-amber-500/5 to-transparent" />
      
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Header */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-amber-400 text-sm tracking-[0.3em] uppercase mb-4"
            >
              Lo que dicen nuestros alumnos
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-white text-4xl md:text-6xl font-black tracking-tight mb-8"
            >
              HISTORIAS<br />
              <span className="text-stroke">DE ÉXITO</span>
            </motion.h2>
            
            {/* Navigation dots */}
            <div className="flex gap-3">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-12 h-1 rounded-full transition-all duration-300 ${
                    i === current ? 'bg-amber-400' : 'bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
          
          {/* Right side - Testimonial */}
          <div className="relative min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="bg-[#1a1a1a] rounded-3xl p-8 md:p-12"
              >
                <Quote size={48} className="text-amber-400/30 mb-6" />
                
                <p className="text-white text-xl md:text-2xl font-light leading-relaxed mb-8">
                  "{testimonials[current].quote}"
                </p>
                
                <div className="flex items-center gap-4">
                  <img
                    src={testimonials[current].image}
                    alt={testimonials[current].author}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div>
                    <div className="text-white font-bold">{testimonials[current].author}</div>
                    <div className="text-white/50 text-sm">{testimonials[current].role}</div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};
