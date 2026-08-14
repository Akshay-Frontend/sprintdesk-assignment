import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ListTodo, Timer, TriangleAlert } from 'lucide-react';
import { useBoardStore } from '@/features/board/boardStore';
import { useSeedBoard } from '@/features/board/useSeedBoard';
import { useAuthStore } from '@/features/auth/authStore';
import { selectSummary } from '@/features/analytics/selectors';
import { Skeleton } from '@/ui/Skeleton';
import { Badge } from '@/ui/Badge';
import { COLUMN_LABEL } from '@/types/task';

export function DashboardPage() {
  useSeedBoard();
  const user = useAuthStore((s) => s.user);
  const tasksById = useBoardStore((s) => s.tasksById);
  const seeded = useBoardStore((s) => s.seeded);

  const tasks = useMemo(() => Object.values(tasksById), [tasksById]);
  const summary = useMemo(() => selectSummary(tasks), [tasks]);

  const recent = useMemo(
    () =>
      [...tasks]
        .sort((a, b) => (a.updatedAt > b.updatedAt ? -1 : 1))
        .slice(0, 6),
    [tasks],
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-fg">
          Good to see you{user ? `, ${user.firstName}` : ''}
        </h1>
        <p className="text-sm text-fg-muted">Here's what's happening in your sprint.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryTile label="Total" value={summary.total} icon={ListTodo} />
        <SummaryTile label="Completed" value={summary.completed} icon={CheckCircle2} tone="success" />
        <SummaryTile label="In flight" value={summary.inFlight} icon={Timer} tone="brand" />
        <SummaryTile label="Overdue" value={summary.overdue} icon={TriangleAlert} tone="danger" />
      </div>

      <section className="rounded-lg border border-border bg-bg p-4">
        <header className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-fg">Recent activity</h2>
            <p className="text-xs text-fg-muted">Most recently updated tasks.</p>
          </div>
          <Link
            to="/board"
            className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
          >
            Open board <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </header>
        <ul className="divide-y divide-border">
          {!seeded &&
            Array.from({ length: 4 }).map((_, i) => (
              <li key={`sk-${i}`} className="flex items-center gap-3 py-3">
                <Skeleton className="h-4 w-full" />
              </li>
            ))}
          {seeded && recent.length === 0 && (
            <li className="py-4 text-sm text-fg-muted">No tasks yet.</li>
          )}
          {recent.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-3 py-3">
              <Link
                to={`/board?task=${t.id}`}
                className="min-w-0 flex-1 truncate text-sm font-medium text-fg hover:underline"
              >
                {t.title}
              </Link>
              <div className="flex items-center gap-2">
                <Badge>{COLUMN_LABEL[t.column]}</Badge>
                <time className="hidden text-xs text-fg-muted sm:block" dateTime={t.updatedAt}>
                  {new Date(t.updatedAt).toLocaleDateString()}
                </time>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

interface TileProps {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  tone?: 'default' | 'success' | 'brand' | 'danger';
}

function SummaryTile({ label, value, icon: Icon, tone = 'default' }: TileProps) {
  const iconTone = {
    default: 'text-fg-muted',
    success: 'text-success',
    brand: 'text-brand',
    danger: 'text-danger',
  }[tone];
  return (
    <div className="rounded-lg border border-border bg-bg p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-fg-muted">{label}</p>
        <Icon className={`h-4 w-4 ${iconTone}`} aria-hidden />
      </div>
      <p className="mt-2 text-2xl font-semibold text-fg">{value}</p>
    </div>
  );
}
