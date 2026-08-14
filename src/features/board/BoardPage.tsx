import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Plus, Undo2 } from 'lucide-react';
import { Button } from '@/ui/Button';
import { Skeleton } from '@/ui/Skeleton';
import { COLUMN_ORDER, type ColumnId, type Task } from '@/types/task';
import { useBoardStore } from './boardStore';
import { useSeedBoard } from './useSeedBoard';
import { Column } from './Column';
import { TaskCard } from './TaskCard';
import { TaskDrawer } from './TaskDrawer';
import { CreateTaskModal } from './CreateTaskModal';
import { BoardFiltersBar, type BoardFilters } from './BoardFilters';
import { useToast } from '@/lib/hooks/useToast';

function useOpenTask() {
  const [params, setParams] = useSearchParams();
  const openId = params.get('task');
  const setOpen = (id: string | null) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (id) next.set('task', id);
        else next.delete('task');
        return next;
      },
      { replace: true },
    );
  };
  return [openId, setOpen] as const;
}

export function BoardPage() {
  const { loading } = useSeedBoard();
  const tasksById = useBoardStore((s) => s.tasksById);
  const columns = useBoardStore((s) => s.columns);
  const moveTask = useBoardStore((s) => s.moveTask);
  const undoLastMove = useBoardStore((s) => s.undoLastMove);
  const lastAction = useBoardStore((s) => s.lastAction);

  const { toast } = useToast();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [openTaskId, setOpenTaskId] = useOpenTask();
  const [createOpen, setCreateOpen] = useState(false);
  const [filters, setFilters] = useState<BoardFilters>({ priority: 'all', assignee: 'all' });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const filtered = useMemo(() => {
    const result: Record<ColumnId, Task[]> = {
      backlog: [],
      in_progress: [],
      review: [],
      done: [],
    };
    for (const col of COLUMN_ORDER) {
      for (const id of columns[col]) {
        const task = tasksById[id];
        if (!task) continue;
        if (filters.priority !== 'all' && task.priority !== filters.priority) continue;
        if (filters.assignee !== 'all' && task.assignee !== filters.assignee) continue;
        result[col].push(task);
      }
    }
    return result;
  }, [tasksById, columns, filters]);

  const openTask = openTaskId ? tasksById[openTaskId] ?? null : null;
  const activeTask = activeId ? tasksById[activeId] ?? null : null;

  function onDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activeTaskId = String(active.id);
    const activeTask = tasksById[activeTaskId];
    if (!activeTask) return;

    const overId = String(over.id);
    let targetColumn: ColumnId;
    let targetIndex: number;

    if (overId.startsWith('column-')) {
      targetColumn = overId.slice('column-'.length) as ColumnId;
      targetIndex = columns[targetColumn].length;
    } else {
      const overTask = tasksById[overId];
      if (!overTask) return;
      targetColumn = overTask.column;
      targetIndex = columns[targetColumn].indexOf(overId);
    }

    if (activeTask.column === targetColumn) {
      const currentIndex = columns[targetColumn].indexOf(activeTaskId);
      if (currentIndex === targetIndex) return;
    }

    moveTask(activeTaskId, targetColumn, targetIndex);
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-fg">Sprint Board</h1>
          <p className="text-sm text-fg-muted">Drag cards to move work through the sprint.</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <BoardFiltersBar value={filters} onChange={setFilters} />
          <Button
            variant="secondary"
            leftIcon={<Undo2 className="h-4 w-4" />}
            disabled={!lastAction}
            onClick={() => {
              undoLastMove();
              toast({ title: 'Move undone', variant: 'info' });
            }}
          >
            Undo
          </Button>
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>
            New task
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMN_ORDER.map((c) => (
            <div key={c} className="w-72 shrink-0 rounded-lg border border-border bg-bg-subtle p-3">
              <Skeleton className="mb-3 h-4 w-24" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragCancel={() => setActiveId(null)}
        >
          <div className="flex min-h-[65vh] gap-4 overflow-x-auto pb-4">
            {COLUMN_ORDER.map((c) => (
              <Column
                key={c}
                id={c}
                tasks={filtered[c]}
                onOpenTask={(t) => setOpenTaskId(t.id)}
              />
            ))}
          </div>
          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} onOpen={() => {}} overlay /> : null}
          </DragOverlay>
        </DndContext>
      )}

      <TaskDrawer task={openTask} onClose={() => setOpenTaskId(null)} />
      <CreateTaskModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
