import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlarmClock, Bell, BellRing, CalendarClock, FileWarning } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { toast } from '@/store/toast';
import type { NotificationKind } from '@/lib/notifications';
import { cn } from '@/lib/cn';

const ICONS: Record<NotificationKind, typeof Bell> = {
  reminder: AlarmClock,
  deadline: CalendarClock,
  document: FileWarning,
};

/** Notification centre: due reminders, deadlines this week and expired documents, from the student's own data. */
export function NotificationBell() {
  const items = useNotifications();
  const [open, setOpen] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(() =>
    typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'unsupported',
  );
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!open) return;
    headingRef.current?.focus();
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const enableAlerts = async () => {
    const result = await Notification.requestPermission();
    setPermission(result);
    toast(
      result === 'granted'
        ? {
            title: 'Desktop alerts on',
            description: 'Due reminders will also appear as browser notifications.',
            tone: 'success',
          }
        : {
            title: 'Desktop alerts stay off',
            description: 'You’ll still see reminders here and when the app opens.',
          },
    );
  };

  const count = items.length;
  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={count ? `Notifications, ${count} new` : 'Notifications, none new'}
        className="relative grid h-9 w-9 place-items-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-ink"
      >
        {count ? (
          <BellRing className="h-[18px] w-[18px]" aria-hidden />
        ) : (
          <Bell className="h-[18px] w-[18px]" aria-hidden />
        )}
        {count > 0 && (
          <span
            className="tabular absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white dark:text-bg"
            aria-hidden
          >
            {count}
          </span>
        )}
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-labelledby={`${panelId}-title`}
          className="absolute right-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl bg-surface shadow-lift ring-1 ring-border/70"
        >
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <h2
              ref={headingRef}
              id={`${panelId}-title`}
              tabIndex={-1}
              className="text-[15px] font-semibold outline-none"
            >
              Notifications
            </h2>
            <span className="tabular text-xs text-muted">
              {count ? `${count} to look at` : 'All caught up'}
            </span>
          </div>
          {count === 0 ? (
            <p className="px-4 py-6 text-sm text-muted">
              Nothing needs your attention. Set a reminder on any scholarship and it will show up
              here.
            </p>
          ) : (
            <ul className="max-h-80 divide-y divide-border overflow-y-auto">
              {items.map((n) => {
                const Icon = ICONS[n.kind];
                return (
                  <li key={n.id}>
                    <Link
                      to={n.href}
                      onClick={() => setOpen(false)}
                      className="flex gap-3 px-4 py-3 transition-colors hover:bg-surface-2"
                    >
                      <Icon
                        className={cn(
                          'mt-0.5 h-4 w-4 shrink-0',
                          n.kind === 'document' ? 'text-danger' : 'text-primary',
                        )}
                        aria-hidden
                      />
                      <span className="min-w-0 text-sm">
                        <span className="block font-medium">{n.title}</span>
                        <span className="block text-muted">{n.detail}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          {permission === 'default' && (
            <div className="border-t border-border px-4 py-3">
              <button
                type="button"
                onClick={enableAlerts}
                className="text-sm font-semibold text-primary hover:underline"
              >
                Turn on desktop alerts
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
