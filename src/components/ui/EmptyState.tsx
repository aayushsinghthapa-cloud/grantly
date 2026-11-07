import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-border px-6 py-12 text-center',
        className,
      )}
    >
      {icon && (
        <div
          className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-primary"
          aria-hidden
        >
          {icon}
        </div>
      )}
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      {description && <p className="mt-2 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
