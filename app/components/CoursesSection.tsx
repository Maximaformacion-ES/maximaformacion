'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { CourseCard, Course } from './CourseCard';

const courses: Course[] = [
  {
    title: "Máster en Marketing Digital y Growth Hacking",
    description: "Domina las estrategias más avanzadas de adquisición y retención de usuarios",
    category: "Marketing",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    rating: 4.9,
    students: "2.4K",
    price: 1499,
    originalPrice: 2499,
  },
  {
    title: "Programa Ejecutivo en Data Science & AI",
    description: "Machine Learning, Deep Learning y análisis predictivo para el mundo real",
    category: "Tecnología",
    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80",
    rating: 4.8,
    students: "1.8K",
    price: 1899,
    originalPrice: 2999,
  },
  {
    title: "MBA Online en Dirección de Empresas",
    description: "Liderazgo estratégico y gestión empresarial para directivos del siglo XXI",
    category: "Business",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
    rating: 4.9,
    students: "3.1K",
    price: 2499,
    originalPrice: 3999,
  },
  {
    title: "Especialización en UX/UI Design",
    description: "Crea experiencias digitales memorables con metodologías centradas en el usuario",
    category: "Diseño",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
    rating: 4.7,
    students: "1.5K",
    price: 999,
    originalPrice: 1799,
  },
  {
    title: "Bootcamp Full Stack Development",
    description: "De cero a desarrollador profesional en 6 meses intensivos",
    category: "Tecnología",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80",
    rating: 4.8,
    students: "2.9K",
    price: 1299,
    originalPrice: 2199,
  },
  {
    title: "Máster en Finanzas Corporativas",
    description: "Análisis financiero avanzado, valoración de empresas y M&A",
    category: "Finanzas",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
    rating: 4.9,
    students: "1.2K",
    price: 1799,
    originalPrice: 2899,
  },
];

export const CoursesSection: React.FC = () => {
  return (
    <section id="masters" className="relative py-24 md:py-32 bg-[#0a0a0a]">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-amber-400 text-sm tracking-[0.3em] uppercase mb-4"
            >
              Programas Destacados
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-white text-4xl md:text-6xl lg:text-7xl font-black tracking-tight"
            >
              MÁSTERS &<br />
              <span className="text-stroke">ESPECIALIZACIONES</span>
            </motion.h2>
          </div>
          
          <motion.a
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            href="#all-courses"
            className="mt-8 md:mt-0 flex items-center gap-2 text-white/60 hover:text-white transition-colors group"
          >
            Ver todos los programas
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </motion.a>
        </div>
        
        {/* Course Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {courses.map((course, i) => (
            <CourseCard key={course.title} course={course} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};
