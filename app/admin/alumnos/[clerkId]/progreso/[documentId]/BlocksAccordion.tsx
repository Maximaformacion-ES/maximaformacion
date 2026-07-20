'use client';

import { CheckCircle2, Circle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

interface Unit {
  id: string;
  title: string;
  done: boolean;
}
interface Lesson extends Unit {
  topics: Unit[];
}
export interface Block {
  id: string;
  title: string;
  done: number;
  total: number;
  lessons: Lesson[];
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

/** Desglose por bloque como acordeón: uno abierto (el primero) y el resto plegados. */
export default function BlocksAccordion({ blocks }: { blocks: Block[] }) {
  return (
    <Accordion type="single" collapsible defaultValue={blocks[0]?.id} className="space-y-3">
      {blocks.map((block) => {
        const complete = block.total > 0 && block.done === block.total;
        return (
          <AccordionItem
            key={block.id}
            value={block.id}
            className="rounded-lg border bg-card px-4 last:border-b"
          >
            <AccordionTrigger className="py-3 hover:no-underline">
              <div className="flex flex-1 items-center justify-between gap-3 pr-2">
                <span className="text-sm font-medium">{block.title || '(sin título)'}</span>
                <Badge
                  variant={complete ? 'default' : 'secondary'}
                  className={complete ? 'border-transparent bg-green-600/10 text-green-700' : ''}
                >
                  {block.done}/{block.total}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="divide-y">
                {block.lessons.map((lesson) => (
                  <div key={lesson.id} className="py-1">
                    <UnitRow label={lesson.title} done={lesson.done} />
                    {lesson.topics.map((topic) => (
                      <UnitRow key={topic.id} sub label={topic.title} done={topic.done} />
                    ))}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
