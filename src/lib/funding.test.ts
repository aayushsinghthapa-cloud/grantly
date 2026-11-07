import { describe, expect, it } from 'vitest';
import { computeFunding, suggestGapClosers, type TrackerMap } from './funding';
import { makeScholarship, profile } from './test-fixtures';
import type { TrackerStatus } from '@/types';

const a = makeScholarship({ id: 'a', amount: 60000 });
const b = makeScholarship({ id: 'b', amount: 40000 });
const c = makeScholarship({ id: 'c', amount: 30000 });
const d = makeScholarship({ id: 'd', amount: 20000 });
const catalogue = new Map([a, b, c, d].map((s) => [s.id, s]));

const track = (entries: Record<string, TrackerStatus>): TrackerMap =>
  Object.fromEntries(
    Object.entries(entries).map(([id, status]) => [id, { status, updatedAt: '2026-01-01' }]),
  );

describe('computeFunding', () => {
  it('sums each status bucket and computes the gap', () => {
    const f = computeFunding(
      200000,
      track({ a: 'won', b: 'submitted', c: 'preparing', d: 'saved' }),
      catalogue,
    );
    expect(f).toMatchObject({
      won: 60000,
      submitted: 40000,
      preparing: 30000,
      saved: 20000,
      potential: 130000,
      gap: 70000,
    });
    expect(f.coveredPercent).toBe(30);
  });

  it('ignores rejected applications and unknown ids', () => {
    const f = computeFunding(
      100000,
      { ...track({ a: 'rejected' }), ghost: { status: 'won', updatedAt: '' } },
      catalogue,
    );
    expect(f.potential).toBe(0);
    expect(f.gap).toBe(100000);
  });

  it('never reports a negative gap or a bar wider than 100%', () => {
    const f = computeFunding(50000, track({ a: 'won', b: 'submitted' }), catalogue);
    expect(f.gap).toBe(0);
    const total = f.segments.reduce((sum, s) => sum + s.percent, 0);
    expect(total).toBeCloseTo(100);
    expect(f.segments.find((s) => s.key === 'won')!.percent).toBe(100);
    expect(f.segments.find((s) => s.key === 'submitted')!.percent).toBe(0);
  });

  it('orders segments won → submitted → preparing → saved → gap', () => {
    const f = computeFunding(100000, {}, catalogue);
    expect(f.segments.map((s) => s.key)).toEqual(['won', 'submitted', 'preparing', 'saved', 'gap']);
    expect(f.segments.at(-1)!.percent).toBe(100);
  });

  it('handles a zero annual cost without dividing by zero', () => {
    const f = computeFunding(0, track({ a: 'won' }), catalogue);
    expect(f.segments.every((s) => s.percent === 0)).toBe(true);
    expect(f.coveredPercent).toBe(0);
  });
});

describe('suggestGapClosers', () => {
  const now = new Date('2026-06-01');
  const big = makeScholarship({ id: 'big', amount: 100000, deadline: '2026-07-01' });
  const mid = makeScholarship({ id: 'mid', amount: 50000, deadline: '2026-07-01' });
  const small = makeScholarship({ id: 'small', amount: 10000, deadline: '2026-07-01' });
  const closed = makeScholarship({ id: 'closed', amount: 900000, deadline: '2026-05-01' });
  const ineligible = makeScholarship({
    id: 'inel',
    amount: 900000,
    deadline: '2026-07-01',
    eligibility: { levels: ['PhD'] },
  });
  const all = [small, mid, big, closed, ineligible];

  it('returns nothing when there is no gap', () => {
    expect(suggestGapClosers(profile, all, {}, 0, { now })).toEqual([]);
  });

  it('skips closed, ineligible and already-tracked scholarships', () => {
    const ids = suggestGapClosers(profile, all, track({ mid: 'saved' }), 1_000_000, { now }).map(
      (s) => s.scholarship.id,
    );
    expect(ids).toEqual(['big', 'small']);
  });

  it('picks greedily by value and stops once the gap is covered', () => {
    const picks = suggestGapClosers(profile, all, {}, 120000, { now });
    expect(picks.map((p) => p.scholarship.id)).toEqual(['big', 'mid']);
    expect(picks.at(-1)!.cumulative).toBe(150000);
  });

  it('respects the limit', () => {
    expect(suggestGapClosers(profile, all, {}, 1_000_000, { now, limit: 1 })).toHaveLength(1);
  });
});
