import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface MenuItem {
  label: string;
  onSelect: () => void;
  icon?: ReactNode;
  disabled?: boolean;
}

interface MenuProps {
  /** Accessible name for the trigger button. */
  label: string;
  trigger: ReactNode;
  items: MenuItem[];
  align?: 'left' | 'right';
  triggerClassName?: string;
}

/**
 * WAI-ARIA menu button: Enter/Space/ArrowDown opens and focuses the first item,
 * arrows move, Home/End jump, Escape or Tab closes and returns focus to the trigger.
 */
export function Menu({ label, trigger, items, align = 'right', triggerClassName }: MenuProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const enabled = items.map((it, i) => (it.disabled ? -1 : i)).filter((i) => i >= 0);

  const focusItem = (i: number) => itemRefs.current[i]?.focus();
  const close = (returnFocus = true) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    focusItem(enabled[0]);
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- focus first item only when opening
  }, [open]);

  const onMenuKeyDown = (e: KeyboardEvent) => {
    const current = enabled.indexOf(
      itemRefs.current.findIndex((el) => el === document.activeElement),
    );
    const go = (pos: number) => {
      e.preventDefault();
      focusItem(enabled[(pos + enabled.length) % enabled.length]);
    };
    if (e.key === 'ArrowDown') go(current + 1);
    else if (e.key === 'ArrowUp') go(current - 1);
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(enabled.length - 1);
    else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'Tab') close(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className={cn(
          'grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-ink',
          triggerClassName,
        )}
      >
        {trigger}
      </button>
      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label={label}
          tabIndex={-1}
          onKeyDown={onMenuKeyDown}
          className={cn(
            'absolute top-full z-50 mt-1 min-w-44 rounded-xl border border-border bg-surface p-1 shadow-lift',
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          {items.map((item, i) => (
            <button
              key={item.label}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              type="button"
              role="menuitem"
              tabIndex={-1}
              disabled={item.disabled}
              onClick={() => {
                item.onSelect();
                close();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-surface-2 focus:bg-surface-2 focus:outline-none disabled:opacity-40"
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
