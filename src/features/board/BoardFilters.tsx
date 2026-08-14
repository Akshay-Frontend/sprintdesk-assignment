import { useMemo } from 'react';
import { Select } from '@/ui/Select';
import { PRIORITY_LABEL, PRIORITY_ORDER, type Priority } from '@/types/task';
import { useBoardStore } from './boardStore';

export interface BoardFilters {
  priority: Priority | 'all';
  assignee: string | 'all';
}

export interface BoardFiltersProps {
  value: BoardFilters;
  onChange: (next: BoardFilters) => void;
}

export function BoardFiltersBar({ value, onChange }: BoardFiltersProps) {
  const tasksById = useBoardStore((s) => s.tasksById);
  const assignees = useMemo(() => {
    const set = new Set<string>();
    Object.values(tasksById).forEach((t) => set.add(t.assignee));
    return Array.from(set).sort();
  }, [tasksById]);

  return (
    <div className="flex flex-wrap items-end gap-3">
      <Select
        label="Priority"
        value={value.priority}
        onChange={(e) => onChange({ ...value, priority: e.target.value as Priority | 'all' })}
        options={[
          { value: 'all', label: 'All priorities' },
          ...PRIORITY_ORDER.map((p) => ({ value: p, label: PRIORITY_LABEL[p] })),
        ]}
        containerClassName="w-40"
      />
      <Select
        label="Assignee"
        value={value.assignee}
        onChange={(e) => onChange({ ...value, assignee: e.target.value })}
        options={[
          { value: 'all', label: 'All assignees' },
          ...assignees.map((a) => ({ value: a, label: a })),
        ]}
        containerClassName="w-48"
      />
    </div>
  );
}
