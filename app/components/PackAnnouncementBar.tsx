'use client';

import React, { useEffect, useRef, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { AnimatePresence, m } from 'framer-motion';
import { GraduationCap, X } from 'lucide-react';

// Estado externo (scroll + cierre) leído vía useSyncExternalStore: en
// servidor ambos snapshots devuelven "oculta", y en cliente React
// re-renderiza con el valor real sin error de hidratación.
//
// El cierre vive SOLO en memoria (variable de módulo, nada de storage): la X
// oculta la tira durante la navegación SPA actual, pero cualquier recarga o
// visita nueva la vuelve a mostrar — es publicidad, debe reaparecer.
let dismissedInMemory = false;
const dismissListeners = new Set<() => void>();

function subscribeDismiss(cb: () => void) {
  dismissListeners.add(cb);
  return () => dismissListeners.delete(cb);
}

function isDismissed(): boolean {
  return dismissedInMemory;
}

function dismiss() {
  dismissedInMemory = true;
  dismissListeners.forEach((cb) => cb());
}

function subscribeScroll(cb: () => void) {
  window.addEventListener('scroll', cb, { passive: true });
  return () => window.removeEventListener('scroll', cb);
}

function isScrolled(): boolean {
  return window.scrollY > 40;
}

// La tira va DENTRO del header fijo, así que por sí sola no ocupa sitio y
// tapa el arranque de las páginas (breadcrumbs, badges), que solo cuentan con
// la altura del header. Solución: reservar su altura como padding-top del
// <body>, aplicado en línea desde aquí (no vía CSS global, para no depender
// de la recompilación de estilos) y publicada también como --announcement-h
// por si algún sticky quiere descontarla. Se mide con ResizeObserver (puede
// ocupar 1 o 2 líneas según el ancho) y NO se pone a 0 al ocultarse por
// scroll: ese hueco queda arriba del todo, ya fuera de la vista, y así no hay
// saltos de layout al pasar de 40 px. Solo vuelve a 0 al cerrarla o desmontar.
function setAnnouncementHeight(px: number) {
  const h = `${Math.round(px)}px`;
  document.documentElement.style.setProperty('--announcement-h', h);
  document.body.style.transition = 'padding-top 0.25s ease';
  document.body.style.paddingTop = h;
}

/**
 * Tira anunciadora del Pack 3 Cursos Universitarios, pegada al borde inferior
 * del header fijo. Dos cuidados deliberados:
 *
 * - Se OCULTA al hacer scroll: el header mide 72/96 px y hay elementos sticky
 *   calados a esa altura (p. ej. la barra de filtros de /programas en top-24);
 *   si la tira siguiera visible al bajar, los taparía. En lo alto de la página
 *   no hay conflicto porque los hero llevan pt-32/pt-40.
 * - El cierre dura solo hasta la próxima recarga (memoria, ver arriba).
 */
export function PackAnnouncementBar() {
  const dismissed = useSyncExternalStore(subscribeDismiss, isDismissed, () => true);
  const scrolled = useSyncExternalStore(subscribeScroll, isScrolled, () => true);

  const visible = !dismissed && !scrolled;
  const barRef = useRef<HTMLDivElement>(null);

  // Mide la tira mientras está visible y publica su altura; al cerrar (o al
  // desmontar el header, p. ej. entrando al campus) libera el hueco.
  useEffect(() => {
    if (dismissed) {
      setAnnouncementHeight(0);
      return;
    }
    const el = barRef.current;
    if (!el) return;
    const measure = () => setAnnouncementHeight(el.getBoundingClientRect().height);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [dismissed, visible]);

  useEffect(() => () => setAnnouncementHeight(0), []);

  return (
    <AnimatePresence initial={false}>
      {visible && (
        <m.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden bg-mx-orange text-white"
        >
          <div ref={barRef} className="relative flex items-center justify-center gap-2 px-10 py-2 text-center">
            <GraduationCap size={15} className="hidden sm:block shrink-0" />
            <Link
              href="/pack-cursos-universitarios"
              className="text-[13px] sm:text-body-sm font-medium leading-snug hover:underline underline-offset-2"
            >
              <span className="font-black uppercase tracking-wide">Nuevo</span>
              {' · '}Pack 3 Cursos Universitarios para docentes: 14 ECTS por 290 € (ahorras 95 €)
              <span className="font-bold whitespace-nowrap"> → Ver el pack</span>
            </Link>
            <button
              type="button"
              onClick={dismiss}
              aria-label="Cerrar aviso"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-white/15 transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
