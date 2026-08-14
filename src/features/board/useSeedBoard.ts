import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchSeedTasks } from '@/lib/api/endpoints';
import { useBoardStore } from './boardStore';
import { todosToTasks } from './seed';

export function useSeedBoard() {
  const seeded = useBoardStore((s) => s.seeded);
  const seed = useBoardStore((s) => s.seed);

  const query = useQuery({
    queryKey: ['board-seed'],
    queryFn: fetchSeedTasks,
    enabled: !seeded,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!seeded && query.data) {
      seed(todosToTasks(query.data));
    }
  }, [seeded, query.data, seed]);

  return {
    loading: !seeded && (query.isPending || query.isFetching),
    error: query.error,
  };
}
