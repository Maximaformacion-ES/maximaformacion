'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CourseOpt {
  documentId: string;
  title: string;
}

export default function StudentFilters({
  q,
  plan,
  course,
  courses,
}: {
  q: string;
  plan?: string;
  course?: string;
  courses: CourseOpt[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState(q);
  const [pro, setPro] = useState(plan === 'pro');
  // 'all' es el centinela para "todos" (Radix Select no admite value vacío).
  const [courseId, setCourseId] = useState(course ?? 'all');

  const dirty = !!plan || !!course;

  function apply() {
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (pro) params.set('plan', 'pro');
    if (courseId && courseId !== 'all') params.set('course', courseId);
    const qs = params.toString();
    router.push(qs ? `/admin/alumnos?${qs}` : '/admin/alumnos');
  }

  function clear() {
    setQuery('');
    setPro(false);
    setCourseId('all');
    router.push('/admin/alumnos');
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        apply();
      }}
      className="flex flex-wrap items-center gap-2"
    >
      <div className="relative w-full max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nombre o email…"
          className="pl-8"
        />
      </div>

      <Select value={courseId} onValueChange={setCourseId}>
        <SelectTrigger className="w-[240px]">
          <SelectValue placeholder="Todos los cursos" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los cursos</SelectItem>
          {courses.map((c) => (
            <SelectItem key={c.documentId} value={c.documentId}>
              {c.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Label className="flex cursor-pointer items-center gap-2 text-sm font-normal text-muted-foreground">
        <Checkbox checked={pro} onCheckedChange={(v) => setPro(v === true)} />
        Solo PRO
      </Label>

      <Button type="submit" className="bg-mx-orange text-white hover:bg-mx-orange-dark">
        Filtrar
      </Button>
      {dirty && (
        <Button type="button" variant="ghost" onClick={clear} className="text-muted-foreground">
          Limpiar
        </Button>
      )}
    </form>
  );
}
