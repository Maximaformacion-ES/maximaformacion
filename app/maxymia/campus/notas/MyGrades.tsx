'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Award, CheckCircle, XCircle, FileQuestion, Filter } from 'lucide-react';
import { useLocale } from '../../i18n/LocaleProvider';
import { useExamResults } from '@/app/hooks/useExamResults';
import type { MaxymiaCourse } from '../../types';

interface Props {
  courses: MaxymiaCourse[];
}

interface GradeRow {
  courseId: string;
  courseSlug: string;
  courseTitle: string;
  blockTitle: string;
  examTitle: string;
  lastLessonId: string | null;
  examIndex: number;
  score: number;
  passed: boolean;
  completedAt: string;
}

export default function MyGrades({ courses }: Props) {
  const { locale } = useLocale();
  const { results, isLoading } = useExamResults();
  const [filterCourseId, setFilterCourseId] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'passed' | 'failed'>('all');

  const lookup = useMemo(() => {
    const byExamId = new Map<
      string,
      { course: MaxymiaCourse; block: MaxymiaCourse['blocks'][number]; exam: MaxymiaCourse['blocks'][number]['exams'][number]; examIndex: number }
    >();
    for (const course of courses) {
      for (const block of course.blocks) {
        block.exams.forEach((exam, examIndex) => {
          byExamId.set(exam.id, { course, block, exam, examIndex });
        });
      }
    }
    return byExamId;
  }, [courses]);

  const rows = useMemo<GradeRow[]>(() => {
    const out: GradeRow[] = [];
    for (const r of results) {
      const ref = lookup.get(r.examId);
      if (!ref) continue;
      const lastLesson = ref.block.lessons[ref.block.lessons.length - 1];
      out.push({
        courseId: ref.course.id,
        courseSlug: ref.course.slug,
        courseTitle: ref.course.title[locale],
        blockTitle: ref.block.title[locale],
        examTitle: ref.exam.title[locale],
        lastLessonId: lastLesson?.id ?? null,
        examIndex: ref.examIndex,
        score: r.score,
        passed: r.passed,
        completedAt: r.completedAt,
      });
    }
    return out.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  }, [results, lookup, locale]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filterCourseId !== 'all' && r.courseId !== filterCourseId) return false;
      if (filterStatus === 'passed' && !r.passed) return false;
      if (filterStatus === 'failed' && r.passed) return false;
      return true;
    });
  }, [rows, filterCourseId, filterStatus]);

  const courseOptions = useMemo(() => {
    const ids = new Set(rows.map((r) => r.courseId));
    return courses.filter((c) => ids.has(c.id));
  }, [rows, courses]);

  const stats = useMemo(() => {
    if (filtered.length === 0) return { avg: 0, passed: 0, failed: 0 };
    const total = filtered.reduce((sum, r) => sum + r.score, 0);
    return {
      avg: Math.round(total / filtered.length),
      passed: filtered.filter((r) => r.passed).length,
      failed: filtered.filter((r) => !r.passed).length,
    };
  }, [filtered]);

  return (
    <div className="w-full">
      <header className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <Award className="text-mx-orange" size={24} />
            <h1 className="text-heading-md md:text-heading-lg font-black tracking-tight text-mx-blue">
              {locale === 'es' ? 'Mis calificaciones' : 'My grades'}
            </h1>
          </div>
          <p className="text-mx-text-muted text-body-sm mt-1">
          {locale === 'es'
            ? 'Resultados de todos los exámenes de bloque que has realizado.'
            : 'Results of all block exams you have completed.'}
          </p>
        </div>
      </header>

      {!isLoading && rows.length > 0 && (
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
          <StatCard
            label={locale === 'es' ? 'Media' : 'Average'}
            value={`${stats.avg}%`}
            tone="neutral"
          />
          <StatCard
            label={locale === 'es' ? 'Aprobados' : 'Passed'}
            value={String(stats.passed)}
            tone="good"
          />
          <StatCard
            label={locale === 'es' ? 'Suspensos' : 'Failed'}
            value={String(stats.failed)}
            tone="bad"
          />
        </div>
      )}

      {!isLoading && rows.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Filter size={14} className="text-mx-text-muted" />
          <select
            value={filterCourseId}
            onChange={(e) => setFilterCourseId(e.target.value)}
            className="rounded-lg border border-mx-border bg-mx-card px-3 py-2 text-body-sm text-mx-text focus:outline-none focus:ring-2 focus:ring-mx-orange/40"
          >
            <option value="all">{locale === 'es' ? 'Todos los cursos' : 'All courses'}</option>
            {courseOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title[locale]}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'passed' | 'failed')}
            className="rounded-lg border border-mx-border bg-mx-card px-3 py-2 text-body-sm text-mx-text focus:outline-none focus:ring-2 focus:ring-mx-orange/40"
          >
            <option value="all">{locale === 'es' ? 'Todos' : 'All'}</option>
            <option value="passed">{locale === 'es' ? 'Aprobados' : 'Passed'}</option>
            <option value="failed">{locale === 'es' ? 'Suspensos' : 'Failed'}</option>
          </select>
        </div>
      )}

      {isLoading ? (
        <div className="py-12 text-center text-mx-text-muted text-body-sm">
          {locale === 'es' ? 'Cargando…' : 'Loading…'}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState locale={locale} />
      ) : (
        <div className="rounded-xl border border-mx-border bg-mx-card shadow-sm overflow-hidden">
          <table className="w-full text-body-sm">
            <thead className="bg-black/[0.02] border-b border-mx-border">
              <tr className="text-left text-mx-text-muted text-label-md">
                <th className="px-4 py-3 font-medium">{locale === 'es' ? 'Curso' : 'Course'}</th>
                <th className="px-4 py-3 font-medium">{locale === 'es' ? 'Bloque' : 'Block'}</th>
                <th className="px-4 py-3 font-medium text-right">{locale === 'es' ? 'Nota' : 'Score'}</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">{locale === 'es' ? 'Fecha' : 'Date'}</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr
                  key={`${r.courseId}-${r.examTitle}-${i}`}
                  className="border-b border-mx-border last:border-b-0 hover:bg-black/[0.03] transition-colors"
                >
                  <td className="px-4 py-3 text-mx-text truncate max-w-[200px]">{r.courseTitle}</td>
                  <td className="px-4 py-3 text-mx-text-muted truncate max-w-[220px]">{r.blockTitle}</td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-label-sm font-semibold ${
                        r.passed
                          ? 'bg-green-500/10 text-green-700 border border-green-500/30'
                          : 'bg-red-500/10 text-red-700 border border-red-500/30'
                      }`}
                    >
                      {r.passed ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {r.score}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-mx-text-muted text-label-md hidden md:table-cell">
                    {new Date(r.completedAt).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {r.lastLessonId && (
                      <Link
                        href={`/maxymia/campus/${r.courseSlug}/lesson/${r.lastLessonId}/exam?index=${r.examIndex}`}
                        className="inline-flex items-center gap-1 text-mx-orange hover:text-mx-orange-dark text-label-md font-medium"
                      >
                        {locale === 'es' ? 'Reintentar' : 'Retry'}
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string; tone: 'neutral' | 'good' | 'bad' }) {
  const toneClass =
    tone === 'good' ? 'text-green-700' : tone === 'bad' ? 'text-red-700' : 'text-mx-orange';
  return (
    <div className="rounded-xl border border-mx-border bg-mx-card p-5">
      <p className="text-label-sm uppercase tracking-widest text-mx-text-muted mb-1">{label}</p>
      <p className={`text-heading-md font-black ${toneClass}`}>{value}</p>
    </div>
  );
}

function EmptyState({ locale }: { locale: 'es' | 'en' }) {
  return (
    <div className="rounded-xl border border-mx-border bg-mx-card p-10 text-center">
      <FileQuestion className="mx-auto text-mx-text-muted mb-3" size={32} />
      <p className="text-mx-text text-body-sm font-medium mb-1">
        {locale === 'es' ? 'Aún no has hecho ningún examen' : 'You have not taken any exam yet'}
      </p>
      <p className="text-mx-text-muted text-label-md mb-5">
        {locale === 'es'
          ? 'Completa un bloque con examen para ver tus notas aquí.'
          : 'Complete a block with an exam to see your grades here.'}
      </p>
      <Link
        href="/maxymia/campus/mis-cursos"
        className="inline-flex items-center px-5 py-2.5 bg-mx-orange hover:bg-mx-orange-dark text-white text-body-sm font-medium rounded-lg transition-colors"
      >
        {locale === 'es' ? 'Ir a mis cursos' : 'Go to my courses'}
      </Link>
    </div>
  );
}
