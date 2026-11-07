import { describe, expect, it } from 'vitest';
import { applyFilters, countActiveFilters, DEFAULT_FILTERS, sortItems } from './filters';
import { getMatch, type ScholarshipWithMatch } from './match';
import { makeScholarship, profile } from './test-fixtures';
import { createScholarshipSearch } from './search';

const now = new Date('2026-06-01');
const list = [
  makeScholarship({
    id: 'soon',
    name: 'Aurora Merit Award',
    amount: 20000,
    deadline: '2026-06-05',
    categories: ['Merit'],
  }),
  makeScholarship({
    id: 'later',
    name: 'Banyan Arts Grant',
    amount: 90000,
    deadline: '2026-08-01',
    categories: ['Arts'],
    providerType: 'NGO',
  }),
  makeScholarship({
    id: 'closed',
    name: 'Cedar Merit Prize',
    amount: 50000,
    deadline: '2026-05-20',
  }),
  makeScholarship({
    id: 'phd',
    name: 'Delta Research Fellowship',
    amount: 150000,
    deadline: '2026-07-01',
    eligibility: { levels: ['PhD'] },
  }),
];
const items: ScholarshipWithMatch[] = list.map((s) => ({
  scholarship: s,
  match: getMatch(profile, s),
}));
const ids = (xs: ScholarshipWithMatch[]) => xs.map((x) => x.scholarship.id);

describe('applyFilters', () => {
  it('hides closed scholarships by default', () => {
    expect(ids(applyFilters(items, DEFAULT_FILTERS, null, now))).toEqual(['soon', 'later', 'phd']);
  });

  it('combines category, provider, amount and deadline filters', () => {
    expect(
      ids(applyFilters(items, { ...DEFAULT_FILTERS, categories: ['Arts'] }, null, now)),
    ).toEqual(['later']);
    expect(
      ids(applyFilters(items, { ...DEFAULT_FILTERS, providerTypes: ['NGO'] }, null, now)),
    ).toEqual(['later']);
    expect(ids(applyFilters(items, { ...DEFAULT_FILTERS, minAmount: 100000 }, null, now))).toEqual([
      'phd',
    ]);
    expect(ids(applyFilters(items, { ...DEFAULT_FILTERS, deadlineWithin: 7 }, null, now))).toEqual([
      'soon',
    ]);
  });

  it('filters to eligible only', () => {
    expect(ids(applyFilters(items, { ...DEFAULT_FILTERS, eligibleOnly: true }, null, now))).toEqual(
      ['soon', 'later'],
    );
  });

  it('intersects with fuzzy search results', () => {
    const search = createScholarshipSearch(list);
    expect(ids(applyFilters(items, DEFAULT_FILTERS, search('banyan'), now))).toEqual(['later']);
    expect(search('   ')).toBeNull();
  });
});

describe('sortItems', () => {
  it('sorts by deadline with closed items last', () => {
    expect(ids(sortItems(items, 'deadline', now))).toEqual(['soon', 'phd', 'later', 'closed']);
  });

  it('sorts by amount', () => {
    expect(ids(sortItems(items, 'amount', now))[0]).toBe('phd');
  });

  it('sorts by match score, keeping ineligible below eligible', () => {
    expect(ids(sortItems(items, 'match', now)).at(-2)).toBe('phd');
  });
});

it('counts active filters', () => {
  expect(countActiveFilters(DEFAULT_FILTERS)).toBe(0);
  expect(
    countActiveFilters({ ...DEFAULT_FILTERS, categories: ['Arts', 'Merit'], hideClosed: false }),
  ).toBe(3);
});
