import { describe, expect, it } from 'vitest';
import { SEASON, SEASON_IDS, seasonStepAt, seasonTracker } from './season';
import { computeFunding } from './funding';
import { SCHOLARSHIPS_BY_ID } from '@/data/scholarships';
import { DEMO_PROFILE } from '@/data/demoProfile';

describe('landing season', () => {
  const gaps = SEASON.map(
    (_, i) => computeFunding(DEMO_PROFILE.annualCost, seasonTracker(i), SCHOLARSHIPS_BY_ID).gap,
  );

  it('only uses real scholarships from the dataset', () => {
    for (const id of SEASON_IDS) expect(SCHOLARSHIPS_BY_ID.has(id)).toBe(true);
  });

  it('starts with the full cost as the gap and closes it by the end', () => {
    expect(gaps[0]).toBe(DEMO_PROFILE.annualCost);
    expect(gaps.at(-1)).toBe(0);
  });

  it('never lets the gap grow as the season advances', () => {
    for (let i = 1; i < gaps.length; i++) expect(gaps[i]).toBeLessThanOrEqual(gaps[i - 1]);
  });

  it('ends with real money won, not just applications in play', () => {
    const last = computeFunding(
      DEMO_PROFILE.annualCost,
      seasonTracker(SEASON.length - 1),
      SCHOLARSHIPS_BY_ID,
    );
    expect(last.won).toBeGreaterThan(0);
  });

  it('maps scroll progress onto every step, in order', () => {
    expect([0, 0.2, 0.4, 0.6, 0.8, 1].map(seasonStepAt)).toEqual([0, 1, 2, 3, 4, 4]);
  });
});
