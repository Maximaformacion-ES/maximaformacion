'use client';

import React from 'react';
import { m } from 'framer-motion';
import type { ResourceTopic } from '@/lib/strapi/types';

export type TopicTabValue = 'Todos' | ResourceTopic;

export interface TopicTab {
  value: TopicTabValue;
  label: string;
  description: string;
  count: number;
}

interface ResourcesTopicTabsProps {
  active: TopicTabValue;
  onChange: (value: TopicTabValue) => void;
  tabs: TopicTab[];
}

export const ResourcesTopicTabs: React.FC<ResourcesTopicTabsProps> = ({
  active,
  onChange,
  tabs,
}) => {
  const activeMeta = tabs.find((t) => t.value === active) ?? tabs[0];

  return (
    <div className="mb-8 md:mb-10">
      <div role="tablist" aria-label="Áreas de recursos" className="flex flex-wrap gap-2 md:gap-3">
        {tabs.map((tab) => {
          const isActive = active === tab.value;
          return (
            <button
              key={tab.value}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.value)}
              className={`relative px-5 md:px-6 py-2.5 md:py-3 rounded-full text-body-sm md:text-body-md font-bold tracking-wide transition-all duration-300 whitespace-nowrap cursor-pointer border ${
                isActive
                  ? 'bg-mx-blue text-white border-mx-blue'
                  : 'bg-mx-card text-mx-text-muted border-mx-border hover:border-mx-blue/40 hover:text-mx-text'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`ml-2 inline-flex items-center justify-center min-w-[1.5rem] px-1.5 py-0.5 rounded-full text-label-sm font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-mx-bg text-mx-text-muted'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {activeMeta && (
        <m.p
          key={activeMeta.value}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mt-4 text-body-sm md:text-body-md text-mx-text-muted font-light"
        >
          {activeMeta.description}
        </m.p>
      )}
    </div>
  );
};
