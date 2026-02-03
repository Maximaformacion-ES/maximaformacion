'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Clock, Users, Briefcase, Target, BookOpen } from 'lucide-react';
import type { Program } from '@/lib/strapi/types';
import type { LucideIcon } from 'lucide-react';

interface ProgramTabsProps {
  program: Program;
}

interface TabDef {
  value: string;
  label: string;
  icon?: LucideIcon;
}

export const ProgramTabs: React.FC<ProgramTabsProps> = ({ program }) => {
  const [expandedModule, setExpandedModule] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState('descripcion');

  const tabs = useMemo<TabDef[]>(() => {
    const t: TabDef[] = [
      { value: 'descripcion', label: 'Descripción', icon: BookOpen },
      { value: 'temario', label: 'Temario' },
    ];
    if (program.objectives?.length) t.push({ value: 'objetivos', label: 'Objetivos', icon: Target });
    if (program.audience?.length) t.push({ value: 'audiencia', label: 'A quién va dirigido', icon: Users });
    if (program.careers?.length) t.push({ value: 'salidas', label: 'Salidas profesionales', icon: Briefcase });
    return t;
  }, [program.objectives, program.audience, program.careers]);

  return (
    <div>
      {/* Tab bar */}
      <div className="relative flex border-b border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`relative flex-1 px-2 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? 'text-amber-500'
                : 'text-white/50 hover:text-amber-400'
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              {tab.icon && <tab.icon className="size-4 hidden sm:inline-block" />}
              {tab.label}
            </span>
            {activeTab === tab.value && (
              <motion.div
                layoutId="tab-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Descripción */}
      {/* Tab content */}
      <div className="pt-10 md:pt-12">
        <AnimatePresence mode="wait">
          {activeTab === 'descripcion' && (
            <motion.div
              key="descripcion"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <p className="text-lg text-neutral-400 font-light leading-relaxed">
                {program.longDescription}
              </p>
            </motion.div>
          )}

          {activeTab === 'temario' && (
            <motion.div
              key="temario"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <div className="mb-4 text-neutral-400 text-sm">
                {program.modules.length} módulos especializados
              </div>
              <div className="space-y-3">
                {program.modules.map((module, index) => (
                  <div
                    key={index}
                    className="bg-[#111] border border-white/10 overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedModule(expandedModule === index ? null : index)}
                      className="w-full p-5 md:p-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors group"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-amber-500 text-xs font-bold">Módulo {index + 1}</span>
                          <span className="flex items-center gap-1.5 text-neutral-500 text-xs">
                            <Clock size={12} />
                            {module.hours}h
                          </span>
                        </div>
                        <h3 className="text-base md:text-lg font-bold text-white group-hover:text-amber-500 transition-colors">
                          {module.title}
                        </h3>
                        <p className="text-neutral-400 mt-1 text-sm font-light">{module.description}</p>
                      </div>
                      <motion.div
                        animate={{ rotate: expandedModule === index ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="ml-4 shrink-0"
                      >
                        <ChevronDown size={20} className="text-neutral-400" />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {expandedModule === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 md:px-6 pb-5 md:pb-6 pt-3 border-t border-white/10">
                            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">
                              Temas del Módulo
                            </h4>
                            <div className="grid md:grid-cols-2 gap-2">
                              {module.topics.map((topic, topicIndex) => (
                                <motion.div
                                  key={topicIndex}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: topicIndex * 0.05 }}
                                  className="flex items-start gap-3 text-neutral-300"
                                >
                                  <div className="w-1 h-1 rounded-full bg-amber-500 mt-2 shrink-0" />
                                  <span className="font-light text-sm">{topic}</span>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'objetivos' && (
            <motion.div
              key="objetivos"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <div className="grid md:grid-cols-2 gap-4">
                {program.objectives?.map((objective, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 text-neutral-300"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                    <span className="font-light">{objective}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'audiencia' && (
            <motion.div
              key="audiencia"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <ul className="space-y-4">
                {program.audience?.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-4 text-neutral-300"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                    <span className="font-light">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {activeTab === 'salidas' && (
            <motion.div
              key="salidas"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <ul className="space-y-4">
                {program.careers?.map((career, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-4 text-neutral-300"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                    <span className="font-light">{career}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
