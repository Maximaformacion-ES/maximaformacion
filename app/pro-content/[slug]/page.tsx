import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { draftMode } from 'next/headers';
import Link from 'next/link';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { getProResourceBySlug } from '@/lib/strapi/queries';
import { getServerUserState } from '@/lib/auth/server-user-state';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Previews inline soportados: PDF (iframe nativo del navegador) e imágenes.
// El resto de formatos (Excel, Word, zip, datasets…) se quedan como descarga.
// Se comprueba por mime y, como respaldo, por la extensión del nombre.
type PreviewFile = { mime: string; name: string };
const isPdfFile = (f: PreviewFile) =>
  f.mime === 'application/pdf' || /\.pdf$/i.test(f.name);
const isImageFile = (f: PreviewFile) =>
  f.mime.startsWith('image/') || /\.(png|jpe?g|gif|webp|avif|svg)$/i.test(f.name);

export const metadata: Metadata = {
  title: 'Recurso PRO | Máxima Formación',
  robots: { index: false, follow: false },
};

// Barra superior común (minimalista, sin el header global para no robar espacio
// al visor inmersivo de apps/HTML).
function TopBar({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 md:px-8 py-3 border-b border-white/10 bg-mx-bg/95 backdrop-blur">
      <Link
        href="/pro-content"
        className="text-sm text-mx-text/70 hover:text-mx-orange inline-flex items-center gap-2 flex-shrink-0"
      >
        <ArrowLeft size={16} /> Contenido PRO
      </Link>
      <span className="font-semibold truncate text-sm md:text-base">{title}</span>
      <span className="px-2 py-0.5 rounded-full bg-mx-orange/15 text-mx-orange text-[11px] font-semibold uppercase tracking-wider flex-shrink-0">
        Pro
      </span>
    </div>
  );
}

export default async function ProResourcePage({ params }: PageProps) {
  const { slug } = await params;
  const { isEnabled: isDraft } = await draftMode();

  const resource = await getProResourceBySlug(slug, { draft: isDraft });
  if (!resource) notFound();

  const { hasPro } = await getServerUserState();

  // ── No-PRO: a la página de planes. Nunca se sirven las URLs reales; en vez de
  //    un upsell inline, redirigimos directamente a /pricing ("hazte PRO"). ────
  if (!hasPro) {
    redirect('/pricing');
  }

  // ── PRO + embebido (app web / HTML interactivo): iframe a pantalla ─────────
  if (resource.kind === 'embed') {
    const url = resource.embedUrl || resource.htmlFileUrl;
    if (!url) notFound();
    return (
      <div className="min-h-screen bg-mx-bg text-mx-text flex flex-col">
        <TopBar title={resource.title} />
        <iframe
          src={url}
          title={resource.title}
          className="flex-1 w-full border-0"
          // Recursos propios (subidos/aprobados por nosotros) → permitimos scripts.
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads allow-modals"
          allow="clipboard-write; fullscreen"
        />
      </div>
    );
  }

  // ── PRO + descarga: panel con los ficheros ────────────────────────────────
  return (
    <div className="min-h-screen bg-mx-bg text-mx-text flex flex-col">
      <TopBar title={resource.title} />
      <main className="flex-1 px-6 py-14 max-w-4xl mx-auto w-full">
        <h1 className="text-3xl font-bold mb-2">{resource.title}</h1>
        {resource.description && (
          <p className="text-mx-text/60 mb-8 whitespace-pre-line">{resource.description}</p>
        )}

        {resource.files.length === 0 ? (
          <p className="text-mx-text/50">Este recurso aún no tiene ficheros disponibles.</p>
        ) : (
          <ul className="flex flex-col gap-6">
            {resource.files.map((f) => {
              const pdf = isPdfFile(f);
              const image = isImageFile(f);
              return (
                <li
                  key={f.id}
                  className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden"
                >
                  <div className="flex items-center gap-4 p-4">
                    <FileText size={22} className="text-mx-text/40 flex-shrink-0" />
                    <span className="flex-1 min-w-0">
                      <span className="block font-medium truncate">{f.name}</span>
                      <span className="block text-xs text-mx-text/45">
                        {f.mime} · {f.sizeKB} KB
                      </span>
                    </span>
                    <a
                      href={f.url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-sm text-mx-orange hover:border-mx-orange/50 transition-colors flex-shrink-0"
                    >
                      <Download size={16} /> Descargar
                    </a>
                  </div>

                  {pdf && (
                    <iframe
                      src={f.url}
                      title={f.name}
                      className="w-full h-[75vh] border-0 border-t border-white/10 bg-white"
                    />
                  )}
                  {!pdf && image && (
                    <div className="border-t border-white/10 bg-black/30 flex items-center justify-center p-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={f.url}
                        alt={f.name}
                        className="max-w-full max-h-[75vh] object-contain"
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
