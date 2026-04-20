'use client';

import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, CheckCircle, XCircle, ArrowUp, ArrowDown } from 'lucide-react';
import type { OrderingQuestion as OrderingType, Locale } from '../../types';

interface Props {
  question: OrderingType;
  locale: Locale;
  order: number[];
  onReorder: (newOrder: number[]) => void;
  submitted: boolean;
}

export default function OrderingQuestion({
  question,
  locale,
  order,
  onReorder,
  submitted,
}: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const moveItem = (fromIndex: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= order.length) return;
    onReorder(arrayMove(order, fromIndex, toIndex));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = order.findIndex((i) => String(i) === String(active.id));
    const newIndex = order.findIndex((i) => String(i) === String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder(arrayMove(order, oldIndex, newIndex));
  };

  return (
    <div>
      <p className="text-white font-medium mb-1">{question.question[locale]}</p>
      <p className="text-white/40 text-label-md mb-4">
        {locale === 'es'
          ? 'Arrastra los elementos o usa las flechas para ordenarlos'
          : 'Drag items or use the arrows to order them'}
      </p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={order.map((i) => String(i))}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {order.map((itemIndex, positionIndex) => (
              <SortableItem
                key={itemIndex}
                id={String(itemIndex)}
                label={question.items[itemIndex][locale]}
                positionIndex={positionIndex}
                isFirst={positionIndex === 0}
                isLast={positionIndex === order.length - 1}
                submitted={submitted}
                isCorrectPosition={question.correctOrder[positionIndex] === itemIndex}
                onMoveUp={() => moveItem(positionIndex, 'up')}
                onMoveDown={() => moveItem(positionIndex, 'down')}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

interface SortableItemProps {
  id: string;
  label: string;
  positionIndex: number;
  isFirst: boolean;
  isLast: boolean;
  submitted: boolean;
  isCorrectPosition: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

function SortableItem({
  id,
  label,
  positionIndex,
  isFirst,
  isLast,
  submitted,
  isCorrectPosition,
  onMoveUp,
  onMoveDown,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: submitted });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.9 : 1,
  };

  let borderClass = 'border-white/10';
  let bgClass = 'bg-white/[0.03]';

  if (submitted) {
    borderClass = isCorrectPosition ? 'border-green-500/50' : 'border-red-500/50';
    bgClass = isCorrectPosition ? 'bg-green-500/10' : 'bg-red-500/10';
  } else if (isDragging) {
    borderClass = 'border-mx-orange/50';
    bgClass = 'bg-mx-orange/5';
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${borderClass} ${bgClass} transition-colors ${
        isDragging ? 'shadow-xl' : ''
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        disabled={submitted}
        aria-label="Arrastrar para reordenar"
        className={`flex-shrink-0 text-white/30 ${
          submitted ? 'cursor-default' : 'cursor-grab active:cursor-grabbing hover:text-white/60'
        } touch-none`}
      >
        <GripVertical size={16} />
      </button>
      <span className="text-white/40 text-label-md w-5">{positionIndex + 1}.</span>
      <span className="text-white/80 text-body-sm flex-1">{label}</span>
      {!submitted && (
        <div className="flex gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={isFirst}
            className="p-1 text-white/30 hover:text-mx-orange disabled:opacity-20 transition-colors"
          >
            <ArrowUp size={14} />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={isLast}
            className="p-1 text-white/30 hover:text-mx-orange disabled:opacity-20 transition-colors"
          >
            <ArrowDown size={14} />
          </button>
        </div>
      )}
      {submitted && isCorrectPosition && <CheckCircle size={14} className="text-green-400" />}
      {submitted && !isCorrectPosition && <XCircle size={14} className="text-red-400" />}
    </div>
  );
}
