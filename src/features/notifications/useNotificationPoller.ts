import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchLatestPosts } from '@/lib/api/endpoints';
import { pushToast } from '@/lib/hooks/useToast';
import { useDocumentVisibility } from '@/lib/hooks/useDocumentVisibility';
import { useNotificationsStore } from './notificationsStore';

const POLL_MS = 30_000;

interface UsePollerOptions {
  panelOpen: boolean;
}

export function useNotificationPoller({ panelOpen }: UsePollerOptions) {
  const visibility = useDocumentVisibility();
  const ingest = useNotificationsStore((s) => s.ingest);

  const query = useQuery({
    queryKey: ['notifications-poll'],
    queryFn: fetchLatestPosts,
    refetchInterval: visibility === 'visible' ? POLL_MS : false,
    refetchIntervalInBackground: false,
    staleTime: 0,
  });

  useEffect(() => {
    if (!query.data) return;
    const fresh = ingest(
      query.data.map((p) => ({
        id: p.id,
        title: `New activity: ${p.title.slice(0, 60)}`,
        body: p.body.slice(0, 120),
      })),
    );

    if (fresh.length > 0 && !panelOpen) {
      pushToast({
        title:
          fresh.length === 1
            ? 'New notification'
            : `${fresh.length} new notifications`,
        description: fresh[0].title,
        variant: 'info',
      });
    }
  }, [query.data, panelOpen, ingest]);
}
