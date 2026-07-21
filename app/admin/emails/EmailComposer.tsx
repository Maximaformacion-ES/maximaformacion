'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Send, TestTube, ArrowLeft, ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import RichTextEditor from '@/components/admin/RichTextEditor';
import CoursePicker, { type CourseOption } from '@/app/admin/alumnos/[clerkId]/CoursePicker';

type Kind = 'course' | 'pro' | 'inactive' | 'all';

interface Segment {
  kind: Kind;
  documentIds?: string[];
  days?: number;
}

function segmentFor(kind: Kind, courses: CourseOption[], days: number): Segment | null {
  if (kind === 'course') return courses.length ? { kind: 'course', documentIds: courses.map((c) => c.documentId) } : null;
  if (kind === 'inactive') return { kind: 'inactive', days };
  return { kind };
}

function bodyIsEmpty(html: string): boolean {
  return !html || html === '<p></p>' || html.replace(/<[^>]+>/g, '').trim() === '';
}

export default function EmailComposer() {
  const router = useRouter();
  const [subject, setSubject] = useState('');
  const [from, setFrom] = useState('Máxima Formación <cursos@maximaformacion.es>');
  const [replyTo, setReplyTo] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [editorKey, setEditorKey] = useState(0);
  const [kind, setKind] = useState<Kind>('all');
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [days, setDays] = useState(30);
  const [preview, setPreview] = useState<{
    count: number | null;
    recipients: { name: string; email: string }[];
    truncated: boolean;
  }>({ count: null, recipients: [], truncated: false });
  const [page, setPage] = useState(1);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [busy, setBusy] = useState<null | 'test' | 'send'>(null);

  // Preview de audiencia (count + sample). Debounced; el setState solo ocurre en
  // callbacks async (no en el cuerpo del effect) para no disparar cascading renders.
  useEffect(() => {
    const seg = segmentFor(kind, courses, days);
    if (!seg) return;
    const t = setTimeout(() => {
      setLoadingPreview(true);
      fetch('/api/admin/emails/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ segment: seg }),
      })
        .then((r) => r.json())
        .then((d) => {
          setPreview({
            count: typeof d?.count === 'number' ? d.count : null,
            recipients: Array.isArray(d?.recipients) ? d.recipients : [],
            truncated: !!d?.truncated,
          });
          setPage(1);
        })
        .catch(() => setPreview({ count: null, recipients: [], truncated: false }))
        .finally(() => setLoadingPreview(false));
    }, 300);
    return () => clearTimeout(t);
  }, [kind, courses, days]);

  const bodyEmpty = bodyIsEmpty(bodyHtml);
  const canCompose = subject.trim().length > 0 && !bodyEmpty;
  const count = preview.count;
  const previewName = preview.recipients[0]?.name || 'Nombre';
  const previewBody = bodyHtml.replaceAll('{nombre}', previewName);

  // Paginación de la lista de destinatarios: 10 por página.
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(preview.recipients.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageItems = preview.recipients.slice((safePage - 1) * pageSize, safePage * pageSize);

  async function sendTest() {
    if (!canCompose) {
      toast.error('Escribe el asunto y el cuerpo primero.');
      return;
    }
    setBusy('test');
    try {
      const res = await fetch('/api/admin/emails/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, bodyHtml, from, replyTo }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok) toast.success(`Prueba enviada a ${d.to}`);
      else toast.error(d.error || `Error ${res.status}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  async function doSend() {
    const seg = segmentFor(kind, courses, days);
    if (!seg || !canCompose) return;
    setBusy('send');
    try {
      const res = await fetch('/api/admin/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, bodyHtml, segment: seg, from, replyTo }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success(
          `Enviado a ${d.sent}/${d.total}${d.failed ? ` · ${d.failed} fallaron` : ''}`
        );
        setSubject('');
        setBodyHtml('');
        setEditorKey((k) => k + 1);
        router.refresh();
      } else {
        toast.error(d.error || `Error ${res.status}`);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  const sendDisabled = busy !== null || !canCompose || !count || count <= 0;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Composición */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Redactar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="subject">Asunto</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Asunto del email"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="from">Remitente</Label>
              <Input
                id="from"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="Nombre <cuenta@maximaformacion.es>"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="replyto">
                Responder a <span className="font-normal text-muted-foreground">(opcional)</span>
              </Label>
              <Input
                id="replyto"
                value={replyTo}
                onChange={(e) => setReplyTo(e.target.value)}
                placeholder="cuenta@maximaformacion.es"
              />
            </div>
          </div>
          <p className="-mt-2 text-xs text-muted-foreground">
            El remitente debe ser una dirección <span className="font-mono">@maximaformacion.es</span> (dominio
            verificado en Resend).
          </p>

          <div className="space-y-1.5">
            <Label>Cuerpo</Label>
            <RichTextEditor key={editorKey} value={bodyHtml} onChange={setBodyHtml} />
            <p className="text-xs text-muted-foreground">
              Usa <span className="font-mono">{'{nombre}'}</span> para personalizar con el nombre del alumno.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Enviar a</Label>
            <RadioGroup value={kind} onValueChange={(v) => setKind(v as Kind)} className="gap-2">
              <SegmentOption value="course" label="Matriculados en curso(s)" />
              <SegmentOption value="pro" label="Alumnos PRO" />
              <SegmentOption value="inactive" label="Alumnos inactivos" />
              <SegmentOption value="all" label="Todos los alumnos" />
            </RadioGroup>

            {kind === 'course' && (
              <div className="pt-1">
                <CoursePicker value={courses} onChange={setCourses} />
              </div>
            )}
            {kind === 'inactive' && (
              <div className="flex items-center gap-2 pt-1 text-sm">
                Sin actividad en los últimos
                <Input
                  type="number"
                  min={1}
                  value={days}
                  onChange={(e) => setDays(Math.max(1, Number(e.target.value) || 30))}
                  className="h-8 w-20"
                />
                días.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview + envío */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Vista previa</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Meta tipo bandeja de entrada */}
            <div className="mb-3 rounded-md bg-muted/40 px-3 py-2 text-xs">
              <div>
                <span className="text-muted-foreground">Asunto:</span>{' '}
                <span className="font-medium">{subject || '(sin asunto)'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">De:</span> {from || '—'}
              </div>
            </div>

            {/* El email tal cual se enviará */}
            <div className="mx-auto max-w-[600px] overflow-hidden rounded-2xl border border-[#ececec] bg-white shadow-sm">
              <div className="px-6 py-5" style={{ borderBottom: '3px solid #F7A000' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-maxima.png" alt="Máxima Formación" className="h-7 w-auto" />
              </div>
              <div className="px-6 py-7">
                {bodyEmpty ? (
                  <p className="text-sm text-muted-foreground">El cuerpo del email aparecerá aquí…</p>
                ) : (
                  <div
                    className="tiptap-editor text-[15px] leading-relaxed text-[#2b2b2b] [&_a]:text-mx-orange [&_a]:underline"
                    // Contenido del propio admin (confiable). Sustituye {nombre}.
                    dangerouslySetInnerHTML={{ __html: previewBody }}
                  />
                )}
              </div>
              <div className="border-t bg-neutral-50 px-6 py-4 text-xs text-neutral-400">
                Has recibido este email como alumno de{' '}
                <strong className="text-neutral-500">Máxima Formación</strong>.
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 pt-6">
            <div className="space-y-2">
              <div className="text-sm">
                {loadingPreview ? (
                  <span className="text-muted-foreground">Calculando destinatarios…</span>
                ) : count == null ? (
                  <span className="text-muted-foreground">
                    {kind === 'course' ? 'Elige uno o más cursos.' : 'Selecciona un segmento.'}
                  </span>
                ) : count === 0 ? (
                  <span className="text-muted-foreground">Ningún alumno coincide con este segmento.</span>
                ) : (
                  <span>
                    Se enviará a estos <strong>{count.toLocaleString('es-ES')}</strong>{' '}
                    {count === 1 ? 'alumno' : 'alumnos'}:
                  </span>
                )}
              </div>

              {count != null && count > 0 && (
                <div className="space-y-2">
                  <div className="divide-y rounded-md border text-sm">
                    {pageItems.map((r, i) => (
                      <div
                        key={`${r.email}-${i}`}
                        className="flex items-center justify-between gap-3 px-3 py-1.5"
                      >
                        <span className="truncate">{r.name}</span>
                        <span className="truncate text-xs text-muted-foreground">{r.email}</span>
                      </div>
                    ))}
                  </div>
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between text-xs">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={safePage <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="gap-1"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Anterior
                      </Button>
                      <span className="text-muted-foreground">
                        Página {safePage} de {totalPages}
                        {preview.truncated ? ' · primeros 2000' : ''}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={safePage >= totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        className="gap-1"
                      >
                        Siguiente
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={sendTest} disabled={busy !== null || !canCompose} className="gap-1.5">
                <TestTube className="size-4" />
                Enviar prueba a mí
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button disabled={sendDisabled} className="gap-1.5 bg-mx-orange text-white hover:bg-mx-orange-dark">
                    <Send className="size-4" />
                    Enviar{count ? ` a ${count.toLocaleString('es-ES')}` : ''}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Enviar este email a {count?.toLocaleString('es-ES')} alumnos?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Es un envío <strong>real</strong> a {count?.toLocaleString('es-ES')} personas. Revisa el asunto,
                      el cuerpo y el segmento. Recomendado: envía primero una prueba a ti mismo.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={doSend}
                      className="bg-mx-orange text-white hover:bg-mx-orange-dark"
                    >
                      Enviar ahora
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <p className="text-xs text-muted-foreground">
              Emails operativos/relacionales. El marketing masivo va por Klaviyo (con baja/consentimiento).
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SegmentOption({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <RadioGroupItem value={value} id={`seg-${value}`} />
      <Label htmlFor={`seg-${value}`} className="font-normal">
        {label}
      </Label>
    </div>
  );
}
