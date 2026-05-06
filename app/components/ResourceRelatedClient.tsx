'use client';

import React from 'react';
import { m } from 'framer-motion';
import { ResourceCard } from './ResourceCard';
import type { Resource } from '@/lib/strapi/types';

interface ResourceRelatedClientProps {
  resources: Resource[];
}

export const ResourceRelatedClient: React.FC<ResourceRelatedClientProps> = ({ resources }) => {
  if (!resources || resources.length === 0) return null;

  return (
    <section className="relative py-16 md:py-24 px-4 sm:px-6 md:px-24 border-t border-mx-border">
      <div className="max-w-7xl mx-auto">
        <m.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-heading-sm md:text-heading-md font-black text-mx-blue mb-10 uppercase"
        >
          Recursos <span className="text-stroke text-mx-orange">relacionados</span>
        </m.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((r) => (
            <ResourceCard key={r.id} resource={r} />
          ))}
        </div>
      </div>
    </section>
  );
};
