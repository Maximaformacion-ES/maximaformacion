'use client';

import React from 'react';
import { m } from 'framer-motion';
import { Users, Award, BookOpen, Star } from 'lucide-react';

interface StatsSectionProps {
  students?: string;
  bussiness?: string;
  activePrograms?: string;
  mediaRating?: string;
}

export const StatsSection: React.FC<StatsSectionProps> = ({
  students = '15K+',
  bussiness = '50+',
  activePrograms = '150+',
  mediaRating = '4.9',
}) => {
  const stats = [
    { value: students, label: 'Estudiantes formados', icon: Users },
    { value: bussiness, label: 'Empresas confían en nosotros', icon: Award },
    { value: activePrograms, label: 'Programas activos', icon: BookOpen },
    { value: mediaRating, label: 'Valoración media', icon: Star },
  ];

  return (
    <section className="relative -mt-20 pt-0 pb-12 md:pb-12 bg-mx-bg">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, i) => (
            <m.div
              key={stat.label}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              className="text-center"
            >
              <stat.icon size={28} className="text-mx-orange mx-auto mb-4" strokeWidth={1.5} />
              <div className="text-mx-orange text-display-sm md:text-display-md font-black tracking-display leading-display">{stat.value}</div>
              <div className="text-mx-orange-dark text-body-sm font-light mt-2 leading-label">{stat.label}</div>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
};
