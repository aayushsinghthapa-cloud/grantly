import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  /** 'center' = modal dialog; 'sheet' = bottom sheet on mobile, right panel on desktop. */
  variant?: 'center' | 'sheet';
  className?: string;
}

/**
 * Built on the native <dialog> element: free focus trapping, Escape-to-close,
 * top-layer rendering and inert background — no portal or focus-trap library needed.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  variant = 'center',
  className,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions -- backdrop click; Escape is handled natively by <dialog>
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={cn(
        'm-0 max-h-none max-w-none bg-transparent p-0 text-ink backdrop:bg-transparent open:flex',
        variant === 'center'
          ? 'inset-0 h-full w-full items-center justify-center p-4'
          : 'inset-0 h-full w-full items-end justify-end md:items-stretch',
      )}
    >
      <div
        className={cn(
          'flex w-full flex-col overflow-hidden border border-border bg-surface shadow-lift',
          variant === 'center'
            ? 'max-h-[85vh] max-w-lg rounded-2xl'
            : 'max-h-[85vh] rounded-t-3xl md:h-full md:max-h-none md:max-w-md md:rounded-none md:rounded-l-3xl',
          className,
        )}
      >
        {variant === 'sheet' && (
          <div className="mx-auto mt-3 h-1.5 w-10 rounded-full bg-border md:hidden" aria-hidden />
        )}
        <header className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <h2 id={titleId} className="text-xl font-semibold">
              {title}
            </h2>
            {description && (
              <p id={descId} className="mt-1 text-sm text-muted">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 -mt-1 rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-ink"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && (
          <footer className="flex justify-end gap-2 border-t border-border p-4">{footer}</footer>
        )}
      </div>
    </dialog>
  );
}

/** Convenience alias for the sheet variant. */
export function Sheet(props: Omit<DialogProps, 'variant'>) {
  return <Dialog {...props} variant="sheet" />;
}
