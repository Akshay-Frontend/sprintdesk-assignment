import { useEffect } from 'react';
import { useAuthStore } from './authStore';
import {
  getRefreshToken,
  isRememberExpired,
  clearTokens,
  setAccessToken,
  setRefreshToken,
} from '@/lib/api/tokens';
import { DUMMY_JSON_BASE } from '@/lib/api/client';
import { meRequest } from '@/lib/api/endpoints';

export function useAuthBoot() {
  const setUser = useAuthStore((s) => s.setUser);
  const setStatus = useAuthStore((s) => s.setStatus);

  useEffect(() => {
    const refreshToken = getRefreshToken();
    if (!refreshToken || isRememberExpired()) {
      clearTokens();
      setStatus('unauthenticated');
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`${DUMMY_JSON_BASE}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken, expiresInMins: 30 }),
        });
        if (!res.ok) throw new Error('refresh failed');
        const data = (await res.json()) as { accessToken: string; refreshToken?: string };
        setAccessToken(data.accessToken);
        if (data.refreshToken) setRefreshToken(data.refreshToken);
        const user = await meRequest();
        if (!cancelled) setUser(user);
      } catch {
        if (!cancelled) {
          clearTokens();
          setStatus('unauthenticated');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [setStatus, setUser]);
}
