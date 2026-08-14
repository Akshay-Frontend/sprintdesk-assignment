import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppNotification } from '@/types/notification';

interface NotificationsState {
  items: AppNotification[];
  knownIds: number[];
  ingest: (
    incoming: { id: number; title: string; body: string }[],
  ) => AppNotification[];
  markRead: (id: number) => void;
  markAllRead: () => void;
  unreadCount: () => number;
}

const MAX_ITEMS = 20;

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      items: [],
      knownIds: [],

      ingest: (incoming) => {
        const known = new Set(get().knownIds);
        const now = new Date().toISOString();
        const fresh: AppNotification[] = incoming
          .filter((p) => !known.has(p.id))
          .map((p) => ({
            id: p.id,
            title: p.title,
            body: p.body,
            createdAt: now,
            read: false,
          }));

        if (fresh.length === 0) return [];

        set((state) => ({
          items: [...fresh, ...state.items].slice(0, MAX_ITEMS),
          knownIds: Array.from(new Set([...state.knownIds, ...fresh.map((f) => f.id)])).slice(-100),
        }));

        return fresh;
      },

      markRead: (id) =>
        set((state) => ({
          items: state.items.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),

      markAllRead: () =>
        set((state) => ({
          items: state.items.map((n) => ({ ...n, read: true })),
        })),

      unreadCount: () => get().items.filter((n) => !n.read).length,
    }),
    {
      name: 'sd_notifications',
    },
  ),
);
