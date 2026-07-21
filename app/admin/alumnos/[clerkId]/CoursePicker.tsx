'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

export interface CourseOption {
  documentId: string;
  title: string;
  kind: 'program' | 'maxymia';
  subtitle: string;
}

export default function CoursePicker({
  value,
  onChange,
}: {
  value: CourseOption[];
  onChange: (next: CourseOption[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Cargamos la lista completa la primera vez que se abre (event handler, no
  // effect); el filtrado por nombre lo hace el propio Command en cliente.
  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next && !loaded) {
      setLoading(true);
      fetch('/api/admin/courses')
        .then((r) => r.json())
        .then((d) => {
          setCourses(Array.isArray(d?.courses) ? d.courses : []);
          setLoaded(true);
        })
        .catch(() => setCourses([]))
        .finally(() => setLoading(false));
    }
  }

  function toggle(c: CourseOption) {
    const exists = value.some((v) => v.documentId === c.documentId);
    onChange(exists ? value.filter((v) => v.documentId !== c.documentId) : [...value, c]);
    // NO cerramos el popover: es multiselección.
  }

  const label =
    value.length === 0
      ? 'Buscar cursos o programas…'
      : value.length === 1
        ? value[0].title
        : `${value.length} cursos seleccionados`;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-80 justify-between font-normal"
        >
          <span className="truncate">{label}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Command>
          <CommandInput placeholder="Escribe el nombre…" />
          <CommandList>
            {loading ? (
              <div className="p-3 text-sm text-muted-foreground">Cargando cursos…</div>
            ) : (
              <>
                <CommandEmpty>Sin resultados.</CommandEmpty>
                <CommandGroup>
                  {courses.map((c) => {
                    const selected = value.some((v) => v.documentId === c.documentId);
                    return (
                      <CommandItem key={c.documentId} value={c.title} onSelect={() => toggle(c)}>
                        <Check
                          className={cn('mr-2 h-4 w-4 shrink-0', selected ? 'opacity-100' : 'opacity-0')}
                        />
                        <div className="min-w-0">
                          <div className="truncate">{c.title}</div>
                          <div className="text-xs text-muted-foreground">{c.subtitle}</div>
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
