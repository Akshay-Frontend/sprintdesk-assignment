import { CheckCircle2, Info, TriangleAlert, X, XCircle } from 'lucide-react';
import { useToast, type ToastVariant } from '@/lib/hooks/useToast';
import { cn } from '@/lib/utils/cn';

const iconMap: Record<ToastVariant, React.ComponentType<{ className?: string }>> = {
  default: Info,
  success: CheckCircle2,
  error: XCircle,
  warning: TriangleAlert,
  info: Info,
};

const toneMap: Record<ToastVariant, string> = {
  default: 'border-border',
  success: 'border-l-4 border-l-success',
  error: 'border-l-4 border-l-danger',
  warning: 'border-l-4 border-l-warning',
  info: 'border-l-4 border-l-brand',
};

const iconToneMap: Record<ToastVariant, string> = {
  default: 'text-fg-muted',
  success: 'text-success',
  error: 'text-danger',
  warning: 'text-warning',
  info: 'text-brand',
};

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2"
    >
      {toasts.map((t) => {
        const Icon = iconMap[t.variant];
        return (
          <div
            key={t.id}
            role="status"
            className={cn(
              'pointer-events-auto flex items-start gap-3 rounded-md border bg-bg p-3 shadow-lg animate-slide-in-right',
              toneMap[t.variant],
            )}
          >
            <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', iconToneMap[t.variant])} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-fg">{t.title}</p>
              {t.description && (
                <p className="mt-0.5 text-xs text-fg-muted">{t.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="rounded p-1 text-fg-muted hover:bg-bg-muted hover:text-fg"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
