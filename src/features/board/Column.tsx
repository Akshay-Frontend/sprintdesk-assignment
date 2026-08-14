import { memo } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Badge } from '@/ui/Badge';
import { COLUMN_LABEL, type ColumnId, type Task } from '@/types/task';
import { cn } from '@/lib/utils/cn';
import { TaskCard } from './TaskCard';

export interface ColumnProps {
  id: ColumnId;
  tasks: Task[];
  onOpenTask: (task: Task) => void;
}

function ColumnImpl({ id, tasks, onOpenTask }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${id}`,
    data: { type: 'column', columnId: id },
  });

  return (
    <section
      ref={setNodeRef}
      aria-label={COLUMN_LABEL[id]}
      className={cn(
        'flex h-full min-h-0 w-72 shrink-0 flex-col rounded-lg border border-border bg-bg-subtle p-3 transition-colors',
        isOver && 'border-brand bg-brand-subtle/30',
      )}
    >
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-fg">{COLUMN_LABEL[id]}</h2>
        <Badge>{tasks.length}</Badge>
      </header>
      <div className="flex min-h-[80px] flex-1 flex-col gap-2 overflow-y-auto pr-1">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <p className="rounded-md border border-dashed border-border py-6 text-center text-xs text-fg-subtle">
              Drop tasks here
            </p>
          ) : (
            tasks.map((task) => (
              <TaskCard key={task.id} task={task} onOpen={onOpenTask} />
            ))
          )}
        </SortableContext>
      </div>
    </section>
  );
}

export const Column = memo(ColumnImpl);
