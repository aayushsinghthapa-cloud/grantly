import type { Category, EducationLevel, ProviderType } from '@/types';
import type { ScholarshipWithMatch } from './match';
import { daysLeft } from './deadline';

export type SortKey = 'match' | 'deadline' | 'amount';

export interface DiscoverFilters {
  categories: Category[];
  levels: EducationLevel[];
  providerTypes: ProviderType[];
  /** Minimum award in INR; 0 = any. */
  minAmount: number;
  /** Only show deadlines within N days; null = any time. */
  deadlineWithin: number | null;
  eligibleOnly: boolean;
  hideClosed: boolean;
}

export const DEFAULT_FILTERS: DiscoverFilters = {
  categories: [],
  levels: [],
  providerTypes: [],
  minAmount: 0,
  deadlineWithin: null,
  eligibleOnly: false,
  hideClosed: true,
};

/** Number of filters that differ from the defaults — shown on the mobile "Filters" button. */
export function countActiveFilters(f: DiscoverFilters): number {
  return (
    f.categories.length +
    f.levels.length +
    f.providerTypes.length +
    (f.minAmount > 0 ? 1 : 0) +
    (f.deadlineWithin !== null ? 1 : 0) +
    (f.eligibleOnly ? 1 : 0) +
    (f.hideClosed ? 0 : 1)
  );
}

const overlaps = <T>(selected: T[], values: T[]) =>
  selected.length === 0 || selected.some((v) => values.includes(v));

export function applyFilters(
  items: readonly ScholarshipWithMatch[],
  f: DiscoverFilters,
  searchIds: Set<string> | null,
  now: Date = new Date(),
): ScholarshipWithMatch[] {
  return items.filter(({ scholarship: s, match }) => {
    if (searchIds && !searchIds.has(s.id)) return false;
    if (!overlaps(f.categories, s.categories)) return false;
    if (!overlaps(f.levels, s.eligibility.levels)) return false;
    if (f.providerTypes.length > 0 && !f.providerTypes.includes(s.providerType)) return false;
    if (s.amount < f.minAmount) return false;
    const days = daysLeft(s.deadline, now);
    if (f.hideClosed && days < 0) return false;
    if (f.deadlineWithin !== null && (days < 0 || days > f.deadlineWithin)) return false;
    if (f.eligibleOnly && match && !match.eligible) return false;
    return true;
  });
}

/** Returns a new sorted array. "match" falls back to deadline when there is no profile. Closed items sink. */
export function sortItems(
  items: readonly ScholarshipWithMatch[],
  sort: SortKey,
  now: Date = new Date(),
): ScholarshipWithMatch[] {
  const days = new Map(items.map((i) => [i.scholarship.id, daysLeft(i.scholarship.deadline, now)]));
  const byDeadline = (a: ScholarshipWithMatch, b: ScholarshipWithMatch) => {
    const da = days.get(a.scholarship.id)!;
    const db = days.get(b.scholarship.id)!;
    if (da < 0 !== db < 0) return da < 0 ? 1 : -1;
    return da - db;
  };
  return [...items].sort((a, b) => {
    if (sort === 'amount') return b.scholarship.amount - a.scholarship.amount || byDeadline(a, b);
    if (sort === 'match' && a.match && b.match) {
      const closedA = days.get(a.scholarship.id)! < 0;
      const closedB = days.get(b.scholarship.id)! < 0;
      if (closedA !== closedB) return closedA ? 1 : -1;
      return b.match.score - a.match.score || byDeadline(a, b);
    }
    return byDeadline(a, b);
  });
}
