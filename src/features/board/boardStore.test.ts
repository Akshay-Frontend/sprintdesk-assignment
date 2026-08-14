import { beforeEach, describe, expect, it } from 'vitest';
import { useBoardStore } from './boardStore';
import type { Task } from '@/types/task';

function seedTwo() {
  const now = new Date().toISOString();
  const tasks: Task[] = [
    {
      id: 't1',
      title: 'First',
      column: 'backlog',
      priority: 'low',
      assignee: 'A',
      createdAt: now,
      updatedAt: now,
      comments: [],
    },
    {
      id: 't2',
      title: 'Second',
      column: 'in_progress',
      priority: 'high',
      assignee: 'B',
      createdAt: now,
      updatedAt: now,
      comments: [],
    },
  ];
  useBoardStore.getState().seed(tasks);
}

describe('boardStore', () => {
  beforeEach(() => {
    useBoardStore.getState().clear();
  });

  it('seeds tasks into their columns and marks seeded', () => {
    seedTwo();
    const state = useBoardStore.getState();
    expect(state.seeded).toBe(true);
    expect(state.columns.backlog).toEqual(['t1']);
    expect(state.columns.in_progress).toEqual(['t2']);
    expect(state.tasksById.t1.title).toBe('First');
  });

  it('does not re-seed when already seeded', () => {
    seedTwo();
    useBoardStore.getState().seed([
      {
        id: 't99',
        title: 'Should not appear',
        column: 'done',
        priority: 'low',
        assignee: 'X',
        createdAt: '',
        updatedAt: '',
        comments: [],
      },
    ]);
    expect(useBoardStore.getState().tasksById.t99).toBeUndefined();
  });

  it('addTask inserts at the top of Backlog by default', () => {
    seedTwo();
    const created = useBoardStore.getState().addTask({
      title: 'Fresh',
      priority: 'medium',
      assignee: 'C',
    });
    const backlog = useBoardStore.getState().columns.backlog;
    expect(backlog[0]).toBe(created.id);
    expect(backlog).toContain('t1');
  });

  it('moves a task within the same column', () => {
    seedTwo();
    useBoardStore.getState().addTask({
      title: 'Another backlog task',
      priority: 'low',
      assignee: 'X',
      column: 'backlog',
    });
    const [firstId, secondId] = useBoardStore.getState().columns.backlog;
    useBoardStore.getState().moveTask(firstId, 'backlog', 1);
    expect(useBoardStore.getState().columns.backlog).toEqual([secondId, firstId]);
  });

  it('moves a task across columns and updates task.column', () => {
    seedTwo();
    useBoardStore.getState().moveTask('t1', 'done', 0);
    const state = useBoardStore.getState();
    expect(state.columns.backlog).toEqual([]);
    expect(state.columns.done).toEqual(['t1']);
    expect(state.tasksById.t1.column).toBe('done');
  });

  it('deleteTask removes it from tasksById and its column', () => {
    seedTwo();
    useBoardStore.getState().deleteTask('t2');
    const state = useBoardStore.getState();
    expect(state.tasksById.t2).toBeUndefined();
    expect(state.columns.in_progress).toEqual([]);
  });

  it('undoLastMove reverts the last move', () => {
    seedTwo();
    useBoardStore.getState().moveTask('t1', 'review', 0);
    expect(useBoardStore.getState().columns.review).toEqual(['t1']);
    useBoardStore.getState().undoLastMove();
    const state = useBoardStore.getState();
    expect(state.columns.backlog).toEqual(['t1']);
    expect(state.columns.review).toEqual([]);
    expect(state.tasksById.t1.column).toBe('backlog');
  });

  it('addComment appends to the task', () => {
    seedTwo();
    useBoardStore.getState().addComment('t1', { author: 'Alice', body: 'Nice' });
    const comments = useBoardStore.getState().tasksById.t1.comments;
    expect(comments).toHaveLength(1);
    expect(comments[0].body).toBe('Nice');
    expect(comments[0].author).toBe('Alice');
  });
});
