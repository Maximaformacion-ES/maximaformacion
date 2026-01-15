'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Briefcase } from 'lucide-react';
import { Program } from '../data/programs';

interface ProgramAudienceProps {
  program: Program;
}

export const ProgramAudience: React.FC<ProgramAudienceProps> = ({ program }) => {
  return (
    <section className="py-24 md:py-32 px-6 md:px-12 bg-[#0a0a0a]">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Target Audience */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <Users className="text-amber-500" size={32} />
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                ¿PARA QUIÉN ES <span className="text-stroke">ESTE PROGRAMA?</span>
              </h2>
            </div>
            <ul className="space-y-4">
              {program.audience.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-4 text-neutral-300"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                  <span className="font-light">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Career Outcomes */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <Briefcase className="text-amber-500" size={32} />
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                SALIDAS <span className="text-stroke">PROFESIONALES</span>
              </h2>
            </div>
            <ul className="space-y-4">
              {program.careers.map((career, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-4 text-neutral-300"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                  <span className="font-light">{career}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
