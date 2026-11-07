import { describe, expect, it } from 'vitest';
import { SCHOLARSHIPS } from './scholarships';
import { CATEGORIES, EDUCATION_LEVELS, PROVIDER_TYPES } from './constants';
import { DEMO_PROFILE } from './demoProfile';
import { getMatch } from '@/lib/match';
import { daysLeft } from '@/lib/deadline';

describe('mock dataset', () => {
  it('has 30 scholarships with unique ids', () => {
    expect(SCHOLARSHIPS).toHaveLength(30);
    expect(new Set(SCHOLARSHIPS.map((s) => s.id)).size).toBe(30);
  });

  it('covers every category, level and provider type', () => {
    for (const c of CATEGORIES)
      expect(
        SCHOLARSHIPS.some((s) => s.categories.includes(c)),
        c,
      ).toBe(true);
    for (const l of EDUCATION_LEVELS)
      expect(
        SCHOLARSHIPS.some((s) => s.eligibility.levels.includes(l)),
        l,
      ).toBe(true);
    for (const p of PROVIDER_TYPES)
      expect(
        SCHOLARSHIPS.some((s) => s.providerType === p),
        p,
      ).toBe(true);
  });

  it('keeps amounts in range and gives every scholarship 4–6 steps', () => {
    for (const s of SCHOLARSHIPS) {
      expect(s.amount).toBeGreaterThanOrEqual(10000);
      expect(s.amount).toBeLessThanOrEqual(300000);
      expect(s.steps.length, s.id).toBeGreaterThanOrEqual(4);
      expect(s.steps.length, s.id).toBeLessThanOrEqual(6);
    }
  });

  it('has a few deadlines inside the next week so the demo feels live', () => {
    const urgent = SCHOLARSHIPS.filter((s) => {
      const d = daysLeft(s.deadline);
      return d >= 0 && d <= 7;
    });
    expect(urgent.length).toBeGreaterThanOrEqual(3);
  });

  it('gives the demo profile a healthy mix of eligible and ineligible results', () => {
    const eligible = SCHOLARSHIPS.filter((s) => getMatch(DEMO_PROFILE, s).eligible).length;
    expect(eligible).toBeGreaterThanOrEqual(8);
    expect(eligible).toBeLessThan(SCHOLARSHIPS.length);
  });
});
