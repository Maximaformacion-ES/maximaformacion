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
  value: CourseOption | null;
  onChange: (c: CourseOption | null) => void;
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

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-80 justify-between font-normal"
        >
          <span className="truncate">{value ? value.title : 'Buscar curso o programa…'}</span>
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
                  {courses.map((c) => (
                    <CommandItem
                      key={c.documentId}
                      value={c.title}
                      onSelect={() => {
                        onChange(c);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4 shrink-0',
                          value?.documentId === c.documentId ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="min-w-0">
                        <div className="truncate">{c.title}</div>
                        <div className="text-xs text-muted-foreground">{c.subtitle}</div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
