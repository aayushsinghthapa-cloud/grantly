import type { Scholarship, TrackerEntry, Vault } from '@/types';
import { daysLeft, daysLeftLabel } from './deadline';

export type NotificationKind = 'reminder' | 'deadline' | 'document';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  detail: string;
  /** In-app path to act on it. */
  href: string;
  /** Lower = more urgent; used for ordering. */
  urgency: number;
}

interface Input {
  tracker: Record<string, TrackerEntry>;
  vault: Vault;
  reminders: Record<string, number>;
  catalogue: ReadonlyMap<string, Scholarship>;
  now?: Date;
}

const OPEN_STATUSES = new Set(['saved', 'preparing']);

/**
 * Everything the student should know about right now, derived from their own data:
 * reminders they set that are due, tracked applications closing within a week, and
 * documents in the vault that have expired. Pure, so it is shared by the bell, the
 * on-load alert and the tests.
 */
export function getNotifications({
  tracker,
  vault,
  reminders,
  catalogue,
  now = new Date(),
}: Input): AppNotification[] {
  const out: AppNotification[] = [];
  const reminded = new Set<string>();

  for (const [id, before] of Object.entries(reminders)) {
    const s = catalogue.get(id);
    const status = tracker[id]?.status;
    if (!s || status === 'submitted' || status === 'won' || status === 'rejected') continue;
    const days = daysLeft(s.deadline, now);
    if (days < 0 || days > before) continue;
    reminded.add(id);
    out.push({
      id: `reminder:${id}`,
      kind: 'reminder',
      title: `Reminder: ${s.name}`,
      detail: `${daysLeftLabel(days)} (you asked to be reminded ${before} day${before === 1 ? '' : 's'} before).`,
      href: `/scholarship/${id}`,
      urgency: days,
    });
  }

  for (const [id, entry] of Object.entries(tracker)) {
    if (reminded.has(id) || !OPEN_STATUSES.has(entry.status)) continue;
    const s = catalogue.get(id);
    if (!s) continue;
    const days = daysLeft(s.deadline, now);
    if (days < 0 || days > 7) continue;
    out.push({
      id: `deadline:${id}`,
      kind: 'deadline',
      title: `${s.name} closes soon`,
      detail: `${daysLeftLabel(days)} and it is still ${entry.status === 'saved' ? 'only saved' : 'being prepared'}.`,
      href: `/scholarship/${id}`,
      urgency: days + 0.5,
    });
  }

  for (const [doc, entry] of Object.entries(vault)) {
    if (!entry?.has || !entry.expiry) continue;
    const days = daysLeft(entry.expiry, now);
    if (days >= 0) continue;
    out.push({
      id: `document:${doc}`,
      kind: 'document',
      title: `${doc} has expired`,
      detail: 'Renew it before you submit anything that needs it.',
      href: `/vault#doc-${doc.toLowerCase().replace(/\s+/g, '-')}`,
      urgency: 3,
    });
  }

  return out.sort((a, b) => a.urgency - b.urgency);
}

/** Reminders that are due today: used for the once-a-day alert when the app opens. */
export function dueReminders(list: AppNotification[]): AppNotification[] {
  return list.filter((n) => n.kind === 'reminder');
}
