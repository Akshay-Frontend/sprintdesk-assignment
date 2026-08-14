import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  COLUMN_ORDER,
  type ColumnId,
  type Priority,
  type Task,
  type TaskComment,
} from '@/types/task';

export interface CreateTaskInput {
  title: string;
  description?: string;
  column?: ColumnId;
  priority: Priority;
  assignee: string;
  dueDate?: string;
}

interface DragSnapshot {
  taskId: string;
  fromColumn: ColumnId;
  fromIndex: number;
  toColumn: ColumnId;
  toIndex: number;
}

interface BoardState {
  tasksById: Record<string, Task>;
  columns: Record<ColumnId, string[]>;
  seeded: boolean;
  lastAction: DragSnapshot | null;
  seed: (tasks: Task[]) => void;
  addTask: (input: CreateTaskInput) => Task;
  updateTask: (id: string, patch: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, toColumn: ColumnId, toIndex: number) => void;
  addComment: (taskId: string, comment: Omit<TaskComment, 'id' | 'createdAt'>) => void;
  undoLastMove: () => void;
  clear: () => void;
}

function emptyColumns(): Record<ColumnId, string[]> {
  return COLUMN_ORDER.reduce(
    (acc, id) => ({ ...acc, [id]: [] }),
    {} as Record<ColumnId, string[]>,
  );
}

function nextId(prefix = 't') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export const useBoardStore = create<BoardState>()(
  persist(
    (set, get) => ({
      tasksById: {},
      columns: emptyColumns(),
      seeded: false,
      lastAction: null,

      seed: (tasks) => {
        if (get().seeded) return;
        const tasksById: Record<string, Task> = {};
        const columns = emptyColumns();
        for (const t of tasks) {
          tasksById[t.id] = t;
          columns[t.column].push(t.id);
        }
        set({ tasksById, columns, seeded: true });
      },

      addTask: (input) => {
        const now = new Date().toISOString();
        const task: Task = {
          id: nextId(),
          title: input.title,
          description: input.description,
          column: input.column ?? 'backlog',
          priority: input.priority,
          assignee: input.assignee,
          dueDate: input.dueDate,
          createdAt: now,
          updatedAt: now,
          comments: [],
        };
        set((state) => ({
          tasksById: { ...state.tasksById, [task.id]: task },
          columns: {
            ...state.columns,
            [task.column]: [task.id, ...state.columns[task.column]],
          },
        }));
        return task;
      },

      updateTask: (id, patch) => {
        set((state) => {
          const existing = state.tasksById[id];
          if (!existing) return state;
          const updated: Task = {
            ...existing,
            ...patch,
            id: existing.id,
            createdAt: existing.createdAt,
            updatedAt: new Date().toISOString(),
          };
          const nextTasksById = { ...state.tasksById, [id]: updated };

          if (patch.column && patch.column !== existing.column) {
            const columns = { ...state.columns };
            columns[existing.column] = columns[existing.column].filter((tid) => tid !== id);
            columns[updated.column] = [id, ...columns[updated.column]];
            return { ...state, tasksById: nextTasksById, columns };
          }
          return { ...state, tasksById: nextTasksById };
        });
      },

      deleteTask: (id) => {
        set((state) => {
          const task = state.tasksById[id];
          if (!task) return state;
          const { [id]: _removed, ...rest } = state.tasksById;
          void _removed;
          return {
            ...state,
            tasksById: rest,
            columns: {
              ...state.columns,
              [task.column]: state.columns[task.column].filter((tid) => tid !== id),
            },
          };
        });
      },

      moveTask: (taskId, toColumn, toIndex) => {
        set((state) => {
          const task = state.tasksById[taskId];
          if (!task) return state;

          const fromColumn = task.column;
          const fromIndex = state.columns[fromColumn].indexOf(taskId);
          if (fromIndex === -1) return state;

          const columns = {
            ...state.columns,
            [fromColumn]: state.columns[fromColumn].filter((id) => id !== taskId),
          };
          const targetList =
            fromColumn === toColumn ? columns[fromColumn] : [...columns[toColumn]];
          const clampedIndex = Math.max(0, Math.min(toIndex, targetList.length));
          targetList.splice(clampedIndex, 0, taskId);
          columns[toColumn] = targetList;

          return {
            ...state,
            tasksById: {
              ...state.tasksById,
              [taskId]: {
                ...task,
                column: toColumn,
                updatedAt: new Date().toISOString(),
              },
            },
            columns,
            lastAction: { taskId, fromColumn, fromIndex, toColumn, toIndex: clampedIndex },
          };
        });
      },

      addComment: (taskId, comment) => {
        set((state) => {
          const task = state.tasksById[taskId];
          if (!task) return state;
          const newComment: TaskComment = {
            ...comment,
            id: nextId('c'),
            createdAt: new Date().toISOString(),
          };
          return {
            ...state,
            tasksById: {
              ...state.tasksById,
              [taskId]: {
                ...task,
                comments: [...task.comments, newComment],
                updatedAt: newComment.createdAt,
              },
            },
          };
        });
      },

      undoLastMove: () => {
        const last = get().lastAction;
        if (!last) return;
        get().moveTask(last.taskId, last.fromColumn, last.fromIndex);
        set({ lastAction: null });
      },

      clear: () =>
        set({
          tasksById: {},
          columns: emptyColumns(),
          seeded: false,
          lastAction: null,
        }),
    }),
    {
      name: 'sd_board',
      partialize: (state) => ({
        tasksById: state.tasksById,
        columns: state.columns,
        seeded: state.seeded,
      }),
    },
  ),
);
