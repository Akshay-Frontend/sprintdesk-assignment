const REFRESH_KEY = 'sd_refresh';
const REMEMBER_KEY = 'sd_remember';

let accessToken: string | null = null;
let accessExpiresAt: number | null = null;

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export function subscribeToTokenChange(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getAccessToken(): string | null {
  if (accessToken && accessExpiresAt && Date.now() >= accessExpiresAt) {
    return null;
  }
  return accessToken;
}

export function setAccessToken(token: string | null, ttlMs = 10 * 60 * 1000) {
  accessToken = token;
  accessExpiresAt = token ? Date.now() + ttlMs : null;
  notify();
}

export function forceExpireAccessToken() {
  accessExpiresAt = Date.now() - 1;
  notify();
}

export function getRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_KEY);
  } catch {
    return null;
  }
}

export function setRefreshToken(token: string | null, remember = false) {
  try {
    if (token) {
      localStorage.setItem(REFRESH_KEY, token);
      if (remember) {
        const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000;
        localStorage.setItem(REMEMBER_KEY, String(expiry));
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }
    } else {
      localStorage.removeItem(REFRESH_KEY);
      localStorage.removeItem(REMEMBER_KEY);
    }
  } catch {
    // storage unavailable — silently degrade
  }
}

export function isRememberExpired(): boolean {
  try {
    const raw = localStorage.getItem(REMEMBER_KEY);
    if (!raw) return false;
    const expiry = Number(raw);
    return Number.isFinite(expiry) && Date.now() > expiry;
  } catch {
    return false;
  }
}

export function clearTokens() {
  accessToken = null;
  accessExpiresAt = null;
  setRefreshToken(null);
  notify();
}
