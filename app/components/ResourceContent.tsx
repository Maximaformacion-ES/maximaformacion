'use client';

import React from 'react';
import { m } from 'framer-motion';
import { Download, FileText, Clock } from 'lucide-react';
import type { Resource } from '@/lib/strapi/types';
import { isComingSoon } from '@/lib/resources/coming-soon';

interface ResourceContentProps {
  resource: Resource;
  bodyHtml: string;
  onDownloadClick: (e: React.MouseEvent<HTMLAnchorElement>, url: string, filename: string) => void;
}

const formatSize = (kb: number) => {
  if (kb < 1024) return `${kb} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};

export const ResourceContent: React.FC<ResourceContentProps> = ({ resource, bodyHtml, onDownloadClick }) => {
  const comingSoon = isComingSoon(resource.slug);
  return (
    <section className="relative py-12 md:py-16 px-4 sm:px-6 md:px-24">
      <div className="max-w-3xl mx-auto">
        <style>{`
          .resource-html-content {
            color: var(--color-mx-text);
            font-size: var(--text-body-sm);
            line-height: 1.7;
            overflow-wrap: break-word;
            word-break: break-word;
          }
          .resource-html-content h1, .resource-html-content h2, .resource-html-content h3, .resource-html-content h4 {
            color: var(--color-mx-blue);
            font-weight: 800;
            line-height: 1.2;
            margin-top: 2rem;
            margin-bottom: 1rem;
          }
          .resource-html-content h2 { font-size: var(--text-heading-sm); }
          .resource-html-content h3 { font-size: var(--text-body-lg); }
          .resource-html-content p { margin-bottom: 1.25rem; line-height: 1.75; }
          .resource-html-content a { color: var(--color-mx-orange); text-decoration: underline; text-underline-offset: 3px; }
          .resource-html-content a:hover { color: var(--color-mx-orange-dark); }
          .resource-html-content ul, .resource-html-content ol { padding-left: 1.5rem; margin-bottom: 1.25rem; }
          .resource-html-content ul { list-style: disc; }
          .resource-html-content ol { list-style: decimal; }
          .resource-html-content li { margin-bottom: 0.5rem; }
          .resource-html-content img { max-width: 100%; height: auto; border-radius: 0.75rem; margin: 1.5rem 0; }
          .resource-html-content blockquote {
            border-left: 3px solid var(--color-mx-orange);
            padding: 0.5rem 1.25rem;
            margin: 1.5rem 0;
            color: var(--color-mx-text-muted);
            background: rgba(245, 158, 11, 0.04);
            border-radius: 0 0.5rem 0.5rem 0;
          }
          .resource-html-content strong { color: var(--color-mx-text); font-weight: 700; }
          .resource-html-content hr { border: 0; border-top: 1px solid var(--color-mx-border); margin: 2rem 0; }
          @media (min-width: 768px) {
            .resource-html-content { font-size: var(--text-body-md); }
            .resource-html-content h2 { font-size: var(--text-heading-md); }
            .resource-html-content h3 { font-size: var(--text-heading-sm); }
          }
        `}</style>

        {bodyHtml && (
          <m.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="resource-html-content"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />
        )}

        {(resource.downloads.length > 0 || resource.externalUrl) && (
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-12 p-6 md:p-8 bg-mx-card border border-mx-border rounded-2xl"
          >
            <h2 className="text-heading-sm font-black text-mx-blue mb-6 flex items-center gap-3">
              <Download size={22} className="text-mx-orange" />
              Descargas
            </h2>
            {comingSoon ? (
            <div className="flex items-center gap-3 p-4 bg-mx-bg border border-mx-border rounded-xl text-mx-text-muted">
              <Clock size={18} className="text-mx-orange shrink-0" />
              <span className="text-body-sm md:text-body-md">
                Este recurso estará disponible <strong className="text-mx-text">próximamente</strong>.
              </span>
            </div>
            ) : (
            <ul className="flex flex-col gap-3">
              {resource.downloads.map((d) => (
                <li key={d.id}>
                  <a
                    href={d.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    onClick={(e) => onDownloadClick(e, d.url, d.name)}
                    className="group flex items-center gap-4 p-4 bg-mx-bg border border-mx-border rounded-xl hover:border-mx-orange/50 transition-colors duration-300"
                  >
                    <div className="w-10 h-10 rounded-lg bg-mx-orange/10 border border-mx-orange/30 flex items-center justify-center shrink-0">
                      <FileText size={18} className="text-mx-orange" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-body-sm md:text-body-md font-bold text-mx-text truncate group-hover:text-mx-orange transition-colors">
                        {d.name}
                      </p>
                      <p className="text-label-sm text-mx-text-muted">
                        {d.mime} · {formatSize(d.sizeKB)}
                      </p>
                    </div>
                    <Download
                      size={18}
                      className="text-mx-text-muted group-hover:text-mx-orange transition-colors shrink-0"
                    />
                  </a>
                </li>
              ))}
              {resource.externalUrl && (
                <li>
                  <a
                    href={resource.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    onClick={(e) =>
                      onDownloadClick(
                        e,
                        resource.externalUrl as string,
                        resource.externalUrl!.split('/').pop() || resource.title,
                      )
                    }
                    className="group flex items-center gap-4 p-4 bg-mx-bg border border-mx-border rounded-xl hover:border-mx-orange/50 transition-colors duration-300"
                  >
                    <div className="w-10 h-10 rounded-lg bg-mx-orange/10 border border-mx-orange/30 flex items-center justify-center shrink-0">
                      <FileText size={18} className="text-mx-orange" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-body-sm md:text-body-md font-bold text-mx-text truncate group-hover:text-mx-orange transition-colors">
                        {resource.title}
                      </p>
                      <p className="text-label-sm text-mx-text-muted truncate">
                        {resource.externalUrl}
                      </p>
                    </div>
                    <Download
                      size={18}
                      className="text-mx-text-muted group-hover:text-mx-orange transition-colors shrink-0"
                    />
                  </a>
                </li>
              )}
            </ul>
            )}
          </m.div>
        )}

        {resource.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2">
            {resource.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-mx-card border border-mx-border text-label-sm text-mx-text-muted rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <p className="mt-12 text-label-sm text-mx-text-muted">
          Licencia: {resource.license} · Creado por:{' '}
          {resource.author.name || 'Máxima Formación'}
        </p>
      </div>
    </section>
  );
};
