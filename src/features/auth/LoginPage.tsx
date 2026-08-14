import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';
import { useToast } from '@/lib/hooks/useToast';
import { loginRequest } from '@/lib/api/endpoints';
import { setAccessToken, setRefreshToken } from '@/lib/api/tokens';
import { useAuthStore } from './authStore';
import { evaluatePassword } from './passwordStrength';
import { cn } from '@/lib/utils/cn';

interface LocationState {
  from?: string;
}

export function LoginPage() {
  const [username, setUsername] = useState('emilys');
  const [password, setPassword] = useState('emilyspass');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const setUser = useAuthStore((s) => s.setUser);
  const { toast } = useToast();

  const strength = password ? evaluatePassword(password) : null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await loginRequest({ username, password });
      setAccessToken(result.accessToken);
      setRefreshToken(result.refreshToken, remember);
      setUser({
        id: result.id,
        username: result.username,
        email: result.email,
        firstName: result.firstName,
        lastName: result.lastName,
        gender: result.gender,
        image: result.image,
      });
      toast({
        title: `Welcome back, ${result.firstName}`,
        variant: 'success',
      });
      const from = (location.state as LocationState | null)?.from ?? '/board';
      navigate(from, { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-bg-subtle p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-bg p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand text-white font-bold">
            SD
          </div>
          <div>
            <h1 className="text-xl font-semibold text-fg">SprintDesk</h1>
            <p className="text-sm text-fg-muted">Sign in to your workspace</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          <Input
            label="Username"
            type="text"
            autoComplete="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            leftAdornment={<Mail className="h-4 w-4" />}
          />
          <div className="flex flex-col gap-1.5">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftAdornment={<Lock className="h-4 w-4" />}
              rightAdornment={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-fg-subtle hover:text-fg"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />
            {strength && (
              <div className="flex items-center gap-2" aria-hidden>
                <div className="flex flex-1 gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        'h-1 flex-1 rounded-full transition-colors',
                        i < strength.score
                          ? strength.tone === 'danger'
                            ? 'bg-danger'
                            : strength.tone === 'warning'
                              ? 'bg-warning'
                              : 'bg-success'
                          : 'bg-bg-muted',
                      )}
                    />
                  ))}
                </div>
                <span className="text-xs text-fg-muted w-16 text-right">{strength.label}</span>
              </div>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm text-fg-muted">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-border text-brand focus:ring-brand"
            />
            Remember me for 30 days
          </label>

          {error && (
            <div
              role="alert"
              className="rounded-md border border-danger bg-danger-subtle px-3 py-2 text-sm text-danger"
            >
              {error}
            </div>
          )}

          <Button type="submit" loading={loading} fullWidth>
            Sign in
          </Button>

          <p className="text-center text-xs text-fg-muted">
            Demo credentials pre-filled. Try <code className="font-mono">emilys / emilyspass</code>.
          </p>
        </form>
      </div>
    </div>
  );
}
