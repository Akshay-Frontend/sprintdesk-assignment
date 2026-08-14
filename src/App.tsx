import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './app/queryClient';
import { AppRouter } from './app/router';
import { Toaster } from './ui/Toaster';
import { useAuthBoot } from './features/auth/useAuthBoot';
import { setOnAuthLost } from './lib/api/client';
import { useAuthStore } from './features/auth/authStore';
import { applyThemeClass, useThemeStore } from './features/theme/themeStore';

function AuthLostBridge() {
  useEffect(() => {
    setOnAuthLost(() => {
      useAuthStore.getState().reset();
    });
    return () => setOnAuthLost(null);
  }, []);
  return null;
}

function ThemeBridge() {
  const theme = useThemeStore((s) => s.theme);
  useEffect(() => {
    applyThemeClass(theme);
  }, [theme]);
  return null;
}

function AuthBootstrap() {
  useAuthBoot();
  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeBridge />
      <AuthLostBridge />
      <AuthBootstrap />
      <AppRouter />
      <Toaster />
    </QueryClientProvider>
  );
}
