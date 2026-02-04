"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Clock } from "lucide-react";
import { Program } from "../data/programs";

interface ProgramCurriculumProps {
  program: Program;
}

export const ProgramCurriculum: React.FC<ProgramCurriculumProps> = ({
  program,
}) => {
  const [expandedModule, setExpandedModule] = useState<number | null>(0);

  return (
    <section className="py-24 md:py-32 px-6 md:px-12 bg-[#111]">
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            PLAN DE <span className="text-stroke">ESTUDIOS</span>
          </h2>
          <p className="text-neutral-400 max-w-2xl mx-auto">
            Estructura completa del programa con {program.modules.length}{" "}
            módulos especializados
          </p>
        </motion.div>

        <div className="space-y-4">
          {program.modules.map((module, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#0a0a0a] border border-white/10 overflow-hidden"
            >
              <button
                onClick={() =>
                  setExpandedModule(expandedModule === index ? null : index)
                }
                className="w-full p-6 md:p-8 flex items-center justify-between text-left hover:bg-white/5 transition-colors group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-amber-500 text-sm font-bold">
                      Módulo {index + 1}
                    </span>
                    <span className="flex items-center gap-2 text-neutral-500 text-sm">
                      <Clock size={14} />
                      {module.hours}h
                    </span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-amber-500 transition-colors">
                    {module.title}
                  </h3>
                  <p className="text-neutral-400 mt-2 font-light">
                    {module.description}
                  </p>
                </div>
                <motion.div
                  animate={{ rotate: expandedModule === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="ml-6 shrink-0"
                >
                  <ChevronDown size={24} className="text-neutral-400" />
                </motion.div>
              </button>

              <AnimatePresence>
                {expandedModule === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 md:px-6 pb-5 md:pb-6 pt-3 border-t border-white/10">
                      <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">
                        Unidades del Módulo
                      </h4>
                      <div className="grid md:grid-cols-1">
                        {module.units?.map((unit, unitIndex) => (
                          <motion.div
                            key={unitIndex}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: unitIndex * 0.05 }}
                            className="flex items-start gap-3 text-neutral-300 py-4 border-b last:border-0 border-white/10"
                          >
                            <div className="w-1 h-1 rounded-full bg-amber-500 mt-2 shrink-0" />
                            <span className="font-light text-sm">
                              {unit.title}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
