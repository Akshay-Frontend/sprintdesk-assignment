import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotificationsStore } from './notificationsStore';
import { useNotificationPoller } from './useNotificationPoller';
import { NotificationsPanel } from './NotificationsPanel';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const unread = useNotificationsStore((s) => s.items.filter((n) => !n.read).length);

  useNotificationPoller({ panelOpen: open });

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ''}`}
        aria-expanded={open}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-bg text-fg-muted hover:bg-bg-muted hover:text-fg"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span
            className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white"
            aria-hidden
          >
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>
      {open && <NotificationsPanel onClose={() => setOpen(false)} />}
    </div>
  );
}
