import type { ColumnId, Priority, Task } from '@/types/task';
import { COLUMN_LABEL, PRIORITY_LABEL, COLUMN_ORDER, PRIORITY_ORDER } from '@/types/task';

export interface StatusDatum {
  column: ColumnId;
  label: string;
  count: number;
}

export function selectStatusDistribution(tasks: Task[]): StatusDatum[] {
  const counts: Record<ColumnId, number> = {
    backlog: 0,
    in_progress: 0,
    review: 0,
    done: 0,
  };
  tasks.forEach((t) => {
    counts[t.column]++;
  });
  return COLUMN_ORDER.map((c) => ({ column: c, label: COLUMN_LABEL[c], count: counts[c] }));
}

export interface PriorityByColumnDatum {
  column: string;
  low: number;
  medium: number;
  high: number;
  urgent: number;
}

export function selectPriorityByColumn(tasks: Task[]): PriorityByColumnDatum[] {
  return COLUMN_ORDER.map((c) => {
    const filtered = tasks.filter((t) => t.column === c);
    const row: PriorityByColumnDatum = {
      column: COLUMN_LABEL[c],
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0,
    };
    filtered.forEach((t) => {
      row[t.priority]++;
    });
    return row;
  });
}

export interface PriorityBreakdownDatum {
  priority: Priority;
  label: string;
  count: number;
}

export function selectPriorityBreakdown(tasks: Task[]): PriorityBreakdownDatum[] {
  const counts: Record<Priority, number> = { low: 0, medium: 0, high: 0, urgent: 0 };
  tasks.forEach((t) => {
    counts[t.priority]++;
  });
  return PRIORITY_ORDER.map((p) => ({
    priority: p,
    label: PRIORITY_LABEL[p],
    count: counts[p],
  }));
}

export interface CompletionDatum {
  date: string;
  completed: number;
}

/**
 * Buckets updated Done tasks per day for the last N days.
 */
export function selectCompletionTrend(tasks: Task[], days = 14): CompletionDatum[] {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const start = now.getTime() - (days - 1) * 24 * 3_600_000;

  const buckets: Record<string, number> = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(start + i * 24 * 3_600_000);
    const key = d.toISOString().slice(0, 10);
    buckets[key] = 0;
  }

  tasks
    .filter((t) => t.column === 'done')
    .forEach((t) => {
      const key = t.updatedAt.slice(0, 10);
      if (key in buckets) buckets[key]++;
    });

  return Object.entries(buckets).map(([date, completed]) => ({
    date,
    completed,
  }));
}

export interface VelocityDatum {
  sprint: string;
  completed: number;
  total: number;
}

/**
 * Groups tasks into synthetic 2-week sprints ending today, based on createdAt.
 * Returns the last 4 sprints.
 */
export function selectVelocity(tasks: Task[], sprints = 4): VelocityDatum[] {
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  const SPRINT_DAYS = 14;

  return Array.from({ length: sprints }).map((_, i) => {
    const end = now.getTime() - i * SPRINT_DAYS * 24 * 3_600_000;
    const start = end - SPRINT_DAYS * 24 * 3_600_000;
    const inRange = tasks.filter((t) => {
      const created = new Date(t.createdAt).getTime();
      return created >= start && created <= end;
    });
    return {
      sprint: `S-${sprints - i}`,
      completed: inRange.filter((t) => t.column === 'done').length,
      total: inRange.length,
    };
  }).reverse();
}

export interface AnalyticsSummary {
  total: number;
  completed: number;
  inFlight: number;
  overdue: number;
  completionRate: number;
}

export function selectSummary(tasks: Task[]): AnalyticsSummary {
  const today = Date.now();
  let completed = 0;
  let inFlight = 0;
  let overdue = 0;
  tasks.forEach((t) => {
    if (t.column === 'done') completed++;
    else inFlight++;
    if (t.dueDate && new Date(t.dueDate).getTime() < today && t.column !== 'done') overdue++;
  });
  const completionRate = tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100);
  return { total: tasks.length, completed, inFlight, overdue, completionRate };
}
