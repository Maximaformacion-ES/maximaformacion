import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { draftMode } from 'next/headers';
import Link from 'next/link';
import { ArrowLeft, Lock, Download, FileText } from 'lucide-react';
import { getProResourceBySlug } from '@/lib/strapi/queries';
import { getServerUserState } from '@/lib/auth/server-user-state';

interface PageProps {
  params: Promise<{ slug: string }>;
}

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
        href="/recursos"
        className="text-sm text-mx-text/70 hover:text-mx-orange inline-flex items-center gap-2 flex-shrink-0"
      >
        <ArrowLeft size={16} /> Recursos
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

  // ── No-PRO: upsell (nunca se sirven las URLs reales) ───────────────────────
  if (!hasPro) {
    return (
      <div className="min-h-screen bg-mx-bg text-mx-text flex flex-col">
        <TopBar title={resource.title} />
        <main className="flex-1 flex items-center justify-center px-6 py-20">
          <div className="max-w-md text-center">
            <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-mx-orange/15 flex items-center justify-center">
              <Lock size={24} className="text-mx-orange" />
            </div>
            <h1 className="text-2xl font-bold mb-2">{resource.title}</h1>
            {resource.description && (
              <p className="text-mx-text/70 mb-4 whitespace-pre-line">{resource.description}</p>
            )}
            <p className="text-mx-text/55 mb-7 text-sm">
              Este recurso es <span className="text-mx-orange font-medium">exclusivo PRO</span>. Hazte
              PRO para acceder a este y al resto de contenido premium.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/pricing"
                className="px-6 py-3 rounded-full bg-mx-orange text-black font-semibold hover:opacity-90 transition"
              >
                Hazte PRO
              </Link>
              <Link
                href="/recursos"
                className="px-6 py-3 rounded-full border border-white/15 hover:border-white/30 transition"
              >
                Volver a recursos
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
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
      <main className="flex-1 px-6 py-14 max-w-2xl mx-auto w-full">
        <h1 className="text-3xl font-bold mb-2">{resource.title}</h1>
        {resource.description && (
          <p className="text-mx-text/60 mb-8 whitespace-pre-line">{resource.description}</p>
        )}

        {resource.files.length === 0 ? (
          <p className="text-mx-text/50">Este recurso aún no tiene ficheros disponibles.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {resource.files.map((f) => (
              <li key={f.id}>
                <a
                  href={f.url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 hover:border-mx-orange/50 transition-colors"
                >
                  <FileText size={22} className="text-mx-text/40 flex-shrink-0" />
                  <span className="flex-1 min-w-0">
                    <span className="block font-medium truncate group-hover:text-mx-orange transition-colors">
                      {f.name}
                    </span>
                    <span className="block text-xs text-mx-text/45">
                      {f.mime} · {f.sizeKB} KB
                    </span>
                  </span>
                  <Download size={18} className="text-mx-orange flex-shrink-0" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
