import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { clearTokens } from '@/lib/api/tokens';
import { useAuthStore } from './authStore';

export function useLogout() {
  const navigate = useNavigate();
  const reset = useAuthStore((s) => s.reset);
  const queryClient = useQueryClient();

  return function logout() {
    clearTokens();
    reset();
    queryClient.clear();
    navigate('/login', { replace: true });
  };
}
