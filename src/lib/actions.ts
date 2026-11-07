import type { DocType, Scholarship, TrackerEntry, Vault } from '@/types';
import { daysLeft } from './deadline';
import { getReadiness } from './readiness';

export interface ActionItem {
  scholarship: Scholarship;
  days: number;
  missingDocs: DocType[];
  stepsLeft: number;
}

/**
 * Tracked scholarships not yet submitted, due within `withinDays`, that still have
 * missing documents or unfinished roadmap steps. Soonest first.
 */
export function getActionsNeeded(
  tracker: Record<string, TrackerEntry>,
  vault: Vault,
  checklist: Record<string, number[]>,
  catalogue: ReadonlyMap<string, Scholarship>,
  { now = new Date(), withinDays = 7 }: { now?: Date; withinDays?: number } = {},
): ActionItem[] {
  const out: ActionItem[] = [];
  for (const [id, entry] of Object.entries(tracker)) {
    if (entry.status !== 'saved' && entry.status !== 'preparing') continue;
    const s = catalogue.get(id);
    if (!s) continue;
    const days = daysLeft(s.deadline, now);
    if (days < 0 || days > withinDays) continue;
    const missingDocs = getReadiness(s, vault, now).missing;
    const stepsLeft = s.steps.length - (checklist[id]?.length ?? 0);
    if (missingDocs.length === 0 && stepsLeft === 0) continue;
    out.push({ scholarship: s, days, missingDocs, stepsLeft });
  }
  return out.sort((a, b) => a.days - b.days);
}
