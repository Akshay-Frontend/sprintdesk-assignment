import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiFetch, resetClientForTests, setOnAuthLost } from './client';
import {
  clearTokens,
  getAccessToken,
  setAccessToken,
  setRefreshToken,
} from './tokens';

const ORIGINAL_FETCH = globalThis.fetch;

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}

describe('apiFetch interceptor', () => {
  beforeEach(() => {
    resetClientForTests();
    clearTokens();
    setAccessToken('access-1');
    setRefreshToken('refresh-1');
  });

  afterEach(() => {
    globalThis.fetch = ORIGINAL_FETCH;
    resetClientForTests();
    clearTokens();
  });

  it('attaches Bearer token by default', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
    globalThis.fetch = fetchMock;

    await apiFetch('https://example.test/data');

    const call = fetchMock.mock.calls[0];
    const headers = call[1].headers as Headers;
    expect(headers.get('Authorization')).toBe('Bearer access-1');
  });

  it('skips auth header when auth:false', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
    globalThis.fetch = fetchMock;

    await apiFetch('https://example.test/data', { auth: false });

    const call = fetchMock.mock.calls[0];
    const headers = call[1].headers as Headers;
    expect(headers.get('Authorization')).toBeNull();
  });

  it('refreshes token on 401 and retries the original request', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ message: 'expired' }, { status: 401 }))
      .mockResolvedValueOnce(
        jsonResponse({ accessToken: 'access-2', refreshToken: 'refresh-2' }),
      )
      .mockResolvedValueOnce(jsonResponse({ ok: true, data: 42 }));
    globalThis.fetch = fetchMock;

    const result = await apiFetch<{ data: number }>('https://example.test/data');

    expect(result.data).toBe(42);
    expect(fetchMock).toHaveBeenCalledTimes(3);

    const refreshCall = fetchMock.mock.calls[1];
    expect(refreshCall[0]).toContain('/auth/refresh');
    expect(getAccessToken()).toBe('access-2');

    const retryCall = fetchMock.mock.calls[2];
    const retryHeaders = retryCall[1].headers as Headers;
    expect(retryHeaders.get('Authorization')).toBe('Bearer access-2');
  });

  it('does not loop: if retry also returns 401, throws', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ message: 'expired' }, { status: 401 }))
      .mockResolvedValueOnce(jsonResponse({ accessToken: 'access-2' }))
      .mockResolvedValueOnce(jsonResponse({ message: 'still bad' }, { status: 401 }));
    globalThis.fetch = fetchMock;

    await expect(apiFetch('https://example.test/data')).rejects.toMatchObject({
      status: 401,
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('deduplicates concurrent 401s into a single refresh call', async () => {
    const fetchImpl = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();
      if (url.includes('/auth/refresh')) {
        return Promise.resolve(
          jsonResponse({ accessToken: 'access-2', refreshToken: 'refresh-2' }),
        );
      }
      const header = (init?.headers as Headers | undefined)?.get?.('Authorization') ?? '';
      if (header === 'Bearer access-1') {
        return Promise.resolve(jsonResponse({ message: 'expired' }, { status: 401 }));
      }
      return Promise.resolve(jsonResponse({ ok: true }));
    });
    globalThis.fetch = fetchImpl as unknown as typeof fetch;

    await Promise.all([
      apiFetch('https://example.test/one'),
      apiFetch('https://example.test/two'),
      apiFetch('https://example.test/three'),
    ]);

    const refreshCalls = fetchImpl.mock.calls.filter(([input]) => {
      const url = typeof input === 'string' ? input : (input as URL).toString();
      return url.includes('/auth/refresh');
    });
    expect(refreshCalls).toHaveLength(1);
  });

  it('clears tokens and invokes onAuthLost when refresh fails', async () => {
    const lost = vi.fn();
    setOnAuthLost(lost);

    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ message: 'expired' }, { status: 401 }))
      .mockResolvedValueOnce(jsonResponse({ message: 'bad refresh' }, { status: 401 }));

    await expect(apiFetch('https://example.test/data')).rejects.toBeDefined();
    expect(lost).toHaveBeenCalledOnce();
    expect(getAccessToken()).toBeNull();
  });
});
