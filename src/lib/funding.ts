import type { Scholarship, StudentProfile, TrackerEntry, TrackerStatus } from '@/types';
import { getMatch } from './match';
import { isClosed } from './deadline';

export type FundingSegmentKey = 'won' | 'submitted' | 'preparing' | 'saved' | 'gap';

export interface FundingSegment {
  key: FundingSegmentKey;
  /** Full amount in this bucket (may exceed what fits in the bar). */
  amount: number;
  /** Portion of the annual cost this bucket fills in the bar, 0–100. Segments sum to ≤ 100. */
  percent: number;
  count: number;
}

export interface FundingSummary {
  annualCost: number;
  /** Money already won. */
  won: number;
  /** Submitted — awaiting a result. */
  submitted: number;
  /** Being prepared, not yet submitted. */
  preparing: number;
  /** Saved but not started. */
  saved: number;
  /** won + submitted + preparing — what is realistically in play. */
  potential: number;
  /** annualCost − potential, never negative. */
  gap: number;
  /** Ordered segments for a stacked bar: won → submitted → preparing → saved → gap. */
  segments: FundingSegment[];
  /** % of annual cost covered by money already won. */
  coveredPercent: number;
}

export type TrackerMap = Record<string, TrackerEntry>;

const BAR_ORDER: Exclude<FundingSegmentKey, 'gap'>[] = ['won', 'submitted', 'preparing', 'saved'];

/** Sum tracked scholarship amounts by status and work out the remaining funding gap. */
export function computeFunding(
  annualCost: number,
  tracker: TrackerMap,
  catalogue: ReadonlyMap<string, Scholarship>,
): FundingSummary {
  const totals: Record<TrackerStatus, { amount: number; count: number }> = {
    saved: { amount: 0, count: 0 },
    preparing: { amount: 0, count: 0 },
    submitted: { amount: 0, count: 0 },
    won: { amount: 0, count: 0 },
    rejected: { amount: 0, count: 0 },
  };

  for (const [id, entry] of Object.entries(tracker)) {
    const s = catalogue.get(id);
    if (!s) continue;
    totals[entry.status].amount += s.amount;
    totals[entry.status].count += 1;
  }

  const cost = Math.max(0, annualCost);
  const potential = totals.won.amount + totals.submitted.amount + totals.preparing.amount;
  const gap = Math.max(0, cost - potential);

  // Fill the bar in order; once the cost is fully covered, later buckets get no width.
  let remaining = cost;
  const segments: FundingSegment[] = BAR_ORDER.map((key) => {
    const { amount, count } = totals[key];
    const fill = Math.min(amount, remaining);
    remaining -= fill;
    return { key, amount, count, percent: cost === 0 ? 0 : (fill / cost) * 100 };
  });
  // The gap segment ignores "saved" money: saved isn't in play yet, so it overlaps the gap visually.
  const gapFill = Math.max(0, remaining);
  segments.push({
    key: 'gap',
    amount: gap,
    count: 0,
    percent: cost === 0 ? 0 : (gapFill / cost) * 100,
  });

  return {
    annualCost: cost,
    won: totals.won.amount,
    submitted: totals.submitted.amount,
    preparing: totals.preparing.amount,
    saved: totals.saved.amount,
    potential,
    gap,
    segments,
    coveredPercent: cost === 0 ? 0 : Math.min(100, (totals.won.amount / cost) * 100),
  };
}

export interface GapSuggestion {
  scholarship: Scholarship;
  score: number;
  /** Running total of suggested amounts, including this one. */
  cumulative: number;
}

/**
 * Greedy "close your gap" picks: eligible, still open, not already tracked
 * (anything already saved counts as tracked), ranked by match score × amount.
 * Stops once the gap is covered or `limit` is reached.
 */
export function suggestGapClosers(
  profile: StudentProfile,
  scholarships: readonly Scholarship[],
  tracker: TrackerMap,
  gap: number,
  { limit = 3, now = new Date() }: { limit?: number; now?: Date } = {},
): GapSuggestion[] {
  if (gap <= 0) return [];

  const ranked = scholarships
    .filter((s) => !tracker[s.id] && !isClosed(s.deadline, now))
    .map((s) => ({ s, m: getMatch(profile, s) }))
    .filter(({ m }) => m.eligible)
    .sort((a, b) => b.m.score * b.s.amount - a.m.score * a.s.amount);

  const picks: GapSuggestion[] = [];
  let cumulative = 0;
  for (const { s, m } of ranked) {
    if (picks.length >= limit || cumulative >= gap) break;
    cumulative += s.amount;
    picks.push({ scholarship: s, score: m.score, cumulative });
  }
  return picks;
}
