import { describe, expect, it } from 'vitest';
import { draftFromProfile, EMPTY_DRAFT, profileFromDraft, validateDraft } from './profileForm';
import { profile } from './test-fixtures';

describe('profile form helpers', () => {
  it('round-trips a profile through a draft', () => {
    expect(profileFromDraft(draftFromProfile(profile))).toEqual(profile);
  });

  it('reports every missing field on an empty draft', () => {
    expect(Object.keys(validateDraft(EMPTY_DRAFT)).sort()).toEqual(
      [
        'annualCost',
        'familyIncome',
        'field',
        'gender',
        'interests',
        'level',
        'name',
        'percentage',
        'state',
      ].sort(),
    );
  });

  it('only validates the requested fields and range-checks marks', () => {
    const draft = { ...draftFromProfile(profile), percentage: '104' };
    expect(validateDraft(draft, ['name', 'percentage'])).toEqual({
      percentage: 'Enter a percentage between 0 and 100.',
    });
  });

  it('accepts zero family income but not zero cost', () => {
    const draft = { ...draftFromProfile(profile), familyIncome: '0', annualCost: '0' };
    expect(Object.keys(validateDraft(draft))).toEqual(['annualCost']);
  });
});
