import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { Layout } from './Layout';
import { ProtectedRoute, PublicOnlyRoute } from '@/features/auth/ProtectedRoute';
import { LoginPage } from '@/features/auth/LoginPage';
import { FullScreenLoader } from '@/features/auth/FullScreenLoader';

const DashboardPage = lazy(() =>
  import('@/features/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const BoardPage = lazy(() =>
  import('@/features/board/BoardPage').then((m) => ({ default: m.BoardPage })),
);
const AnalyticsPage = lazy(() =>
  import('@/features/analytics/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })),
);

function LazyBoundary({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<FullScreenLoader label="Loading…" />}>{children}</Suspense>;
}

const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <PublicOnlyRoute>
        <LoginPage />
      </PublicOnlyRoute>
    ),
  },
  {
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/board" replace /> },
      {
        path: 'dashboard',
        element: (
          <LazyBoundary>
            <DashboardPage />
          </LazyBoundary>
        ),
      },
      {
        path: 'board',
        element: (
          <LazyBoundary>
            <BoardPage />
          </LazyBoundary>
        ),
      },
      {
        path: 'analytics',
        element: (
          <LazyBoundary>
            <AnalyticsPage />
          </LazyBoundary>
        ),
      },
    ],
  },
  { path: '*', element: <Navigate to="/board" replace /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
