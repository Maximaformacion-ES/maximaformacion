'use client';

import React, { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Quote } from 'lucide-react';
import { StyledTitle } from './StyledTitle';

interface Testimonial {
  text: string;
  name: string;
  role: string;
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    text: "El máster en Marketing Digital transformó completamente mi carrera. En 6 meses pasé de junior a liderar el equipo de growth de una startup.",
    name: "María García",
    role: "Head of Growth @ TechStartup",
  },
  {
    text: "La metodología práctica y los profesores en activo hacen que cada clase sea aplicable directamente a tu trabajo del día a día.",
    name: "Carlos Rodríguez",
    role: "Data Scientist @ FinTech Corp",
  },
  {
    text: "Después del bootcamp de desarrollo, conseguí trabajo en menos de un mes. La bolsa de empleo de Maxima es increíble.",
    name: "Laura Martínez",
    role: "Full Stack Developer @ AgencyX",
  },
];

interface TestimonialsSectionProps {
  overline?: string;
  title?: string;
  testimonials?: Testimonial[];
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  overline = 'Lo que dicen nuestros alumnos',
  title = 'HISTORIAS {DE ÉXITO}',
  testimonials = DEFAULT_TESTIMONIALS,
}) => {
  const [current, setCurrent] = useState(0);
  const displayTestimonials = testimonials.length > 0 ? testimonials : DEFAULT_TESTIMONIALS;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % displayTestimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [displayTestimonials.length]);

  return (
    <section id="opiniones" className="relative py-24 md:py-32 bg-gradient-to-l from-mx-blue/20 to-mx-bg">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Header */}
          <div>
            <m.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-mx-orange text-sm tracking-[0.3em] uppercase mb-4"
            >
              {overline}
            </m.p>
            <m.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-mx-blue text-4xl md:text-6xl font-black tracking-tight mb-8"
            >
              <StyledTitle text={title} />
            </m.h2>

            {/* Navigation dots */}
            <div className="flex gap-3">
              {displayTestimonials.map((testimonial, i) => (
                <button
                  key={testimonial.name}
                  onClick={() => setCurrent(i)}
                  className={`w-12 h-1 rounded-full transition-all duration-300 ${
                    i === current ? 'bg-mx-orange' : 'bg-mx-border hover:bg-[#ddd]'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Right side - Testimonial */}
          <div className="relative min-h-[400px]">
            <AnimatePresence mode="wait">
              <m.div
                key={current}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="bg-mx-card rounded-3xl p-8 md:p-12 border border-mx-border shadow-sm"
              >
                <Quote size={48} className="text-mx-orange/30 mb-6" />

                <p className="text-mx-text text-xl md:text-2xl font-light leading-relaxed mb-8">
                  &ldquo;{displayTestimonials[current].text}&rdquo;
                </p>

                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-mx-orange/10 flex items-center justify-center text-mx-orange text-xl font-bold">
                    {displayTestimonials[current].name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-mx-text font-bold">{displayTestimonials[current].name}</div>
                    <div className="text-mx-text-muted text-sm">{displayTestimonials[current].role}</div>
                  </div>
                </div>
              </m.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};
