import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getStudent360 } from '@/lib/admin/students';
import { getPayments } from '@/lib/admin/payments';
import { resolveContent } from '@/lib/admin/content';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import StudentActions from './StudentActions';
import StudentManage from './StudentManage';
import DangerZone from './DangerZone';

export const dynamic = 'force-dynamic';

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
  const payments = await getPayments(clerkId);

  const enrollments = s.enrollments.map((e) => ({
    documentId: e.programDocumentId,
    title: e.title ?? e.programDocumentId,
    accessType: e.accessType,
    purchasedAt: e.purchasedAt ? e.purchasedAt.toISOString() : null,
    percent: s.progress[e.programDocumentId]?.progressPercent ?? null,
  }));

  // Progreso de TODOS los cursos con actividad, NO solo los matriculados: un
  // alumno PRO puede tener progreso en un curso `isPro` sin matrícula (accede por
  // el plan), y antes ese progreso no se veía. Resolvemos el título por la
  // matrícula si existe, o vía Strapi, o el documentId como último recurso.
  const enrollTitle = new Map(s.enrollments.map((e) => [e.programDocumentId, e.title ?? undefined]));
  const progressCourses = await Promise.all(
    Object.entries(s.progress).map(async ([documentId, p]) => {
      let title = enrollTitle.get(documentId);
      if (!title) {
        const c = await resolveContent(documentId).catch(() => null);
        title = c?.title;
      }
      return {
        documentId,
        title: title ?? documentId,
        percent: p.progressPercent ?? null,
        completed: p.completedLessons.length,
        lastAccessedAt: p.lastAccessedAt,
        enrolled: enrollTitle.has(documentId),
      };
    })
  );

  const certificates = s.certificates.map((c) => ({
    id: c.id,
    courseId: c.courseId,
    courseTitle: c.courseTitle,
    issuedAt: c.issuedAt.toISOString(),
    revokedAt: c.revokedAt ? c.revokedAt.toISOString() : null,
  }));

  const exams = s.exams.map((ex) => ({
    id: ex.id,
    courseId: ex.courseId,
    blockId: ex.blockId,
    examId: ex.examId,
    score: ex.score,
    passed: ex.passed,
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
              <Badge className="bg-mx-orange/10 text-mx-orange-dark hover:bg-mx-orange/10 border-transparent font-semibold">
                PRO
              </Badge>
            ) : (
              <Badge variant="secondary" className="font-semibold">FREE</Badge>
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

      {/* Fase 1: PRO, conceder acceso, matrículas (revocar/re-provisionar) */}
      <StudentActions clerkId={s.clerkId} plan={s.plan} enrollments={enrollments} />

      {/* Fase 3: pagos, progreso, certificados, exámenes */}
      <StudentManage
        clerkId={s.clerkId}
        purchases={payments.purchases}
        subscription={payments.subscription}
        enrollments={enrollments.map((e) => ({ documentId: e.documentId, title: e.title, percent: e.percent }))}
        progress={progressCourses}
        certificates={certificates}
        exams={exams}
      />

      {/* Fase 4: zona de peligro (RGPD) */}
      <DangerZone clerkId={s.clerkId} email={s.email} />
    </div>
  );
}
