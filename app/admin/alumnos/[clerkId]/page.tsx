import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getStudent360 } from '@/lib/admin/students';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StudentActions from './StudentActions';

export const dynamic = 'force-dynamic';

function fmtDate(d: Date | string | null | undefined): string {
  if (!d) return '—';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

function initials(name: string): string {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';
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
    <div className="space-y-6">
      <Link href="/admin/alumnos" className="text-sm text-muted-foreground hover:text-foreground">
        ← Alumnos
      </Link>

      {/* Cabecera / perfil */}
      <div className="flex items-start gap-4">
        <Avatar className="h-14 w-14">
          <AvatarImage src={s.imageUrl ?? undefined} alt="" />
          <AvatarFallback>{initials(s.name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">{s.name}</h1>
          <p className="text-muted-foreground text-sm">{s.email ?? '—'}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            {s.plan === 'pro' ? (
              <Badge className="bg-mx-orange/10 text-mx-orange-dark hover:bg-mx-orange/10 border-transparent">
                plan: pro
              </Badge>
            ) : (
              <Badge variant="secondary">plan: free</Badge>
            )}
            {s.hasBeenPro && <span className="text-muted-foreground">fue PRO alguna vez</span>}
            {s.subscription && (
              <span className="text-muted-foreground">
                suscripción: {s.subscription.status} ({s.subscription.plan})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Acciones (cliente): PRO, conceder acceso, matrículas con revoke/reprovision */}
      <StudentActions clerkId={s.clerkId} plan={s.plan} enrollments={enrollments} />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Certificados */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Certificados ({s.certificates.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {s.certificates.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin certificados.</p>
            ) : (
              <ul className="divide-y">
                {s.certificates.map((c) => (
                  <li key={c.id} className="py-2 flex items-center justify-between text-sm">
                    <span>{c.courseTitle}</span>
                    <span className={c.revokedAt ? 'text-destructive' : 'text-muted-foreground'}>
                      {c.revokedAt ? `revocado ${fmtDate(c.revokedAt)}` : `emitido ${fmtDate(c.issuedAt)}`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Exámenes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Exámenes ({s.exams.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {s.exams.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin exámenes.</p>
            ) : (
              <ul className="divide-y">
                {s.exams.map((ex) => (
                  <li key={ex.id} className="py-2 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {ex.courseId} · bloque {ex.blockId}
                    </span>
                    <span className={ex.passed ? 'text-green-600' : 'text-destructive'}>
                      {ex.score} — {ex.passed ? 'aprobado' : 'suspenso'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
