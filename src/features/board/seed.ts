import type { Task, ColumnId, Priority } from '@/types/task';

interface RawTodo {
  id: number;
  userId: number;
  title: string;
  completed: boolean;
}

const COLUMN_BY_MOD: ColumnId[] = ['backlog', 'in_progress', 'review', 'done'];
const PRIORITY_BY_MOD: Priority[] = ['low', 'medium', 'high', 'urgent'];
const ASSIGNEES = [
  'Aditi Rao',
  'Rahul Mehta',
  'Priya Sharma',
  'James Cole',
  'Sofia Alvarez',
  'Aashutosh Pawar',
];

export function todosToTasks(todos: RawTodo[]): Task[] {
  const base = Date.now();
  return todos.map((todo, idx) => {
    const column: ColumnId = todo.completed ? 'done' : COLUMN_BY_MOD[idx % 3];
    const priority = PRIORITY_BY_MOD[idx % PRIORITY_BY_MOD.length];
    const createdAt = new Date(base - (todos.length - idx) * 24 * 3_600_000).toISOString();
    const updatedAt = new Date(
      base - Math.floor(Math.random() * todos.length) * 60 * 60_000,
    ).toISOString();
    const dueDate = new Date(base + (idx % 14) * 24 * 3_600_000).toISOString();

    return {
      id: `seed_${todo.id}`,
      title: todo.title.charAt(0).toUpperCase() + todo.title.slice(1),
      description: `Imported from JSONPlaceholder todo #${todo.id}.`,
      column,
      priority,
      assignee: ASSIGNEES[idx % ASSIGNEES.length],
      dueDate,
      createdAt,
      updatedAt,
      comments: [],
    };
  });
}
