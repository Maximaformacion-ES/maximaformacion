'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Award, BookOpen, Star } from 'lucide-react';

export const StatsSection: React.FC = () => {
  const stats = [
    { value: '15K+', label: 'Estudiantes formados', icon: Users },
    { value: '50+', label: 'Empresas confían en nosotros', icon: Award },
    { value: '150+', label: 'Programas activos', icon: BookOpen },
    { value: '4.9', label: 'Valoración media', icon: Star },
  ];
  
  return (
    <section className="relative py-24 md:py-32 bg-[#0a0a0a]">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              className="text-center"
            >
              <stat.icon size={28} className="text-amber-400 mx-auto mb-4" strokeWidth={1.5} />
              <div className="text-white text-4xl md:text-6xl font-black tracking-tight">{stat.value}</div>
              <div className="text-white/50 text-sm md:text-base font-light mt-2">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
