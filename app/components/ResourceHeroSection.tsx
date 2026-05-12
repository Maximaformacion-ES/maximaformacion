'use client';

import React from 'react';
import Image from 'next/image';
import { m } from 'framer-motion';
import { Calendar, Award, User, Download, ExternalLink } from 'lucide-react';
import type { Resource } from '@/lib/strapi/types';

interface ResourceHeroSectionProps {
  resource: Resource;
  onDownloadClick: (e: React.MouseEvent<HTMLAnchorElement>, url: string, filename: string) => void;
}

export const ResourceHeroSection: React.FC<ResourceHeroSectionProps> = ({ resource, onDownloadClick }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const hasImage = Boolean(resource.image) && resource.image !== '/placeholder-course.svg';
  const primaryDownload = resource.downloads[0];

  return (
    <section className="relative pt-32 md:pt-40 pb-12 md:pb-16">
      <div className="px-4 sm:px-6 md:px-24">
        <div
          className={
            hasImage
              ? 'grid lg:grid-cols-2 gap-10 lg:gap-16 items-stretch'
              : 'max-w-3xl mx-auto text-center'
          }
        >
          <div className="min-w-0">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className={`mb-8 flex items-center gap-4 ${hasImage ? '' : 'justify-center'}`}
            >
              <span className="inline-block px-4 py-1.5 text-label-sm md:text-label-md font-medium tracking-wider uppercase bg-mx-blue text-white rounded-full">
                {resource.category}
              </span>
              {resource.featured && (
                <span className="inline-flex items-center gap-1.5 text-label-sm md:text-label-md font-bold text-mx-orange uppercase tracking-widest">
                  <Award size={12} /> Destacado
                </span>
              )}
            </m.div>

            <m.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-heading-sm md:text-heading-md xl:text-heading-lg font-black text-mx-blue mb-6 leading-[1.1] text-balance"
            >
              {resource.title}
            </m.h1>

            {resource.excerpt && (
              <m.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-body-sm md:text-body-md xl:text-body-lg text-mx-text font-light mb-8 text-pretty"
              >
                {resource.excerpt}
              </m.p>
            )}

            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className={`flex flex-wrap items-center gap-x-8 gap-y-4 pt-6 border-t border-mx-text/10 ${hasImage ? '' : 'justify-center'}`}
            >
              {resource.author?.name && (
                <div className="flex items-center gap-3 text-mx-text">
                  {resource.author.avatar ? (
                    <Image
                      src={resource.author.avatar}
                      alt={resource.author.name}
                      width={36}
                      height={36}
                      className="w-9 h-9 rounded-full border border-mx-orange/30 object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-mx-orange/10 border border-mx-orange/30 flex items-center justify-center">
                      <User size={16} className="text-mx-orange" />
                    </div>
                  )}
                  <div className="flex flex-col leading-tight">
                    <span className="text-label-sm uppercase tracking-widest text-mx-text-muted">Autor</span>
                    <span className="text-body-sm font-bold">{resource.author.name}</span>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2.5 text-mx-text">
                <Calendar size={16} className="text-mx-orange" />
                <span className="text-label-sm uppercase tracking-widest text-mx-text-muted">Publicado</span>
                <span className="text-body-sm font-bold">{formatDate(resource.publishedAt)}</span>
              </div>
            </m.div>

            {(primaryDownload || resource.externalUrl) && (
              <m.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className={`mt-8 flex flex-col sm:flex-row gap-3 ${hasImage ? '' : 'justify-center'}`}
              >
                {primaryDownload && (
                  <a
                    href={primaryDownload.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    onClick={(e) => onDownloadClick(e, primaryDownload.url, primaryDownload.name)}
                    className="inline-flex items-center justify-center gap-3 bg-mx-orange text-white px-6 py-3.5 text-label-md font-bold rounded-full hover:bg-mx-orange-dark transition-colors duration-300"
                  >
                    <Download size={18} />
                    Descargar
                    {resource.downloads.length > 1 && (
                      <span className="opacity-70 font-medium">
                        ({resource.downloads.length} archivos)
                      </span>
                    )}
                  </a>
                )}
                {resource.externalUrl && (
                  <a
                    href={resource.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) =>
                      onDownloadClick(
                        e,
                        resource.externalUrl as string,
                        resource.externalUrl!.split('/').pop() || resource.title,
                      )
                    }
                    className="inline-flex items-center justify-center gap-3 border border-mx-border text-mx-text px-6 py-3.5 text-label-md font-bold rounded-full hover:border-mx-orange hover:text-mx-orange transition-colors duration-300"
                  >
                    <ExternalLink size={18} />
                    Abrir enlace externo
                  </a>
                )}
              </m.div>
            )}
          </div>

          {hasImage && (
            <m.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="relative aspect-[4/3] lg:aspect-auto lg:h-full rounded-2xl overflow-hidden bg-mx-blue/5"
            >
              <Image
                src={resource.image}
                alt={resource.title}
                className="object-cover"
                fill
                sizes="(max-width: 1024px) 100vw, 600px"
                priority
                unoptimized
              />
            </m.div>
          )}
        </div>
      </div>
    </section>
  );
};
