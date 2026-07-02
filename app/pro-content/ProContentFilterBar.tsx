'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Search, Funnel, Layers, Tag } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { FilterDropdown, type FilterOption } from '@/app/components/filters';

interface ProContentFilterBarProps {
  /** Tipos de contenido presentes (sin incluir "Todo"), ya ordenados. */
  types: string[];
  activeType: string;
  setActiveType: (type: string) => void;
  /** Áreas temáticas presentes (sin incluir "Todas"), ya ordenadas. */
  areas: string[];
  activeArea: string;
  setActiveArea: (area: string) => void;
  query: string;
  setQuery: (query: string) => void;
  resultsCount: number;
}

/**
 * Barra de filtrado de /pro-content al estilo del diseño de Figma:
 *  - Buscador (pill) + icono de filtro (funnel).
 *  - Al pulsar el funnel se despliega un panel con dos selects: "Tipo" (el enum
 *    `category` de Strapi) y "Categoría" (área temática, las mismas de los cursos).
 */
export default function ProContentFilterBar({
  types,
  activeType,
  setActiveType,
  areas,
  activeArea,
  setActiveArea,
  query,
  setQuery,
  resultsCount,
}: ProContentFilterBarProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const hasActiveFilters = activeType !== 'Todo' || activeArea !== 'Todas';

  // Cierra el select abierto al hacer click fuera de la barra.
  useEffect(() => {
    if (!openDropdown) return;
    const onClick = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [openDropdown]);

  const toggleDropdown = (id: string) =>
    setOpenDropdown((cur) => (cur === id ? null : id));

  const typeOptions: FilterOption[] = [
    { value: 'all', label: 'Todo' },
    ...types.map((t) => ({ value: t, label: t })),
  ];

  const areaOptions: FilterOption[] = [
    { value: 'all', label: 'Todas' },
    ...areas.map((a) => ({ value: a, label: a })),
  ];

  return (
    <div
      ref={barRef}
      className="sticky top-24 z-30 bg-mx-bg/80 backdrop-blur-md py-6 mb-10 border-b border-mx-border"
    >
      <div className="flex items-center gap-3 md:gap-4">
        <div className="relative w-full md:w-80 group">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-mx-text-muted group-focus-within:text-mx-orange transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder="Buscar recurso..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-mx-card border border-mx-border rounded-full pl-10 pr-4 py-2.5 text-body-sm focus:outline-none focus:border-mx-orange transition-colors text-mx-text placeholder:text-mx-text-muted/50"
          />
        </div>

        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          aria-label="Filtrar recursos"
          aria-expanded={filtersOpen}
          className={`relative shrink-0 inline-flex items-center justify-center h-11 w-11 rounded-full border transition-all duration-300 cursor-pointer ${
            filtersOpen || hasActiveFilters
              ? 'bg-mx-orange text-white border-mx-orange'
              : 'bg-mx-card text-mx-text-muted border-mx-border hover:border-mx-orange/30'
          }`}
        >
          <Funnel size={18} />
          {hasActiveFilters && !filtersOpen && (
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-mx-orange ring-2 ring-mx-bg" />
          )}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {filtersOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-visible"
          >
            <div className="flex flex-col sm:flex-row gap-6 pt-5">
              <div className="flex flex-col gap-1.5">
                <span className="text-label-sm md:text-label-md text-mx-text-muted font-medium tracking-wider uppercase">
                  Tipo
                </span>
                <FilterDropdown
                  id="type"
                  icon={<Layers size={14} />}
                  label="Todo"
                  options={typeOptions}
                  value={activeType === 'Todo' ? null : activeType}
                  onChange={(v) => setActiveType(v ?? 'Todo')}
                  isOpen={openDropdown === 'type'}
                  onToggle={() => toggleDropdown('type')}
                  variant="light"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-label-sm md:text-label-md text-mx-text-muted font-medium tracking-wider uppercase">
                  Categoría
                </span>
                <FilterDropdown
                  id="area"
                  icon={<Tag size={14} />}
                  label="Todas"
                  options={areaOptions}
                  value={activeArea === 'Todas' ? null : activeArea}
                  onChange={(v) => setActiveArea(v ?? 'Todas')}
                  isOpen={openDropdown === 'area'}
                  onToggle={() => toggleDropdown('area')}
                  variant="light"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4">
        <span className="text-label-md text-mx-text-muted">
          MOSTRANDO {resultsCount} {resultsCount === 1 ? 'RECURSO' : 'RECURSOS'}
        </span>
      </div>
    </div>
  );
}
