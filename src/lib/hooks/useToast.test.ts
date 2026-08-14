import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearAllToasts, useToast } from './useToast';

describe('useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    clearAllToasts();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('adds a toast', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.toast({ title: 'Saved' });
    });
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe('Saved');
    expect(result.current.toasts[0].variant).toBe('default');
  });

  it('respects custom variant and description', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.toast({
        title: 'Deleted',
        description: 'The task is gone.',
        variant: 'error',
      });
    });
    expect(result.current.toasts[0].variant).toBe('error');
    expect(result.current.toasts[0].description).toBe('The task is gone.');
  });

  it('dismisses a toast by id', () => {
    const { result } = renderHook(() => useToast());
    let id = '';
    act(() => {
      id = result.current.toast({ title: 'One' });
      result.current.toast({ title: 'Two' });
    });
    expect(result.current.toasts).toHaveLength(2);
    act(() => {
      result.current.dismiss(id);
    });
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe('Two');
  });

  it('auto-dismisses after duration', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.toast({ title: 'Vanishing', duration: 1000 });
    });
    expect(result.current.toasts).toHaveLength(1);
    act(() => {
      vi.advanceTimersByTime(1001);
    });
    expect(result.current.toasts).toHaveLength(0);
  });

  it('does not auto-dismiss when duration is 0', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.toast({ title: 'Sticky', duration: 0 });
    });
    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(result.current.toasts).toHaveLength(1);
  });

  it('clears all toasts', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.toast({ title: 'A' });
      result.current.toast({ title: 'B' });
      result.current.clear();
    });
    expect(result.current.toasts).toHaveLength(0);
  });
});
