import { DUMMY_JSON_BASE, JSON_PLACEHOLDER_BASE, apiFetch } from './client';
import type { LoginResponse, AuthUser } from '@/types/user';

interface RawTodo {
  id: number;
  userId: number;
  title: string;
  completed: boolean;
}

interface RawPost {
  id: number;
  userId: number;
  title: string;
  body: string;
}

export interface LoginPayload {
  username: string;
  password: string;
  expiresInMins?: number;
}

export function loginRequest(payload: LoginPayload) {
  return apiFetch<LoginResponse>(`${DUMMY_JSON_BASE}/auth/login`, {
    method: 'POST',
    body: { expiresInMins: 30, ...payload },
    auth: false,
  });
}

export function meRequest() {
  return apiFetch<AuthUser>(`${DUMMY_JSON_BASE}/auth/me`);
}

export function fetchSeedTasks() {
  return apiFetch<RawTodo[]>(`${JSON_PLACEHOLDER_BASE}/todos?_limit=30`, {
    auth: false,
  });
}

export function fetchLatestPosts() {
  return apiFetch<RawPost[]>(`${JSON_PLACEHOLDER_BASE}/posts?_limit=5`, {
    auth: false,
  });
}
