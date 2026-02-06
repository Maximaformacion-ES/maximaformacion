'use client';

import React from 'react';
import { Filter, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Topic } from '@/lib/strapi/types';

interface TopicFilterTriggerProps {
  isOpen: boolean;
  toggle: () => void;
  selectedCount: number;
}

export const TopicFilterTrigger: React.FC<TopicFilterTriggerProps> = ({
  isOpen,
  toggle,
  selectedCount,
}) => (
  <button
    onClick={toggle}
    className={`flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-300 whitespace-nowrap border ${
      selectedCount > 0
        ? 'bg-mx-orange/20 text-mx-orange border-mx-orange/50'
        : isOpen
          ? 'bg-mx-card text-mx-text border-mx-border'
          : 'bg-mx-card text-mx-text-muted border-mx-border hover:border-mx-orange/50'
    }`}
  >
    <Filter size={12} className="md:w-[14px] md:h-[14px]" />
    <span>Tema</span>
    {selectedCount > 0 && (
      <span className="bg-mx-orange text-white text-[10px] md:text-xs w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center">
        {selectedCount}
      </span>
    )}
    <ChevronDown
      size={12}
      className={`md:w-[14px] md:h-[14px] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
    />
  </button>
);

interface TopicBadgesRowProps {
  isOpen: boolean;
  topics: Topic[];
  selectedTopics: string[];
  onToggle: (name: string) => void;
}

export const TopicBadgesRow: React.FC<TopicBadgesRowProps> = ({
  isOpen,
  topics,
  selectedTopics,
  onToggle,
}) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="overflow-hidden"
      >
        <div className="flex items-center gap-2 flex-wrap pt-4">
          {topics.map((topic) => {
            const isSelected = selectedTopics.includes(topic.name);
            return (
              <button
                key={topic.id}
                onClick={() => onToggle(topic.name)}
                className={`px-3 py-1 md:px-4 md:py-1.5 rounded-full text-xs md:text-sm font-medium transition-all duration-300 whitespace-nowrap border ${
                  isSelected
                    ? 'bg-mx-orange text-white border-mx-orange'
                    : 'bg-mx-card text-mx-text-muted border-mx-border hover:border-mx-orange/50 hover:text-mx-text'
                }`}
              >
                {topic.name}
              </button>
            );
          })}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);
