import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Circle } from 'lucide-react';
import { getStudent360 } from '@/lib/admin/students';
import { getAllCourseProgress, getLessonProgress } from '@/lib/db/queries';
import { resolveContent } from '@/lib/admin/content';
import { getMaxymiaCourseBySlugFromStrapi } from '@/lib/strapi/maxymia-queries';
import { lessonUnitIds, isLessonComplete, getCourseProgressStats } from '@/app/maxymia/data/queries';
import type { MaxymiaCourse, MaxymiaLesson, LocalizedString } from '@/app/maxymia/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

function t(s: LocalizedString | undefined): string {
  return s?.es || s?.en || '';
}

function fmtDateTime(d: string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Barra de progreso simple (no hay componente shadcn Progress instalado). */
function Bar({ percent }: { percent: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-black/[0.06]">
      <div className="h-full rounded-full bg-mx-orange transition-all" style={{ width: `${percent}%` }} />
    </div>
  );
}

function UnitRow({ label, done, sub }: { label: string; done: boolean; sub?: boolean }) {
  return (
    <div className={`flex items-center gap-2 py-1.5 ${sub ? 'pl-7' : ''}`}>
      {done ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
      ) : (
        <Circle className="h-4 w-4 shrink-0 text-muted-foreground/40" />
      )}
      <span className={`text-sm ${done ? '' : 'text-muted-foreground'}`}>{label || '(sin título)'}</span>
    </div>
  );
}

export default async function ProgresoDetallePage({
  params,
}: {
  params: Promise<{ clerkId: string; documentId: string }>;
}) {
  const { clerkId, documentId } = await params;

  const student = await getStudent360(clerkId);
  if (!student) notFound();

  const progressMap = await getAllCourseProgress(clerkId).catch(() => ({} as Record<string, { completedLessons: string[]; lastAccessedAt: string | null }>));
  const entry = progressMap[documentId] as { completedLessons: string[]; lastAccessedAt: string | null } | undefined;
  const completed = new Set(entry?.completedLessons ?? []);
  const lastAccessed = entry?.lastAccessedAt ?? null;

  const content = await resolveContent(documentId).catch(() => null);
  const courseTitle = content?.title ?? documentId;

  // Estructura del curso Maxymia (si aplica).
  let course: MaxymiaCourse | null = null;
  if (content?.type === 'maxymia-course' && content.slug) {
    course = await getMaxymiaCourseBySlugFromStrapi(content.slug).catch(() => null);
  }

  const stats = course ? getCourseProgressStats(course, completed) : null;

  return (
    <div className="space-y-6">
      <Link
        href={`/admin/alumnos/${clerkId}`}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Volver a la ficha
      </Link>

      {/* Cabecera */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{courseTitle}</h1>
        <p className="text-sm text-muted-foreground">
          {student.name} · {student.email ?? '—'}
        </p>
      </div>

      {/* Resumen */}
      <Card>
        <CardContent className="pt-6">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <div className="text-3xl font-bold">
              {stats ? `${stats.percent}%` : entry ? `${completed.size} uds.` : '—'}
            </div>
            <div className="text-sm text-muted-foreground">
              {stats ? `${stats.completed} de ${stats.total} unidades` : `${completed.size} unidades completadas`}
              {lastAccessed ? ` · última conexión ${fmtDateTime(lastAccessed)}` : ''}
            </div>
          </div>
          {stats && <Bar percent={stats.percent} />}
        </CardContent>
      </Card>

      {/* Desglose */}
      {course ? (
        <div className="space-y-4">
          {course.blocks.map((block) => {
            const units = block.lessons.flatMap((l) => lessonUnitIds(l));
            const done = units.filter((u) => completed.has(u)).length;
            return (
              <Card key={block.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-sm">{t(block.title)}</CardTitle>
                    <Badge variant={done === units.length && units.length > 0 ? 'default' : 'secondary'} className={done === units.length && units.length > 0 ? 'border-transparent bg-green-600/10 text-green-700' : ''}>
                      {done}/{units.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="divide-y">
                    {block.lessons.map((lesson: MaxymiaLesson) => {
                      const hasTopics = lesson.topics && lesson.topics.length > 0;
                      const lessonDone = isLessonComplete(lesson, completed);
                      return (
                        <div key={lesson.id} className="py-1">
                          <UnitRow label={t(lesson.title)} done={lessonDone} />
                          {hasTopics &&
                            lesson.topics.map((topic) => (
                              <UnitRow
                                key={topic.id}
                                sub
                                label={t(topic.title)}
                                done={completed.has(topic.uid || topic.id)}
                              />
                            ))}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : content?.type === 'program' ? (
        <ProgramSummary clerkId={clerkId} documentId={documentId} completedCount={completed.size} />
      ) : (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            No se pudo cargar la estructura del curso (¿Strapi no disponible?). El alumno tiene{' '}
            <strong>{completed.size}</strong> unidades completadas
            {lastAccessed ? `, última conexión ${fmtDateTime(lastAccessed)}` : ''}.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

async function ProgramSummary({
  clerkId,
  documentId,
  completedCount,
}: {
  clerkId: string;
  documentId: string;
  completedCount: number;
}) {
  const rows = await getLessonProgress(clerkId, documentId).catch(() => [] as { lessonDocumentId: string; completedAt: Date }[]);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Programa (Moodle)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Este es un programa que se imparte en <strong>Moodle</strong>. El detalle fino (actividades,
          tiempos, notas) se gestiona allí; aquí mostramos las unidades registradas en la plataforma
          ({completedCount} completadas).
        </p>
        {rows.length > 0 && (
          <ul className="divide-y text-sm">
            {rows.map((r) => (
              <li key={r.lessonDocumentId} className="flex items-center gap-2 py-1.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                <span className="truncate text-muted-foreground">{r.lessonDocumentId}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
