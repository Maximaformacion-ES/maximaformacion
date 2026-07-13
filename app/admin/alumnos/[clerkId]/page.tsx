import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getStudent360 } from '@/lib/admin/students';
import StudentActions from './StudentActions';

export const dynamic = 'force-dynamic';

function fmtDate(d: Date | string | null | undefined): string {
  if (!d) return '—';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default async function StudentPage({
  params,
}: {
  params: Promise<{ clerkId: string }>;
}) {
  const { clerkId } = await params;
  const s = await getStudent360(clerkId);
  if (!s) notFound();

  const enrollments = s.enrollments.map((e) => ({
    documentId: e.programDocumentId,
    title: e.title ?? e.programDocumentId,
    accessType: e.accessType,
    purchasedAt: e.purchasedAt ? e.purchasedAt.toISOString() : null,
    percent: s.progress[e.programDocumentId]?.progressPercent ?? null,
  }));

  return (
    <div>
      <Link href="/admin/alumnos" className="text-sm text-zinc-500 hover:text-zinc-300">
        ← Alumnos
      </Link>

      {/* Cabecera / perfil */}
      <div className="mt-3 flex items-start gap-4">
        {s.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={s.imageUrl} alt="" className="w-14 h-14 rounded-full object-cover" />
        ) : (
          <div className="w-14 h-14 rounded-full bg-zinc-800" />
        )}
        <div className="flex-1">
          <h1 className="text-xl font-semibold">{s.name}</h1>
          <p className="text-zinc-400 text-sm">{s.email ?? '—'}</p>
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span
              className={
                s.plan === 'pro'
                  ? 'rounded-full bg-amber-500/15 text-amber-300 px-2 py-0.5 font-medium'
                  : 'rounded-full bg-zinc-800 text-zinc-400 px-2 py-0.5'
              }
            >
              plan: {s.plan}
            </span>
            {s.hasBeenPro && <span className="text-zinc-500">fue PRO alguna vez</span>}
            {s.subscription && (
              <span className="text-zinc-500">
                suscripción: {s.subscription.status} ({s.subscription.plan})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Acciones (cliente) */}
      <StudentActions clerkId={s.clerkId} plan={s.plan} enrollments={enrollments} />

      {/* Certificados */}
      <Section title={`Certificados (${s.certificates.length})`}>
        {s.certificates.length === 0 ? (
          <Empty>Sin certificados.</Empty>
        ) : (
          <ul className="divide-y divide-zinc-800/70">
            {s.certificates.map((c) => (
              <li key={c.id} className="py-2 flex items-center justify-between text-sm">
                <span>{c.courseTitle}</span>
                <span className={c.revokedAt ? 'text-red-400' : 'text-zinc-500'}>
                  {c.revokedAt ? `revocado ${fmtDate(c.revokedAt)}` : `emitido ${fmtDate(c.issuedAt)}`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Exámenes */}
      <Section title={`Exámenes (${s.exams.length})`}>
        {s.exams.length === 0 ? (
          <Empty>Sin exámenes.</Empty>
        ) : (
          <ul className="divide-y divide-zinc-800/70">
            {s.exams.map((ex) => (
              <li key={ex.id} className="py-2 flex items-center justify-between text-sm">
                <span className="text-zinc-300">
                  {ex.courseId} · bloque {ex.blockId}
                </span>
                <span className={ex.passed ? 'text-green-400' : 'text-red-400'}>
                  {ex.score} — {ex.passed ? 'aprobado' : 'suspenso'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide mb-2">{title}</h2>
      <div className="rounded-lg border border-zinc-800 p-4">{children}</div>
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-zinc-500">{children}</p>;
}
