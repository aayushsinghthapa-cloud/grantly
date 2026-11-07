import { describe, expect, it } from 'vitest';
import { getMatch, INELIGIBLE_CAP } from './match';
import { makeScholarship, profile } from './test-fixtures';

describe('getMatch', () => {
  it('scores a perfect, field-specific match at 100', () => {
    const s = makeScholarship({
      categories: ['Merit', 'Women in STEM'],
      eligibility: {
        levels: ['Undergraduate'],
        fields: ['Engineering'],
        minPercentage: 75,
        maxFamilyIncome: 600000,
        gender: 'Female',
      },
    });
    const m = getMatch(profile, s);
    expect(m.eligible).toBe(true);
    expect(m.score).toBe(100);
    expect(m.criteria.every((c) => c.met)).toBe(true);
  });

  it('marks the student ineligible when income is over the cap, and explains why', () => {
    const s = makeScholarship({
      eligibility: { levels: ['Undergraduate'], maxFamilyIncome: 250000 },
    });
    const m = getMatch(profile, s);
    expect(m.eligible).toBe(false);
    const income = m.criteria.find((c) => c.key === 'income')!;
    expect(income.met).toBe(false);
    expect(income.detail).toBe('Your family income ₹4L is above the ₹2.5L limit');
  });

  it('caps the score of ineligible scholarships so they rank below eligible ones', () => {
    const s = makeScholarship({
      categories: ['Merit', 'Women in STEM'],
      eligibility: { levels: ['Undergraduate'], fields: ['Engineering'], states: ['Goa'] },
    });
    const m = getMatch(profile, s);
    expect(m.eligible).toBe(false);
    expect(m.score).toBeLessThanOrEqual(INELIGIBLE_CAP);
  });

  it.each([
    ['level', { levels: ['PhD'] as const }],
    ['percentage', { levels: ['Undergraduate'] as const, minPercentage: 90 }],
    ['gender', { levels: ['Undergraduate'] as const, gender: 'Female' as const }],
    ['state', { levels: ['Undergraduate'] as const, states: ['Goa'] }],
  ])('treats %s as a hard criterion', (key, eligibility) => {
    const student = key === 'gender' ? { ...profile, gender: 'Male' as const } : profile;
    const m = getMatch(
      student,
      makeScholarship({ eligibility: { ...eligibility, levels: [...eligibility.levels] } }),
    );
    expect(m.eligible).toBe(false);
    expect(m.criteria.find((c) => c.key === key)).toMatchObject({ kind: 'hard', met: false });
  });

  it('treats interests as a soft signal that lowers the score but keeps eligibility', () => {
    const m = getMatch(profile, makeScholarship({ categories: ['Arts'] }));
    expect(m.eligible).toBe(true);
    expect(m.score).toBe(75);
    expect(m.criteria.find((c) => c.key === 'interests')).toMatchObject({
      kind: 'soft',
      met: false,
    });
  });

  it('makes field a hard criterion only when the scholarship restricts fields', () => {
    const restricted = getMatch(
      profile,
      makeScholarship({ eligibility: { levels: ['Undergraduate'], fields: ['Medicine'] } }),
    );
    expect(restricted.eligible).toBe(false);
    expect(restricted.criteria.find((c) => c.key === 'field')).toMatchObject({
      kind: 'hard',
      met: false,
    });

    const open = getMatch(profile, makeScholarship());
    expect(open.criteria.find((c) => c.key === 'field')).toMatchObject({ kind: 'soft', met: true });
  });

  it('ranks a near-miss above a scholarship that misses on everything', () => {
    const nearMiss = getMatch(
      profile,
      makeScholarship({ eligibility: { levels: ['Undergraduate'], minPercentage: 85 } }),
    );
    const farMiss = getMatch(
      profile,
      makeScholarship({
        categories: ['Arts'],
        eligibility: { levels: ['PhD'], fields: ['Law'], minPercentage: 95, states: ['Goa'] },
      }),
    );
    expect(nearMiss.eligible || farMiss.eligible).toBe(false);
    expect(nearMiss.score).toBeGreaterThan(farMiss.score);
  });

  it('only includes criteria the scholarship actually sets', () => {
    const m = getMatch(profile, makeScholarship());
    expect(m.criteria.map((c) => c.key)).toEqual(['level', 'field', 'interests']);
  });

  it('ranks a field-specific match above an open-to-all one', () => {
    const specific = getMatch(
      profile,
      makeScholarship({ eligibility: { levels: ['Undergraduate'], fields: ['Engineering'] } }),
    );
    const open = getMatch(profile, makeScholarship());
    expect(specific.score).toBeGreaterThan(open.score);
  });

  it('explains a marks shortfall in points', () => {
    const m = getMatch(
      profile,
      makeScholarship({ eligibility: { levels: ['Undergraduate'], minPercentage: 85 } }),
    );
    expect(m.criteria.find((c) => c.key === 'percentage')!.detail).toBe(
      'Needs 85% — you have 82% (3 points short)',
    );
  });
});
