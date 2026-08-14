import { useEffect, useRef } from 'react';
import { Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/ui/Button';
import { useNotificationsStore } from './notificationsStore';

export interface NotificationsPanelProps {
  onClose: () => void;
}

export function NotificationsPanel({ onClose }: NotificationsPanelProps) {
  const items = useNotificationsStore((s) => s.items);
  const markRead = useNotificationsStore((s) => s.markRead);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!panelRef.current) return;
      if (!panelRef.current.contains(e.target as Node)) onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Notifications"
      className="absolute right-0 top-full z-40 mt-2 flex max-h-[min(500px,80vh)] w-[min(360px,calc(100vw-1rem))] flex-col overflow-hidden rounded-lg border border-border bg-bg shadow-xl animate-slide-in-up"
    >
      <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
        <h3 className="text-sm font-semibold text-fg">Notifications</h3>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<CheckCheck className="h-3.5 w-3.5" />}
          onClick={markAllRead}
          disabled={items.every((n) => n.read)}
        >
          Mark all read
        </Button>
      </div>
      <div className="flex-1 divide-y divide-border overflow-y-auto">
        {items.length === 0 && (
          <p className="p-6 text-center text-sm text-fg-muted">No notifications yet.</p>
        )}
        {items.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => markRead(n.id)}
            className={cn(
              'flex w-full items-start gap-2 px-3 py-3 text-left hover:bg-bg-subtle',
              !n.read && 'bg-brand-subtle/40',
            )}
          >
            <span
              className={cn(
                'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                n.read ? 'bg-transparent' : 'bg-brand',
              )}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  'line-clamp-1 text-sm text-fg',
                  !n.read && 'font-semibold',
                )}
              >
                {n.title}
              </p>
              <p className="line-clamp-2 text-xs text-fg-muted">{n.body}</p>
              <time
                className="mt-1 block text-[10px] uppercase tracking-wide text-fg-subtle"
                dateTime={n.createdAt}
              >
                {new Date(n.createdAt).toLocaleTimeString()}
              </time>
            </div>
            {n.read && <Check className="h-3.5 w-3.5 text-fg-subtle" aria-hidden />}
          </button>
        ))}
      </div>
    </div>
  );
}
