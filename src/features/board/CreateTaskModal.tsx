import { useState, type FormEvent } from 'react';
import { Modal } from '@/ui/Modal';
import { Input } from '@/ui/Input';
import { Select } from '@/ui/Select';
import { Button } from '@/ui/Button';
import { PRIORITY_LABEL, PRIORITY_ORDER, type Priority } from '@/types/task';
import { useBoardStore } from './boardStore';
import { useToast } from '@/lib/hooks/useToast';

const ASSIGNEE_OPTIONS = [
  'Aditi Rao',
  'Rahul Mehta',
  'Priya Sharma',
  'James Cole',
  'Sofia Alvarez',
  'Aashutosh Pawar',
];

export interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateTaskModal({ open, onClose }: CreateTaskModalProps) {
  const addTask = useBoardStore((s) => s.addTask);
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [assignee, setAssignee] = useState(ASSIGNEE_OPTIONS[0]);
  const [dueDate, setDueDate] = useState('');

  function reset() {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setAssignee(ASSIGNEE_OPTIONS[0]);
    setDueDate('');
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    addTask({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      assignee,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
    });
    toast({ title: 'Task created', variant: 'success' });
    reset();
    onClose();
  }

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Create new task"
      description="Add a task to the Backlog column."
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" form="create-task-form" disabled={!title.trim()}>
            Create task
          </Button>
        </>
      }
    >
      <form id="create-task-form" onSubmit={onSubmit} className="flex flex-col gap-4">
        <Input
          label="Title"
          required
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Refactor auth interceptor"
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-fg" htmlFor="task-description">
            Description
          </label>
          <textarea
            id="task-description"
            className="min-h-[80px] rounded-md border border-border bg-bg px-3 py-2 text-sm hover:border-border-strong focus:border-brand focus:outline-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional context"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            options={PRIORITY_ORDER.map((p) => ({ value: p, label: PRIORITY_LABEL[p] }))}
          />
          <Select
            label="Assignee"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            options={ASSIGNEE_OPTIONS.map((a) => ({ value: a, label: a }))}
          />
        </div>
        <Input
          label="Due date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </form>
    </Modal>
  );
}
