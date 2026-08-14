import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftAdornment?: ReactNode;
  rightAdornment?: ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    error,
    hint,
    leftAdornment,
    rightAdornment,
    className,
    containerClassName,
    id,
    ...rest
  },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const describedById = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-fg"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftAdornment && (
          <span className="absolute left-3 text-fg-subtle" aria-hidden>
            {leftAdornment}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedById}
          className={cn(
            'h-10 w-full rounded-md border border-border bg-bg text-fg placeholder:text-fg-subtle',
            'px-3 text-sm transition-colors',
            'hover:border-border-strong focus:border-brand focus:outline-none',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            leftAdornment && 'pl-9',
            rightAdornment && 'pr-9',
            error && 'border-danger focus:border-danger',
            className,
          )}
          {...rest}
        />
        {rightAdornment && (
          <span className="absolute right-3 text-fg-subtle">{rightAdornment}</span>
        )}
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="text-xs text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-xs text-fg-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
});
