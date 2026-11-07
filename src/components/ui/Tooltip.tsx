import { useId, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Keyboard- and touch-accessible tooltip used for glossary terms.
 * The trigger is a button so it can be focused and tapped; content is linked via aria-describedby.
 */
export function Tooltip({ content, children, className }: TooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  return (
    <span className={cn('relative inline-block', className)}>
      <button
        type="button"
        aria-describedby={id}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
        className="cursor-help underline decoration-muted decoration-dotted underline-offset-4"
      >
        {children}
      </button>
      <span
        id={id}
        role="tooltip"
        className={cn(
          'absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-xl border border-border bg-ink px-3 py-2 text-left text-xs font-normal leading-relaxed text-bg shadow-lift transition-opacity',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        {content}
      </span>
    </span>
  );
}
