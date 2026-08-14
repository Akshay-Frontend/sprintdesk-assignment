import { useSyncExternalStore } from 'react';

export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration: number;
}

export interface ToastInput {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

let toasts: Toast[] = [];
const listeners = new Set<() => void>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return toasts;
}

function nextId() {
  return `t_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function pushToast(input: ToastInput): string {
  const toast: Toast = {
    id: nextId(),
    title: input.title,
    description: input.description,
    variant: input.variant ?? 'default',
    duration: input.duration ?? 4000,
  };
  toasts = [...toasts, toast];
  emit();
  if (toast.duration > 0) {
    const timer = setTimeout(() => dismissToast(toast.id), toast.duration);
    timers.set(toast.id, timer);
  }
  return toast.id;
}

export function dismissToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  const timer = timers.get(id);
  if (timer) {
    clearTimeout(timer);
    timers.delete(id);
  }
  emit();
}

export function clearAllToasts() {
  timers.forEach((t) => clearTimeout(t));
  timers.clear();
  toasts = [];
  emit();
}

export function useToast() {
  const list = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return {
    toasts: list,
    toast: pushToast,
    dismiss: dismissToast,
    clear: clearAllToasts,
  };
}
