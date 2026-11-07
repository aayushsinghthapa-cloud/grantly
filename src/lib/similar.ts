import type { Scholarship } from '@/types';
import { isClosed } from './deadline';

/** Other open scholarships ranked by shared categories, then shared education levels, then amount. */
export function getSimilar(
  target: Scholarship,
  all: readonly Scholarship[],
  limit = 3,
  now: Date = new Date(),
): Scholarship[] {
  const score = (s: Scholarship) =>
    s.categories.filter((c) => target.categories.includes(c)).length * 10 +
    s.eligibility.levels.filter((l) => target.eligibility.levels.includes(l)).length;
  return all
    .filter((s) => s.id !== target.id && !isClosed(s.deadline, now))
    .map((s) => ({ s, score: score(s) }))
    .filter(({ score }) => score >= 10)
    .sort((a, b) => b.score - a.score || b.s.amount - a.s.amount)
    .slice(0, limit)
    .map(({ s }) => s);
}
