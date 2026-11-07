import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface PageHeaderProps {
  /** @deprecated Visual eyebrows were removed for a calmer look; kept so call sites stay valid. */
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

/** Consistent page heading — renders the page's single <h1>. */
export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 pb-8 pt-8 sm:flex-row sm:items-end sm:justify-between sm:pt-12',
        className,
      )}
    >
      <div className="max-w-2xl">
        <h1 className="text-[2rem] font-semibold leading-[1.1] sm:text-[2.75rem]">{title}</h1>
        {description && (
          <p className="mt-3 text-[17px] leading-relaxed text-muted">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
