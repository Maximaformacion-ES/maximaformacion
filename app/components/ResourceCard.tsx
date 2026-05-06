'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { m } from 'framer-motion';
import { Calendar, Download, ExternalLink, FileText, Award } from 'lucide-react';
import type { Resource } from '@/lib/strapi/types';

interface ResourceCardProps {
  resource: Resource;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const downloadCount = resource.downloads.length;
  const hasExternal = Boolean(resource.externalUrl);
  const actionIcon = downloadCount > 0 ? Download : hasExternal ? ExternalLink : FileText;
  const ActionIcon = actionIcon;
  const actionLabel = downloadCount > 0
    ? `${downloadCount} descarga${downloadCount > 1 ? 's' : ''}`
    : hasExternal
    ? 'Enlace externo'
    : 'Ver recurso';

  return (
    <m.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <Link
        href={`/recursos/${resource.slug}`}
        className="group relative bg-mx-bg rounded-xl overflow-hidden border border-mx-border hover:border-mx-orange/50 transition-all duration-300 flex flex-col h-full"
      >
        <div className="relative h-56 overflow-hidden bg-mx-card">
          {resource.image ? (
            <Image
              src={resource.image}
              alt={resource.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <FileText size={48} className="text-mx-orange/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {resource.featured && (
            <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-mx-orange text-white text-label-sm font-bold uppercase tracking-widest rounded-full">
              <Award size={12} /> Destacado
            </div>
          )}
          <div className="absolute bottom-4 left-4 z-20 px-3 py-1.5 bg-mx-blue text-white text-label-sm md:text-label-md font-medium rounded-full">
            {resource.category}
          </div>
        </div>

        <div className="p-6 flex flex-col flex-grow">
          <div className="flex items-center gap-4 mb-4 text-mx-text-muted text-label-sm md:text-label-md">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              {formatDate(resource.publishedAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <ActionIcon size={14} />
              {actionLabel}
            </span>
          </div>

          <h3 className="text-body-sm md:text-body-md font-bold text-mx-text mb-3 group-hover:text-mx-blue transition-colors duration-300 leading-tight line-clamp-2">
            {resource.title}
          </h3>

          {resource.excerpt && (
            <p className="text-mx-text-muted text-body-sm font-light mb-4 line-clamp-3 flex-grow">
              {resource.excerpt}
            </p>
          )}

          {resource.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {resource.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-mx-card border border-mx-border text-label-sm md:text-label-md text-mx-text-muted rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="pt-4 border-t border-mx-border flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              {resource.author.name && (
                <>
                  {resource.author.avatar ? (
                    <Image
                      src={resource.author.avatar}
                      alt={resource.author.name}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full border border-mx-border object-cover shrink-0"
                      unoptimized
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-mx-orange/10 border border-mx-orange/30 flex items-center justify-center shrink-0">
                      <span className="text-label-sm md:text-label-md font-bold text-mx-orange">
                        {resource.author.name
                          .split(' ')
                          .map((w) => w[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-label-sm md:text-label-md font-bold text-mx-text truncate">
                      {resource.author.name}
                    </p>
                    {resource.author.role && (
                      <p className="text-label-sm md:text-label-md text-mx-text-muted truncate">
                        {resource.author.role}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </Link>
    </m.div>
  );
};
