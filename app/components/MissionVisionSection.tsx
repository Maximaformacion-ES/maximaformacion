'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Target, Users, ShieldCheck } from 'lucide-react';

export const MissionVisionSection: React.FC = () => {
  const items = [
    { 
      icon: Target, 
      title: "Misión", 
      desc: "Ofrecer formación online rigurosa y práctica que transforme la vida profesional de nuestros alumnos." 
    },
    { 
      icon: Users, 
      title: "Visión", 
      desc: "Ser el referente en formación especializada de habla hispana, liderando la innovación pedagógica." 
    },
    { 
      icon: ShieldCheck, 
      title: "Valores", 
      desc: "Cercanía, rigor académico, innovación constante y compromiso con el éxito del alumno." 
    },
  ];

  return (
    <section className="bg-neutral-950 py-32 px-6 md:px-12">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        {items.map((item, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-10 border border-white/5 bg-black/40 hover:border-amber-500/30 transition-colors"
          >
            <item.icon className="text-amber-500 mb-6" size={32} />
            <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
            <p className="text-neutral-400 font-light">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
