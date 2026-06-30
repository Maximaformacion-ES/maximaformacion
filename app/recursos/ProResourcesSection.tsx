'use client';

import Link from 'next/link';
import { m } from 'framer-motion';
import { Lock, Download, ExternalLink } from 'lucide-react';
import type { ProResourceCard } from '@/lib/strapi/types';

interface ProResourcesSectionProps {
  resources: ProResourceCard[];
  hasPro: boolean;
}

/**
 * Zona PRO en /recursos: grid de recursos premium. El grid es visible para
 * todos (escaparate), pero las URLs reales (ficheros / apps) no se cargan aquí
 * — cada tarjeta enlaza a la ruta gateada /recursos/pro/[slug], que verifica
 * PRO en el servidor antes de servir el contenido.
 */
export default function ProResourcesSection({ resources, hasPro }: ProResourcesSectionProps) {
  if (resources.length === 0) return null;

  return (
    <m.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="mb-14"
    >
      <div className="flex flex-wrap items-center gap-3 mb-2">
        <span className="text-mx-orange text-xs tracking-[0.4em] uppercase">Zona PRO</span>
        <span className="px-2 py-0.5 rounded-full bg-mx-orange/15 text-mx-orange text-[11px] font-semibold uppercase tracking-wider">
          Pro
        </span>
      </div>
      <h2 className="text-2xl md:text-3xl font-bold mb-1">Contenido exclusivo PRO</h2>
      <p className="text-mx-text/60 mb-6 max-w-2xl">
        Apps web, HTML interactivo, bases de datos y plantillas para suscriptores PRO.
        {!hasPro && (
          <>
            {' '}
            <Link href="/pricing" className="text-mx-orange underline underline-offset-2">
              Hazte PRO
            </Link>{' '}
            para acceder.
          </>
        )}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {resources.map((r) => (
          <Link
            key={r.id}
            href={`/recursos/pro/${r.slug}`}
            className="group relative flex flex-col rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden hover:border-mx-orange/50 transition-colors"
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
                  {r.kind === 'embed' ? <ExternalLink size={34} /> : <Download size={34} />}
                </div>
              )}
              {!hasPro && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
                  <Lock size={22} className="text-white/85" />
                </div>
              )}
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 text-white/90 text-[10px]">
                {r.category}
              </span>
            </div>
            <div className="p-4 flex flex-col gap-1">
              <h3 className="font-semibold leading-snug group-hover:text-mx-orange transition-colors">
                {r.title}
              </h3>
              {r.description && (
                <p className="text-sm text-mx-text/55 line-clamp-2">{r.description}</p>
              )}
              <span className="mt-2 inline-flex items-center gap-1 text-xs text-mx-orange">
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
        ))}
      </div>
    </m.section>
  );
}
