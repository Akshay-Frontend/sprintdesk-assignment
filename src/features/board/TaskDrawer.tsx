import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Trash2, X } from 'lucide-react';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';
import { Select } from '@/ui/Select';
import { ConfirmDialog } from '@/ui/ConfirmDialog';
import {
  COLUMN_LABEL,
  COLUMN_ORDER,
  PRIORITY_LABEL,
  PRIORITY_ORDER,
  type ColumnId,
  type Priority,
  type Task,
} from '@/types/task';
import { useBoardStore } from './boardStore';
import { useAuthStore } from '@/features/auth/authStore';
import { useToast } from '@/lib/hooks/useToast';

export interface TaskDrawerProps {
  task: Task | null;
  onClose: () => void;
}

export function TaskDrawer({ task, onClose }: TaskDrawerProps) {
  const updateTask = useBoardStore((s) => s.updateTask);
  const deleteTask = useBoardStore((s) => s.deleteTask);
  const addComment = useBoardStore((s) => s.addComment);
  const user = useAuthStore((s) => s.user);
  const { toast } = useToast();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [comment, setComment] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [column, setColumn] = useState<ColumnId>('backlog');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (!task) return;
    setTitle(task.title);
    setDescription(task.description ?? '');
    setPriority(task.priority);
    setColumn(task.column);
    setAssignee(task.assignee);
    setDueDate(task.dueDate ? task.dueDate.slice(0, 10) : '');
  }, [task]);

  useEffect(() => {
    if (!task) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    dialogRef.current?.focus();
    return () => document.removeEventListener('keydown', handler);
  }, [task, onClose]);

  if (!task) return null;

  function onSaveDetails(e: FormEvent) {
    e.preventDefault();
    if (!task) return;
    updateTask(task.id, {
      title: title.trim() || task.title,
      description: description.trim() || undefined,
      priority,
      column,
      assignee,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
    });
    toast({ title: 'Task updated', variant: 'success' });
  }

  function onDelete() {
    if (!task) return;
    deleteTask(task.id);
    toast({ title: 'Task deleted', variant: 'success' });
    setConfirmDelete(false);
    onClose();
  }

  function onAddComment(e: FormEvent) {
    e.preventDefault();
    if (!task || !comment.trim()) return;
    addComment(task.id, {
      author: user ? `${user.firstName} ${user.lastName}` : 'You',
      body: comment.trim(),
    });
    setComment('');
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 animate-fade-in" onClick={onClose} aria-hidden />
      <aside
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Task details: ${task.title}`}
        tabIndex={-1}
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-bg shadow-2xl animate-slide-in-right"
      >
        <header className="flex items-start justify-between gap-3 border-b border-border p-4">
          <div>
            <p className="text-xs font-medium uppercase text-fg-muted">
              {COLUMN_LABEL[task.column]}
            </p>
            <h2 className="text-lg font-semibold text-fg line-clamp-2">{task.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-fg-muted hover:bg-bg-muted hover:text-fg"
            aria-label="Close task drawer"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          <form onSubmit={onSaveDetails} className="flex flex-col gap-3">
            <Input
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-fg" htmlFor="drawer-description">
                Description
              </label>
              <textarea
                id="drawer-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px] rounded-md border border-border bg-bg px-3 py-2 text-sm hover:border-border-strong focus:border-brand focus:outline-none"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Select
                label="Column"
                value={column}
                onChange={(e) => setColumn(e.target.value as ColumnId)}
                options={COLUMN_ORDER.map((c) => ({ value: c, label: COLUMN_LABEL[c] }))}
              />
              <Select
                label="Priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                options={PRIORITY_ORDER.map((p) => ({ value: p, label: PRIORITY_LABEL[p] }))}
              />
              <Input
                label="Assignee"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
              />
              <Input
                label="Due date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="danger"
                type="button"
                leftIcon={<Trash2 className="h-4 w-4" />}
                onClick={() => setConfirmDelete(true)}
              >
                Delete
              </Button>
              <Button type="submit">Save changes</Button>
            </div>
          </form>

          <section className="mt-8 border-t border-border pt-4">
            <h3 className="mb-3 text-sm font-semibold text-fg">
              Comments ({task.comments.length})
            </h3>
            <div className="flex flex-col gap-3">
              {task.comments.length === 0 && (
                <p className="text-sm text-fg-muted">No comments yet.</p>
              )}
              {task.comments.map((c) => (
                <div key={c.id} className="rounded-md border border-border bg-bg-subtle p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-semibold text-fg">{c.author}</span>
                    <time className="text-xs text-fg-muted" dateTime={c.createdAt}>
                      {new Date(c.createdAt).toLocaleString()}
                    </time>
                  </div>
                  <p className="text-sm text-fg-muted">{c.body}</p>
                </div>
              ))}
            </div>
            <form onSubmit={onAddComment} className="mt-4 flex flex-col gap-2">
              <textarea
                aria-label="Add a comment"
                placeholder="Write a comment…"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[70px] rounded-md border border-border bg-bg px-3 py-2 text-sm hover:border-border-strong focus:border-brand focus:outline-none"
              />
              <div className="flex justify-end">
                <Button type="submit" size="sm" disabled={!comment.trim()}>
                  Post comment
                </Button>
              </div>
            </form>
          </section>
        </div>
      </aside>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={onDelete}
        title="Delete this task?"
        description="This action cannot be undone."
        confirmLabel="Delete task"
        destructive
      />
    </>
  );
}
