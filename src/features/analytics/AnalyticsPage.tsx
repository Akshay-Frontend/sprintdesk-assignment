import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Input } from '@/ui/Input';
import { useBoardStore } from '@/features/board/boardStore';
import {
  selectCompletionTrend,
  selectPriorityByColumn,
  selectStatusDistribution,
  selectSummary,
  selectVelocity,
} from './selectors';

const STATUS_COLORS = ['#94a3b8', '#6366f1', '#f59e0b', '#22c55e'];
const PRIORITY_COLORS = {
  low: '#94a3b8',
  medium: '#6366f1',
  high: '#f59e0b',
  urgent: '#ef4444',
};

interface DateRange {
  from: string;
  to: string;
}

function defaultRange(): DateRange {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

export function AnalyticsPage() {
  const tasksById = useBoardStore((s) => s.tasksById);
  const allTasks = useMemo(() => Object.values(tasksById), [tasksById]);
  const [range, setRange] = useState<DateRange>(defaultRange);

  const filtered = useMemo(() => {
    const from = new Date(range.from).getTime();
    const to = new Date(range.to).getTime() + 24 * 3_600_000 - 1;
    return allTasks.filter((t) => {
      const c = new Date(t.createdAt).getTime();
      return c >= from && c <= to;
    });
  }, [allTasks, range]);

  const status = useMemo(() => selectStatusDistribution(filtered), [filtered]);
  const priorityByColumn = useMemo(() => selectPriorityByColumn(filtered), [filtered]);
  const trend = useMemo(() => selectCompletionTrend(filtered, 14), [filtered]);
  const velocity = useMemo(() => selectVelocity(filtered, 4), [filtered]);
  const summary = useMemo(() => selectSummary(filtered), [filtered]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-fg">Analytics</h1>
          <p className="text-sm text-fg-muted">Sprint metrics derived from your board.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Input
            label="From"
            type="date"
            value={range.from}
            onChange={(e) => setRange({ ...range, from: e.target.value })}
            containerClassName="w-40"
          />
          <Input
            label="To"
            type="date"
            value={range.to}
            onChange={(e) => setRange({ ...range, to: e.target.value })}
            containerClassName="w-40"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard label="Total tasks" value={summary.total} />
        <SummaryCard label="Completed" value={summary.completed} tone="success" />
        <SummaryCard label="In flight" value={summary.inFlight} tone="brand" />
        <SummaryCard label="Overdue" value={summary.overdue} tone="danger" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Sprint velocity" description="Completed tasks per synthetic 2-week sprint">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={velocity} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" />
              <XAxis dataKey="sprint" tick={{ fill: 'rgb(var(--fg-muted))', fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fill: 'rgb(var(--fg-muted))', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgb(var(--bg))',
                  borderColor: 'rgb(var(--border))',
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="total" name="Total" fill="#c7d2fe" radius={[4, 4, 0, 0]} isAnimationActive />
              <Bar dataKey="completed" name="Completed" fill="#4f46e5" radius={[4, 4, 0, 0]} isAnimationActive />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Task status" description="Distribution across board columns">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={status}
                dataKey="count"
                nameKey="label"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
                isAnimationActive
              >
                {status.map((_, i) => (
                  <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgb(var(--bg))',
                  borderColor: 'rgb(var(--border))',
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Priority by column" description="Stacked breakdown of priorities">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={priorityByColumn} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" />
              <XAxis dataKey="column" tick={{ fill: 'rgb(var(--fg-muted))', fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fill: 'rgb(var(--fg-muted))', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgb(var(--bg))',
                  borderColor: 'rgb(var(--border))',
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="low" stackId="p" fill={PRIORITY_COLORS.low} isAnimationActive />
              <Bar dataKey="medium" stackId="p" fill={PRIORITY_COLORS.medium} isAnimationActive />
              <Bar dataKey="high" stackId="p" fill={PRIORITY_COLORS.high} isAnimationActive />
              <Bar
                dataKey="urgent"
                stackId="p"
                fill={PRIORITY_COLORS.urgent}
                radius={[4, 4, 0, 0]}
                isAnimationActive
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Completion trend" description="Tasks moved to Done over the last 14 days">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trend} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" />
              <XAxis
                dataKey="date"
                tick={{ fill: 'rgb(var(--fg-muted))', fontSize: 11 }}
                tickFormatter={(v: string) =>
                  new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                }
              />
              <YAxis allowDecimals={false} tick={{ fill: 'rgb(var(--fg-muted))', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgb(var(--bg))',
                  borderColor: 'rgb(var(--border))',
                }}
              />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#4f46e5"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                isAnimationActive
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

interface SummaryCardProps {
  label: string;
  value: number | string;
  tone?: 'default' | 'success' | 'brand' | 'danger';
}

function SummaryCard({ label, value, tone = 'default' }: SummaryCardProps) {
  const toneClasses = {
    default: 'text-fg',
    success: 'text-success',
    brand: 'text-brand',
    danger: 'text-danger',
  };
  return (
    <div className="rounded-lg border border-border bg-bg p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-fg-muted">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${toneClasses[tone]}`}>{value}</p>
    </div>
  );
}

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

function ChartCard({ title, description, children }: ChartCardProps) {
  return (
    <section className="rounded-lg border border-border bg-bg p-4">
      <header className="mb-4">
        <h2 className="text-sm font-semibold text-fg">{title}</h2>
        {description && <p className="text-xs text-fg-muted">{description}</p>}
      </header>
      {children}
    </section>
  );
}
