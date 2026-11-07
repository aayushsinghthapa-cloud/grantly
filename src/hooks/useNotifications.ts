import { useEffect, useMemo } from 'react';
import { SCHOLARSHIPS_BY_ID } from '@/data/scholarships';
import { useAppStore } from '@/store/app';
import { toast } from '@/store/toast';
import { dueReminders, getNotifications, type AppNotification } from '@/lib/notifications';

declare global {
  interface Window {
    /** Set by scripts/prerender.mjs so one-off alerts are never baked into static HTML. */
    __PRERENDER__?: boolean;
  }
}

export function useNotifications(): AppNotification[] {
  const tracker = useAppStore((s) => s.tracker);
  const vault = useAppStore((s) => s.vault);
  const reminders = useAppStore((s) => s.reminders);
  return useMemo(
    () => getNotifications({ tracker, vault, reminders, catalogue: SCHOLARSHIPS_BY_ID }),
    [tracker, vault, reminders],
  );
}

const ALERT_KEY = 'grantly-reminded-on';

/** Once a day, when the app opens, surface due reminders as a toast and (if allowed) a browser notification. */
export function useDailyReminderAlert(): void {
  const notifications = useNotifications();
  useEffect(() => {
    if (window.__PRERENDER__) return;
    const due = dueReminders(notifications);
    if (due.length === 0) return;
    const today = new Date().toDateString();
    try {
      if (localStorage.getItem(ALERT_KEY) === today) return;
      localStorage.setItem(ALERT_KEY, today);
    } catch {
      // storage unavailable: still show the alert this session
    }
    toast({
      title: due.length === 1 ? due[0].title : `${due.length} reminders are due`,
      description:
        due.length === 1
          ? due[0].detail
          : due.map((d) => d.title.replace('Reminder: ', '')).join(', '),
    });
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('GRANTLY reminders', {
        body: due.map((d) => `${d.title}: ${d.detail}`).join('\n'),
      });
    }
    // Run once per app load, with the state that was there when it opened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
