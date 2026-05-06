'use client';

import React from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { ResourceCard } from './ResourceCard';
import type { Resource } from '@/lib/strapi/types';

interface ResourcesGridProps {
  resources: Resource[];
}

export const ResourcesGrid: React.FC<ResourcesGridProps> = ({ resources }) => {
  return (
    <div className="min-h-[400px]">
      <AnimatePresence mode="popLayout">
        {resources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((r) => (
              <ResourceCard key={r.id} resource={r} />
            ))}
          </div>
        ) : (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-mx-text-muted"
          >
            <Search size={48} className="mb-4 opacity-20" />
            <p className="text-body-sm md:text-body-md">No se encontraron recursos con esos criterios.</p>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};
