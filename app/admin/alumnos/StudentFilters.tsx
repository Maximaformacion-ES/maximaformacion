'use client';

import { useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

interface CourseOpt {
  documentId: string;
  title: string;
}

// `false` en SSR y en el PRIMER render de cliente; `true` tras hidratar. Evita el
// mismatch de hidratación por el `useId` del Popover de Radix (mismo patrón que NavUser).
const emptySubscribe = () => () => {};
function useHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
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
  const hydrated = useHydrated();
  const [query, setQuery] = useState(q);
  const [pro, setPro] = useState(plan === 'pro');
  const [courseId, setCourseId] = useState(course ?? '');
  const [courseOpen, setCourseOpen] = useState(false);

  const dirty = !!plan || !!course;
  const selectedCourse = courses.find((c) => c.documentId === courseId);
  const courseLabel = selectedCourse ? selectedCourse.title : 'Todos los cursos';

  function apply() {
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (pro) params.set('plan', 'pro');
    if (courseId) params.set('course', courseId);
    const qs = params.toString();
    router.push(qs ? `/admin/alumnos?${qs}` : '/admin/alumnos');
  }

  function clear() {
    setQuery('');
    setPro(false);
    setCourseId('');
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

      {!hydrated ? (
        // Placeholder estable (sin Radix) en SSR + primer render → sin mismatch.
        <Button type="button" variant="outline" className="w-[240px] justify-between font-normal" disabled>
          <span className="truncate">{courseLabel}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      ) : (
        <Popover open={courseOpen} onOpenChange={setCourseOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={courseOpen}
              className="w-[240px] justify-between font-normal"
            >
              <span className="truncate">{courseLabel}</span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[280px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Buscar curso…" />
              <CommandList>
                <CommandEmpty>Sin resultados.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    value="Todos los cursos"
                    onSelect={() => {
                      setCourseId('');
                      setCourseOpen(false);
                    }}
                  >
                    <Check className={cn('mr-2 h-4 w-4', courseId === '' ? 'opacity-100' : 'opacity-0')} />
                    Todos los cursos
                  </CommandItem>
                  {courses.map((c) => (
                    <CommandItem
                      key={c.documentId}
                      value={c.title}
                      onSelect={() => {
                        setCourseId(c.documentId);
                        setCourseOpen(false);
                      }}
                    >
                      <Check className={cn('mr-2 h-4 w-4', courseId === c.documentId ? 'opacity-100' : 'opacity-0')} />
                      <span className="truncate">{c.title}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}

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
