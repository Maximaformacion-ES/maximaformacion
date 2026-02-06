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
    <section className="bg-mx-bg py-32 px-6 md:px-12">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        {items.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-10 border border-mx-border bg-mx-card hover:border-mx-orange/30 transition-colors rounded-lg"
          >
            <item.icon className="text-mx-orange mb-6" size={32} />
            <h3 className="text-mx-text text-2xl font-bold mb-4">{item.title}</h3>
            <p className="text-mx-text-muted font-light">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
