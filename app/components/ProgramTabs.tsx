'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Clock, Users, Briefcase, Target, BookOpen, ListOrdered } from 'lucide-react';
import type { Program } from '@/lib/strapi/types';
import type { LucideIcon } from 'lucide-react';
import { markdownToHtml } from '@/lib/markdown';

// Component to render markdown content with consistent styling
function MarkdownContent({ content, className = '' }: { content: string; className?: string }) {
  const [html, setHtml] = useState<string>('');

  useEffect(() => {
    if (content) {
      markdownToHtml(content).then(setHtml);
    }
  }, [content]);

  if (!html) return null;

  return (
    <div
      className={`markdown-content ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

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

  // Debug: log program data to see what's coming from Strapi
  useEffect(() => {
    console.log('ProgramTabs - program data:', {
      title: program.title,
      topics: program.topics,
      audience: program.audience,
      objectives: program.objectives,
      careers: program.careers,
    });
  }, [program]);

  const tabs = useMemo<TabDef[]>(() => {
    const t: TabDef[] = [
      { value: 'descripcion', label: 'Descripción', icon: BookOpen },
      { value: 'temario', label: 'Temario', icon: ListOrdered },
    ];
    if (program.objectives) t.push({ value: 'objetivos', label: 'Objetivos', icon: Target });
    if (program.audience) t.push({ value: 'audiencia', label: 'A quién va dirigido', icon: Users });
    if (program.careers) t.push({ value: 'salidas', label: 'Salidas profesionales', icon: Briefcase });
    return t;
  }, [program.objectives, program.audience, program.careers]);

  return (
    <div>
      {/* Tab bar */}
      <div className="relative flex border-b border-white/10 lg:gap-12 w-full">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`relative px-2 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? 'text-amber-500'
                : 'text-white/50 hover:text-amber-400'
            }`}
          >
            <span className="flex items-center gap-2">
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
              <MarkdownContent
                content={program.objectives}
                className="text-neutral-300 font-light [&_ul]:space-y-4 [&_li]:flex [&_li]:items-start [&_li]:gap-4 [&_li]:before:content-[''] [&_li]:before:w-1.5 [&_li]:before:h-1.5 [&_li]:before:rounded-full [&_li]:before:bg-amber-500 [&_li]:before:mt-2 [&_li]:before:shrink-0 [&_ul]:list-none [&_ul]:pl-0 [&_p]:mb-4"
              />
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
              <MarkdownContent
                content={program.audience}
                className="text-neutral-300 font-light [&_ul]:space-y-4 [&_li]:flex [&_li]:items-start [&_li]:gap-4 [&_li]:before:content-[''] [&_li]:before:w-1.5 [&_li]:before:h-1.5 [&_li]:before:rounded-full [&_li]:before:bg-amber-500 [&_li]:before:mt-2 [&_li]:before:shrink-0 [&_ul]:list-none [&_ul]:pl-0 [&_p]:mb-4"
              />
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
              <MarkdownContent
                content={program.careers}
                className="text-neutral-300 font-light [&_ul]:space-y-4 [&_li]:flex [&_li]:items-start [&_li]:gap-4 [&_li]:before:content-[''] [&_li]:before:w-1.5 [&_li]:before:h-1.5 [&_li]:before:rounded-full [&_li]:before:bg-amber-500 [&_li]:before:mt-2 [&_li]:before:shrink-0 [&_ul]:list-none [&_ul]:pl-0 [&_p]:mb-4"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
