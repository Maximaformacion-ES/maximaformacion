// Skeleton del reproductor de lección. Next.js lo muestra automáticamente
// mientras el server component de la lección carga (fetch del curso + gates),
// para que la navegación entre lecciones/bloques no se vea "congelada".
export default function LessonLoading() {
  const rows = Array.from({ length: 9 });
  const lines = Array.from({ length: 6 });

  return (
    <div className="flex h-[calc(100dvh-57px)] overflow-hidden animate-pulse" aria-busy="true">
      {/* Sidebar (índice de módulos/lecciones) */}
      <aside className="hidden md:flex shrink-0 w-80 flex-col border-r border-white/5 bg-[#0b1018] p-4 gap-3">
        <div className="h-3 w-24 rounded bg-white/10" />
        <div className="h-2 w-full rounded-full bg-white/5" />
        <div className="mt-2 flex flex-col gap-2">
          {rows.map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-1.5">
              <div className="h-5 w-5 shrink-0 rounded-full bg-white/10" />
              <div
                className="h-3 rounded bg-white/10"
                style={{ width: `${55 + ((i * 7) % 35)}%` }}
              />
            </div>
          ))}
        </div>
      </aside>

      {/* Contenido */}
      <div className="flex-1 min-w-0 overflow-hidden bg-[#0f1520]">
        {/* Barra superior (breadcrumb) */}
        <div className="sticky top-0 z-30 bg-[#0b1018]/80 backdrop-blur-sm border-b border-white/5 px-6 py-3 flex items-center gap-3">
          <div className="h-5 w-5 rounded bg-white/10" />
          <div className="min-w-0 flex-1">
            <div className="h-2 w-32 rounded bg-white/10" />
            <div className="mt-2 h-3 w-64 max-w-[60%] rounded bg-white/10" />
          </div>
          <div className="h-9 w-9 rounded-full bg-white/10 shrink-0" />
        </div>

        {/* Cuerpo */}
        <div className="px-6 md:px-12 lg:px-16 py-10 max-w-4xl mx-auto">
          <div className="h-9 w-3/4 rounded-lg bg-white/10" />
          <div className="mt-8 flex flex-col gap-3">
            {lines.map((_, i) => (
              <div
                key={i}
                className="h-3 rounded bg-white/[0.07]"
                style={{ width: `${88 - ((i * 9) % 30)}%` }}
              />
            ))}
          </div>
          {/* Placeholder de imagen */}
          <div className="mt-10 h-72 w-full rounded-xl border border-white/5 bg-white/[0.04]" />
          <div className="mt-8 flex flex-col gap-3">
            {lines.slice(0, 4).map((_, i) => (
              <div
                key={i}
                className="h-3 rounded bg-white/[0.07]"
                style={{ width: `${90 - ((i * 11) % 25)}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
