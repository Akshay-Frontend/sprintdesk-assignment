import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './authStore';
import { FullScreenLoader } from './FullScreenLoader';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const status = useAuthStore((s) => s.status);
  const location = useLocation();

  if (status === 'initializing') return <FullScreenLoader label="Restoring your session…" />;
  if (status === 'unauthenticated')
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}

export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const status = useAuthStore((s) => s.status);

  if (status === 'initializing') return <FullScreenLoader label="Restoring your session…" />;
  if (status === 'authenticated') return <Navigate to="/board" replace />;
  return <>{children}</>;
}
