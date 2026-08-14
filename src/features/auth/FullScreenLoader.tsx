import { Loader2 } from 'lucide-react';

export function FullScreenLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex h-full min-h-[100dvh] flex-col items-center justify-center gap-3 bg-bg text-fg-muted"
    >
      <Loader2 className="h-8 w-8 animate-spin text-brand" aria-hidden />
      <p className="text-sm">{label}</p>
    </div>
  );
}
