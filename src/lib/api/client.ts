import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from './tokens';

export const DUMMY_JSON_BASE = 'https://dummyjson.com';
export const JSON_PLACEHOLDER_BASE = 'https://jsonplaceholder.typicode.com';

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  auth?: boolean;
  _retry?: boolean;
}

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

type RefreshResult = { accessToken: string; refreshToken?: string };
let refreshPromise: Promise<RefreshResult> | null = null;
let onAuthLostCallback: (() => void) | null = null;

export function setOnAuthLost(cb: (() => void) | null) {
  onAuthLostCallback = cb;
}

async function performRefresh(): Promise<RefreshResult> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new ApiError('No refresh token', 401, null);

  const res = await fetch(`${DUMMY_JSON_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken, expiresInMins: 30 }),
  });

  if (!res.ok) {
    let data: unknown = null;
    try {
      data = await res.json();
    } catch {
      // ignore
    }
    throw new ApiError('Refresh failed', res.status, data);
  }

  const data = (await res.json()) as RefreshResult;
  setAccessToken(data.accessToken);
  if (data.refreshToken) setRefreshToken(data.refreshToken);
  return data;
}

async function refreshOnce(): Promise<RefreshResult> {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function apiFetch<T = unknown>(
  url: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, auth = true, _retry = false, headers, ...rest } = options;

  const finalHeaders = new Headers(headers);
  if (body !== undefined && !finalHeaders.has('Content-Type')) {
    finalHeaders.set('Content-Type', 'application/json');
  }

  if (auth) {
    const token = getAccessToken();
    if (token) {
      finalHeaders.set('Authorization', `Bearer ${token}`);
    }
  }

  const res = await fetch(url, {
    ...rest,
    headers: finalHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (res.status === 401 && auth && !_retry) {
    try {
      await refreshOnce();
    } catch (err) {
      clearTokens();
      onAuthLostCallback?.();
      throw err;
    }
    return apiFetch<T>(url, { ...options, _retry: true });
  }

  if (!res.ok) {
    let data: unknown = null;
    try {
      data = await res.json();
    } catch {
      // ignore
    }
    const message =
      (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string'
        ? data.message
        : res.statusText) || 'Request failed';
    throw new ApiError(message, res.status, data);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export function resetClientForTests() {
  refreshPromise = null;
  onAuthLostCallback = null;
}
