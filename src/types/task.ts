export type ColumnId = 'backlog' | 'in_progress' | 'review' | 'done';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface TaskComment {
  id: string;
  author: string;
  body: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  column: ColumnId;
  priority: Priority;
  assignee: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  comments: TaskComment[];
}

export const COLUMN_ORDER: ColumnId[] = ['backlog', 'in_progress', 'review', 'done'];

export const COLUMN_LABEL: Record<ColumnId, string> = {
  backlog: 'Backlog',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done',
};

export const PRIORITY_ORDER: Priority[] = ['low', 'medium', 'high', 'urgent'];

export const PRIORITY_LABEL: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};
