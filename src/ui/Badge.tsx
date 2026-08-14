import type { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const badgeStyles = cva(
  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
  {
    variants: {
      tone: {
        neutral: 'bg-bg-muted text-fg-muted',
        brand: 'bg-brand-subtle text-brand',
        success: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
        warning: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
        danger: 'bg-danger-subtle text-danger',
      },
    },
    defaultVariants: {
      tone: 'neutral',
    },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeStyles> {}

export function Badge({ className, tone, ...rest }: BadgeProps) {
  return <span className={cn(badgeStyles({ tone }), className)} {...rest} />;
}
