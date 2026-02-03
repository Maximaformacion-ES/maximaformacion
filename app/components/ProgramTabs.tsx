'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Clock, Users, Briefcase, Target, BookOpen } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { Program } from '@/lib/strapi/types';

interface ProgramTabsProps {
  program: Program;
}

export const ProgramTabs: React.FC<ProgramTabsProps> = ({ program }) => {
  const [expandedModule, setExpandedModule] = useState<number | null>(0);

  return (
    <Tabs defaultValue="descripcion">
      <TabsList
        variant="line"
        className="w-full flex-wrap gap-0 border-b border-white/10 bg-transparent h-auto p-0"
      >
        <TabsTrigger
          value="descripcion"
          className="text-white/50 hover:text-amber-400 data-[state=active]:text-amber-500 data-[state=active]:border-transparent rounded-none px-4 py-3 text-sm font-medium after:bg-amber-500"
        >
          <BookOpen className="size-4 mr-1.5 hidden sm:inline-block" />
          Descripción
        </TabsTrigger>
        <TabsTrigger
          value="temario"
          className="text-white/50 hover:text-amber-400 data-[state=active]:text-amber-500 data-[state=active]:border-transparent rounded-none px-4 py-3 text-sm font-medium after:bg-amber-500"
        >
          Temario
        </TabsTrigger>
        {program.objectives && program.objectives.length > 0 && (
          <TabsTrigger
            value="objetivos"
            className="text-white/50 hover:text-amber-400 data-[state=active]:text-amber-500 data-[state=active]:border-transparent rounded-none px-4 py-3 text-sm font-medium after:bg-amber-500"
          >
            <Target className="size-4 mr-1.5 hidden sm:inline-block" />
            Objetivos
          </TabsTrigger>
        )}
        {program.audience && program.audience.length > 0 && (
          <TabsTrigger
            value="audiencia"
            className="text-white/50 hover:text-amber-400 data-[state=active]:text-amber-500 data-[state=active]:border-transparent rounded-none px-4 py-3 text-sm font-medium after:bg-amber-500"
          >
            <Users className="size-4 mr-1.5 hidden sm:inline-block" />
            A quién va dirigido
          </TabsTrigger>
        )}
        {program.careers && program.careers.length > 0 && (
          <TabsTrigger
            value="salidas"
            className="text-white/50 hover:text-amber-400 data-[state=active]:text-amber-500 data-[state=active]:border-transparent rounded-none px-4 py-3 text-sm font-medium after:bg-amber-500"
          >
            <Briefcase className="size-4 mr-1.5 hidden sm:inline-block" />
            Salidas profesionales
          </TabsTrigger>
        )}
      </TabsList>

      {/* Descripción */}
      <TabsContent value="descripcion" className="pt-10 md:pt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-lg text-neutral-400 font-light leading-relaxed">
            {program.longDescription}
          </p>
        </motion.div>
      </TabsContent>

      {/* Temario */}
      <TabsContent value="temario" className="pt-10 md:pt-12">
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
      </TabsContent>

      {/* Objetivos */}
      <TabsContent value="objetivos" className="pt-10 md:pt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
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
      </TabsContent>

      {/* A quién va dirigido */}
      <TabsContent value="audiencia" className="pt-10 md:pt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
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
      </TabsContent>

      {/* Salidas profesionales */}
      <TabsContent value="salidas" className="pt-10 md:pt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
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
      </TabsContent>
    </Tabs>
  );
};
