'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, Upload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import CoursePicker, { type CourseOption } from './[clerkId]/CoursePicker';

// ── CSV helpers ────────────────────────────────────────────────────────────

const IDENTITY_COLS = new Set([
  'wordpress_id', 'id', 'usuario', 'username', 'user',
  'email', 'correo', 'e-mail',
  'nombre', 'name', 'firstname', 'first_name',
  'apellidos', 'apellido', 'lastname', 'last_name', 'surname',
]);

const TRUTHY = new Set(['si', 'sí', 'yes', 'y', '1', 'true', 'x', 'verdadero']);

function parseCsv(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.replace(/\r\n?/g, '\n').split('\n').filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };
  const delim = (lines[0].match(/;/g)?.length ?? 0) >= (lines[0].match(/,/g)?.length ?? 0) ? ';' : ',';
  const split = (l: string) => l.split(delim).map((c) => c.trim().replace(/^"|"$/g, ''));
  return { headers: split(lines[0]), rows: lines.slice(1).map(split) };
}

function findCol(headers: string[], candidates: string[]): number {
  return headers.findIndex((h) => candidates.includes(h.toLowerCase().trim()));
}

interface RowResult {
  email: string;
  ok: boolean;
  created?: boolean;
  enrolled?: number;
  emailed?: boolean;
  error?: string;
}

// ── Alta manual de un alumno ───────────────────────────────────────────────

function AddOneDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [busy, setBusy] = useState(false);

  function reset() {
    setEmail(''); setFirstName(''); setLastName(''); setCourses([]);
  }

  async function submit() {
    if (!email.includes('@')) { toast.error('Email no válido.'); return; }
    setBusy(true);
    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          firstName: firstName.trim() || undefined,
          lastName: lastName.trim() || undefined,
          courses: courses.map((c) => ({ documentId: c.documentId, title: c.title })),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as RowResult;
      if (!res.ok || !data.ok) { toast.error(data.error || `Error ${res.status}`); return; }
      toast.success(
        data.created
          ? `Alumno creado${data.enrolled ? ` y matriculado en ${data.enrolled}` : ''}. Se le envió el email para crear su contraseña.`
          : `El alumno ya existía. Matrículas nuevas: ${data.enrolled ?? 0}.`,
      );
      reset();
      setOpen(false);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        <Button size="sm"><UserPlus className="mr-2 h-4 w-4" /> Añadir alumno</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Añadir alumno</DialogTitle>
          <DialogDescription>
            Se le crea la cuenta y se le envía un email para que cree su propia contraseña.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="add-email">Email</Label>
            <Input id="add-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alumno@ejemplo.com" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="add-first">Nombre</Label>
              <Input id="add-first" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-last">Apellidos</Label>
              <Input id="add-last" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Cursos (matrícula)</Label>
            <CoursePicker value={courses} onChange={setCourses} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>Cancelar</Button>
          <Button onClick={submit} disabled={busy || !email.includes('@')}>
            {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Crear alumno
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Importación CSV ────────────────────────────────────────────────────────

const IGNORE = '__ignore';

function ImportCsvDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [emailIdx, setEmailIdx] = useState(-1);
  const [firstIdx, setFirstIdx] = useState(-1);
  const [lastIdx, setLastIdx] = useState(-1);
  const [courseCols, setCourseCols] = useState<{ name: string; index: number }[]>([]);
  const [mapping, setMapping] = useState<Record<string, CourseOption | null>>({});
  const [allCourses, setAllCourses] = useState<CourseOption[]>([]);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<RowResult[] | null>(null);

  function resetAll() {
    setHeaders([]); setRows([]); setEmailIdx(-1); setFirstIdx(-1); setLastIdx(-1);
    setCourseCols([]); setMapping({}); setResults(null); setProgress(0);
  }

  async function onFile(file: File) {
    resetAll();
    const text = await file.text();
    const { headers: h, rows: r } = parseCsv(text);
    if (!h.length || !r.length) { toast.error('El CSV está vacío o no se pudo leer.'); return; }
    setHeaders(h); setRows(r);
    setEmailIdx(findCol(h, ['email', 'correo', 'e-mail']));
    setFirstIdx(findCol(h, ['nombre', 'name', 'firstname', 'first_name']));
    setLastIdx(findCol(h, ['apellidos', 'apellido', 'lastname', 'last_name', 'surname']));
    const cols = h
      .map((name, index) => ({ name, index }))
      .filter((c) => !IDENTITY_COLS.has(c.name.toLowerCase().trim()));
    setCourseCols(cols);
    setMapping(Object.fromEntries(cols.map((c) => [c.name, null])));
    // Cargar catálogo para el mapeo
    fetch('/api/admin/courses')
      .then((res) => res.json())
      .then((d) => setAllCourses(Array.isArray(d?.courses) ? d.courses : []))
      .catch(() => setAllCourses([]));
  }

  const validEmails = emailIdx >= 0 ? rows.filter((r) => (r[emailIdx] || '').includes('@')).length : 0;
  const mappedCount = Object.values(mapping).filter(Boolean).length;

  async function runImport() {
    if (emailIdx < 0) { toast.error('No se detectó la columna de email.'); return; }
    setRunning(true);
    setProgress(0);
    const out: RowResult[] = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const email = (row[emailIdx] || '').trim();
      if (!email.includes('@')) { out.push({ email: email || `(fila ${i + 2})`, ok: false, error: 'Sin email válido' }); setProgress(i + 1); continue; }
      const courses = courseCols
        .filter((c) => mapping[c.name] && TRUTHY.has((row[c.index] || '').toLowerCase().trim()))
        .map((c) => ({ documentId: mapping[c.name]!.documentId, title: mapping[c.name]!.title }));
      try {
        const res = await fetch('/api/admin/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            firstName: firstIdx >= 0 ? row[firstIdx] : undefined,
            lastName: lastIdx >= 0 ? row[lastIdx] : undefined,
            courses,
          }),
        });
        const data = (await res.json().catch(() => ({}))) as RowResult;
        out.push({ ...data, email, ok: res.ok && !!data.ok });
      } catch (e) {
        out.push({ email, ok: false, error: e instanceof Error ? e.message : String(e) });
      }
      setProgress(i + 1);
      await new Promise((r) => setTimeout(r, 300)); // throttle Clerk
    }
    setResults(out);
    setRunning(false);
    router.refresh();
  }

  const summary = results && {
    created: results.filter((r) => r.created).length,
    enrolled: results.reduce((a, r) => a + (r.enrolled ?? 0), 0),
    errors: results.filter((r) => !r.ok).length,
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetAll(); }}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline"><Upload className="mr-2 h-4 w-4" /> Importar CSV</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar alumnos desde CSV</DialogTitle>
          <DialogDescription>
            Se crea/reutiliza cada cuenta, se matricula en los cursos marcados y se envía el email de contraseña a los nuevos.
          </DialogDescription>
        </DialogHeader>

        {!headers.length ? (
          <div className="space-y-2">
            <Label htmlFor="csv-file">Archivo CSV</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
            />
            <p className="text-xs text-muted-foreground">
              Columnas esperadas: email, nombre, apellidos y una columna por curso con valores SÍ/NO.
            </p>
          </div>
        ) : results ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span><strong>{summary?.created}</strong> cuentas nuevas · <strong>{summary?.enrolled}</strong> matrículas · <strong>{summary?.errors}</strong> errores</span>
            </div>
            {summary && summary.errors > 0 && (
              <div className="max-h-48 overflow-y-auto rounded-md border p-2 text-xs space-y-1">
                {results.filter((r) => !r.ok).map((r, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-destructive">
                    <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <span><span className="font-medium">{r.email}</span>: {r.error}</span>
                  </div>
                ))}
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => { setOpen(false); resetAll(); }}>Cerrar</Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-md bg-muted/50 p-3 text-sm">
              <strong>{rows.length}</strong> filas · <strong>{validEmails}</strong> con email válido
              {emailIdx < 0 && <span className="text-destructive block mt-1">⚠ No se detectó columna de email.</span>}
            </div>

            <div className="space-y-2">
              <Label>Asignar cada columna de curso a un curso del catálogo</Label>
              {courseCols.length === 0 && <p className="text-xs text-muted-foreground">No se detectaron columnas de curso.</p>}
              {courseCols.map((c) => (
                <div key={c.name} className="flex items-center gap-2">
                  <span className="w-40 shrink-0 truncate text-sm font-mono">{c.name}</span>
                  <Select
                    value={mapping[c.name]?.documentId ?? IGNORE}
                    onValueChange={(v) =>
                      setMapping((m) => ({ ...m, [c.name]: v === IGNORE ? null : allCourses.find((x) => x.documentId === v) ?? null }))
                    }
                  >
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Ignorar" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={IGNORE}>Ignorar esta columna</SelectItem>
                      {allCourses.map((x) => (
                        <SelectItem key={x.documentId} value={x.documentId}>{x.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            {running && (
              <div className="space-y-1">
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-primary transition-all" style={{ width: `${rows.length ? (progress / rows.length) * 100 : 0}%` }} />
                </div>
                <p className="text-xs text-muted-foreground">Importando {progress}/{rows.length}…</p>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => resetAll()} disabled={running}>Otro archivo</Button>
              <Button onClick={runImport} disabled={running || emailIdx < 0 || mappedCount === 0}>
                {running && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Importar {validEmails} alumnos
              </Button>
            </DialogFooter>
            {mappedCount === 0 && !running && (
              <p className="text-xs text-muted-foreground -mt-2">Asigna al menos una columna de curso para importar.</p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function AddStudents() {
  return (
    <div className="flex flex-wrap gap-2">
      <AddOneDialog />
      <ImportCsvDialog />
    </div>
  );
}
