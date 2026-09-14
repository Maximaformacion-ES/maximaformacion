"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Clock, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getCourseMeta } from "@/app/maxymia/data/queries";
import { maxymiaCategoryLabel } from "@/app/maxymia/data/labels";
import type { Locale, MaxymiaCourse } from "@/app/maxymia/types";

/**
 * Buscador de cursos del campus con resultados en vivo: al escribir se
 * despliega una lista con miniatura, título, categoría y duración; no hace
 * falta pulsar Enter. Flechas para moverse, Enter para abrir el resultado
 * activo (o el catálogo filtrado si no hay ninguno), Escape para cerrar.
 */

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export function CourseSearch({ locale, courses }: { locale: Locale; courses: MaxymiaCourse[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const term = norm(q.trim());
    if (term.length < 2) return [];
    return courses
      .map((c) => {
        const title = norm(c.title[locale] ?? c.title.es ?? "");
        const hay = [title, norm(c.description?.[locale] ?? ""), ...c.tags.map(norm), norm(maxymiaCategoryLabel(c.category, locale))];
        const score = title.startsWith(term) ? 3 : title.includes(term) ? 2 : hay.some((h) => h.includes(term)) ? 1 : 0;
        return { c, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map((r) => r.c);
  }, [q, courses, locale]);

  // Cerrar al pulsar fuera.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };
  const catalogHref = `/maxymia/campus/cursos${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`;

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const hit = results[active];
      go(hit ? `/maxymia/campus/${hit.slug}` : catalogHref);
    }
  };

  const showPanel = open && q.trim().length >= 2;

  return (
    <div ref={rootRef} role="search" className="relative hidden w-full max-w-sm sm:block">
      <Search className="text-muted-foreground pointer-events-none absolute left-2.5 top-1/2 z-10 size-4 -translate-y-1/2" aria-hidden="true" />
      <Input
        type="search"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={locale === "es" ? "Buscar cursos…" : "Search courses…"}
        className="h-9 pl-8"
        role="combobox"
        aria-expanded={showPanel}
        aria-controls="campus-search-results"
        aria-autocomplete="list"
        autoComplete="off"
      />

      {showPanel && (
        <div
          id="campus-search-results"
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-mx-border bg-mx-card shadow-xl"
        >
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">
              {locale === "es" ? "Ningún curso coincide con" : "No course matches"} “{q.trim()}”
            </p>
          ) : (
            <ul className="max-h-[60vh] overflow-y-auto py-1">
              {results.map((c, i) => {
                const { totalLessons, totalMinutes } = getCourseMeta(c);
                const hours = c.durationHours ?? Math.round(totalMinutes / 60);
                const isActive = i === active;
                return (
                  <li key={c.id} role="option" aria-selected={isActive}>
                    <Link
                      href={`/maxymia/campus/${c.slug}`}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 transition-colors ${isActive ? "bg-mx-orange/10" : "hover:bg-black/[0.03]"}`}
                    >
                      <span className="relative h-11 w-16 shrink-0 overflow-hidden rounded-md bg-black/[0.05]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={c.image} alt="" className="h-full w-full object-cover" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-mx-text">{c.title[locale]}</span>
                        <span className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="truncate">{maxymiaCategoryLabel(c.category, locale)}</span>
                          <span aria-hidden="true">·</span>
                          <span className="inline-flex shrink-0 items-center gap-1">
                            <Clock className="size-3" /> {hours} h · {totalLessons} {locale === "es" ? "lecciones" : "lessons"}
                          </span>
                        </span>
                      </span>
                      <ArrowRight className={`size-4 shrink-0 ${isActive ? "text-mx-orange" : "text-muted-foreground/50"}`} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          <Link
            href={catalogHref}
            onClick={() => setOpen(false)}
            className="flex items-center justify-between border-t border-mx-border px-4 py-2.5 text-xs font-medium text-mx-blue hover:text-mx-orange transition-colors"
          >
            {locale === "es" ? "Ver todos los resultados en el catálogo" : "See all results in the catalog"} <ArrowRight className="size-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
