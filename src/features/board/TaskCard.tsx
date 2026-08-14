import { memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, GripVertical, MessageSquare } from 'lucide-react';
import { Badge } from '@/ui/Badge';
import { cn } from '@/lib/utils/cn';
import type { Task, Priority } from '@/types/task';

const priorityTone: Record<Priority, 'neutral' | 'brand' | 'warning' | 'danger'> = {
  low: 'neutral',
  medium: 'brand',
  high: 'warning',
  urgent: 'danger',
};

const priorityLabel: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export interface TaskCardProps {
  task: Task;
  onOpen: (task: Task) => void;
  overlay?: boolean;
}

function TaskCardImpl({ task, onOpen, overlay }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'task', columnId: task.column },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      style={overlay ? undefined : style}
      className={cn(
        'group flex flex-col gap-2 rounded-md border border-border bg-bg p-3 shadow-sm transition-shadow',
        !overlay && 'hover:shadow-md',
        isDragging && !overlay && 'opacity-40',
        overlay && 'rotate-1 shadow-lg',
      )}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          aria-label={`Reorder task ${task.title}`}
          className="mt-0.5 cursor-grab touch-none rounded p-0.5 text-fg-subtle hover:text-fg focus-visible:ring-2 focus-visible:ring-brand"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => onOpen(task)}
          className="min-w-0 flex-1 text-left"
        >
          <p className="line-clamp-2 text-sm font-medium text-fg">{task.title}</p>
        </button>
      </div>
      <div className="flex items-center gap-2 pl-6">
        <Badge tone={priorityTone[task.priority]}>{priorityLabel[task.priority]}</Badge>
        {task.dueDate && (
          <span className="inline-flex items-center gap-1 text-xs text-fg-muted">
            <Calendar className="h-3 w-3" aria-hidden />
            {new Date(task.dueDate).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        )}
        {task.comments.length > 0 && (
          <span
            className="inline-flex items-center gap-1 text-xs text-fg-muted"
            aria-label={`${task.comments.length} comments`}
          >
            <MessageSquare className="h-3 w-3" aria-hidden />
            {task.comments.length}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 pl-6 text-xs text-fg-muted">
        <span
          aria-hidden
          className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-subtle text-[10px] font-semibold text-brand"
        >
          {task.assignee.charAt(0)}
        </span>
        <span className="truncate">{task.assignee}</span>
      </div>
    </div>
  );
}

export const TaskCard = memo(TaskCardImpl);
