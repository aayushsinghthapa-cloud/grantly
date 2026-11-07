import { differenceInCalendarDays, format, parseISO, startOfDay } from 'date-fns';

export type Urgency = 'closed' | 'urgent' | 'soon' | 'normal';

export const URGENT_DAYS = 7;
export const SOON_DAYS = 21;

/** Whole calendar days from `now` until the deadline. 0 = due today, negative = closed. */
export function daysLeft(deadline: string, now: Date = new Date()): number {
  return differenceInCalendarDays(parseISO(deadline), startOfDay(now));
}

export function urgencyFor(days: number): Urgency {
  if (days < 0) return 'closed';
  if (days <= URGENT_DAYS) return 'urgent';
  if (days <= SOON_DAYS) return 'soon';
  return 'normal';
}

export function getUrgency(deadline: string, now: Date = new Date()): Urgency {
  return urgencyFor(daysLeft(deadline, now));
}

export function isClosed(deadline: string, now: Date = new Date()): boolean {
  return daysLeft(deadline, now) < 0;
}

/** "Closed", "Due today", "1 day left", "12 days left" */
export function daysLeftLabel(days: number): string {
  if (days < 0) return 'Closed';
  if (days === 0) return 'Due today';
  if (days === 1) return '1 day left';
  return `${days} days left`;
}

/** "14 Dec 2026" */
export function formatDeadline(deadline: string): string {
  return format(parseISO(deadline), 'd MMM yyyy');
}

/** "14 Dec" */
export function formatDeadlineShort(deadline: string): string {
  return format(parseISO(deadline), 'd MMM');
}
