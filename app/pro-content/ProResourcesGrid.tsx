'use client';

import Link from 'next/link';
import { m } from 'framer-motion';
import { Lock, Download, ExternalLink } from 'lucide-react';
import type { ProResourceCard } from '@/lib/strapi/types';

interface ProResourcesGridProps {
  resources: ProResourceCard[];
  hasPro: boolean;
}

/**
 * Rejilla de recursos PRO. Visible para todos (escaparate), pero las URLs reales
 * (ficheros / apps) no se cargan aquí — cada tarjeta enlaza a la ruta gateada
 * /pro-content/[slug], que verifica PRO en el servidor antes de servir nada.
 */
export default function ProResourcesGrid({ resources, hasPro }: ProResourcesGridProps) {
  if (resources.length === 0) {
    return (
      <p className="text-mx-text/45 py-16 text-center">
        Aún no hay recursos PRO publicados. Vuelve pronto.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {resources.map((r, i) => (
        <m.div
          key={r.id}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: Math.min(i * 0.04, 0.4) }}
        >
          <Link
            href={`/pro-content/${r.slug}`}
            className="group relative flex flex-col h-full rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden hover:border-mx-orange/50 transition-colors"
          >
            <div className="aspect-[16/9] bg-white/[0.03] relative overflow-hidden">
              {r.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={r.thumbnailUrl}
                  alt={r.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-mx-text/20">
                  {r.kind === 'embed' ? <ExternalLink size={26} /> : <Download size={26} />}
                </div>
              )}
              {!hasPro && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
                  <Lock size={18} className="text-white/85" />
                </div>
              )}
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 text-white/90 text-[10px]">
                {r.category}
              </span>
            </div>
            <div className="p-3 flex flex-col gap-1 flex-1">
              <h3 className="text-sm font-semibold leading-snug group-hover:text-mx-orange transition-colors line-clamp-2">
                {r.title}
              </h3>
              {r.description && (
                <p className="text-xs text-mx-text/55 line-clamp-2">{r.description}</p>
              )}
              <span className="mt-1.5 inline-flex items-center gap-1 text-xs text-mx-orange">
                {r.kind === 'embed' ? (
                  <>
                    <ExternalLink size={13} /> Abrir
                  </>
                ) : (
                  <>
                    <Download size={13} /> Descargar
                  </>
                )}
                {!hasPro && <span className="text-mx-text/40">· solo PRO</span>}
              </span>
            </div>
          </Link>
        </m.div>
      ))}
    </div>
  );
}
