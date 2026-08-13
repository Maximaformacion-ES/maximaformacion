'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { m } from 'framer-motion';
import { Crown } from 'lucide-react';
import { FontStyles } from '../components/FontStyles';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import ProResourcesGrid from './ProResourcesGrid';
import ProContentFilterBar from './ProContentFilterBar';
import { SUBJECT_AREAS } from '@/lib/subject-areas';
import { normalizeForSearch } from '@/lib/normalize-search';
import type { ProResourceCard, Program } from '@/lib/strapi/types';

interface ProContentClientProps {
  resources: ProResourceCard[];
  /** Cursos incluidos en PRO (mini-cursos proOnly + cursos que también se venden). */
  proCourses: Program[];
  hasPro: boolean;
}

// Recursos sin área asignada caen en este grupo, que se muestra al final para
// que nada desaparezca del escaparate.
const FALLBACK_AREA = 'Otros recursos';
const AREA_ORDER = SUBJECT_AREAS.map((a) => a.key as string);

// Orden de las tabs por TIPO de contenido (el enum `category` de Strapi). Solo
// se muestran las que tienen algún recurso; el resto (nuevos tipos futuros no
// listados aquí) se añaden al final por orden alfabético.
const TYPE_ORDER = [
  'Apps web',
  'HTML interactivo',
  'Bases de datos',
  'Datasets',
  'Plantillas',
  'Guías',
  'Otros',
];

function orderTypes(present: Set<string>): string[] {
  const known = TYPE_ORDER.filter((t) => present.has(t));
  const extra = [...present].filter((t) => !TYPE_ORDER.includes(t)).sort((a, b) => a.localeCompare(b, 'es'));
  return [...known, ...extra];
}

interface AreaGroup {
  area: string;
  subgroups: { sub: string; items: ProResourceCard[] }[];
}

/** Agrupa los recursos por área temática (orden de SUBJECT_AREAS, solo las que
 *  tienen contenido) y, dentro de cada área, por subcategoría. Los recursos sin
 *  subcategoría se muestran primero, sin subtítulo. */
function groupResources(resources: ProResourceCard[]): AreaGroup[] {
  const byArea = new Map<string, ProResourceCard[]>();
  for (const r of resources) {
    const area = r.subjectArea || FALLBACK_AREA;
    const bucket = byArea.get(area) ?? [];
    bucket.push(r);
    byArea.set(area, bucket);
  }

  const orderedAreas = [
    ...AREA_ORDER.filter((k) => byArea.has(k)),
    ...[...byArea.keys()].filter((k) => !AREA_ORDER.includes(k) && k !== FALLBACK_AREA).sort((a, b) => a.localeCompare(b, 'es')),
    ...(byArea.has(FALLBACK_AREA) ? [FALLBACK_AREA] : []),
  ];

  return orderedAreas.map((area) => {
    const bySub = new Map<string, ProResourceCard[]>();
    for (const r of byArea.get(area)!) {
      const sub = r.subcategory || '';
      const bucket = bySub.get(sub) ?? [];
      bucket.push(r);
      bySub.set(sub, bucket);
    }
    // Sin subcategoría ('') primero; el resto, alfabético.
    const subKeys = [...bySub.keys()].sort((a, b) =>
      a === '' ? -1 : b === '' ? 1 : a.localeCompare(b, 'es'),
    );
    return { area, subgroups: subKeys.map((sub) => ({ sub, items: bySub.get(sub)! })) };
  });
}

export default function ProContentClient({ resources, proCourses, hasPro }: ProContentClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeType, setActiveType] = useState('Todo');
  const [activeArea, setActiveArea] = useState('Todas');
  const [query, setQuery] = useState('');

  // Tipos de contenido presentes (para las tabs de tipo).
  const types = useMemo(
    () => orderTypes(new Set(resources.map((r) => r.category).filter(Boolean))),
    [resources],
  );

  // Categorías / áreas presentes (para el filtro por categoría), en el orden de
  // SUBJECT_AREAS y con el grupo "Otros recursos" al final si aplica.
  const areas = useMemo(() => {
    const present = new Set(resources.map((r) => r.subjectArea || FALLBACK_AREA));
    return [
      ...AREA_ORDER.filter((a) => present.has(a)),
      ...(present.has(FALLBACK_AREA) ? [FALLBACK_AREA] : []),
    ];
  }, [resources]);

  // Filtro por tipo + categoría + búsqueda (título, descripción, área y
  // subcategoría), insensible a mayúsculas y acentos.
  const filtered = useMemo(() => {
    const q = normalizeForSearch(query.trim());
    return resources.filter((r) => {
      if (activeType !== 'Todo' && r.category !== activeType) return false;
      if (activeArea !== 'Todas' && (r.subjectArea || FALLBACK_AREA) !== activeArea) return false;
      if (!q) return true;
      const haystack = normalizeForSearch(
        [r.title, r.description, r.subjectArea, r.subcategory].filter(Boolean).join(' '),
      );
      return haystack.includes(q);
    });
  }, [resources, activeType, activeArea, query]);

  const groups = useMemo(() => groupResources(filtered), [filtered]);

  return (
    <div className="min-h-screen bg-mx-bg text-mx-text overflow-x-hidden">
      <FontStyles />

      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      <main className="pt-32 pb-24 px-6 md:px-12 max-w-[1800px] mx-auto relative z-10 overflow-x-hidden">
        <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="text-mx-orange text-xs tracking-[0.4em] uppercase">Contenido PRO</span>
            <span className="px-2 py-0.5 rounded-full bg-mx-orange/15 text-mx-orange text-[11px] font-semibold uppercase tracking-wider">
              Pro
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Recursos exclusivos PRO</h1>
          <p className="text-mx-text/60 max-w-2xl">
            Apps web, HTML interactivo, bases de datos y plantillas para suscriptores PRO.
            {!hasPro && (
              <>
                {' '}
                <Link href="/pricing" className="text-mx-orange underline underline-offset-2">
                  Hazte PRO
                </Link>{' '}
                para acceder a todo el contenido.
              </>
            )}
          </p>
        </m.div>

        {proCourses.length > 0 && (
          <m.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-10"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-1 flex items-center gap-2">
              <Crown className="text-mx-orange" size={22} /> Cursos incluidos en tu PRO
            </h2>
            <p className="text-mx-text/60 mb-6">
              Cursos completos y mini-cursos a los que accedes gratis con la suscripción.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {proCourses.map((c) => (
                <Link
                  key={c.documentId ?? c.slug}
                  href={c.href ?? `/programas/${c.slug}`}
                  className="group relative rounded-lg overflow-hidden border border-mx-border bg-mx-bg hover:border-mx-orange/50 transition-colors flex flex-col"
                >
                  <div className="relative h-40 overflow-hidden">
                    {c.image && (
                      <Image
                        src={c.image}
                        alt={c.title}
                        fill
                        sizes="(min-width:1024px) 25vw, 50vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    <span className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#f7a000] to-[#f7c948] shadow">
                      <Crown size={10} /> {c.proOnly ? 'Mini-curso PRO' : 'Incluido en PRO'}
                    </span>
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-medium line-clamp-2 mb-1">{c.title}</h3>
                    <p className="text-sm text-mx-text/60 line-clamp-2">{c.description}</p>
                    {!c.proOnly && c.price ? (
                      <p className="mt-auto pt-3 text-sm text-mx-text/50">
                        También a la venta ·{' '}
                        <span className="line-through">{c.price}€</span>{' '}
                        <span className="text-mx-orange font-medium">gratis con PRO</span>
                      </p>
                    ) : (
                      <p className="mt-auto pt-3 text-sm text-mx-orange font-medium">Solo para suscriptores PRO</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </m.section>
        )}

        {resources.length === 0 ? (
          <div className="mt-10">
            <ProResourcesGrid resources={[]} hasPro={hasPro} />
          </div>
        ) : (
          <div className="mt-8">
            <ProContentFilterBar
              types={types}
              activeType={activeType}
              setActiveType={setActiveType}
              areas={areas}
              activeArea={activeArea}
              setActiveArea={setActiveArea}
              query={query}
              setQuery={setQuery}
              resultsCount={filtered.length}
            />

            {groups.length === 0 ? (
              <p className="text-mx-text/45 py-16 text-center">
                No hay recursos que coincidan con tu búsqueda.
              </p>
            ) : (
              <div className="flex flex-col gap-16">
                {groups.map(({ area, subgroups }) => (
                  <section key={area}>
                    <h2 className="text-2xl md:text-3xl font-bold mb-6 border-b border-white/10 pb-3">
                      {area}
                    </h2>
                    <div className="flex flex-col gap-10">
                      {subgroups.map(({ sub, items }) => (
                        <div key={sub || '_none'}>
                          {sub && (
                            <h3 className="text-lg font-semibold text-mx-text/80 mb-4">{sub}</h3>
                          )}
                          <ProResourcesGrid resources={items} hasPro={hasPro} />
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
