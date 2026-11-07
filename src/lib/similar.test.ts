import { describe, expect, it } from 'vitest';
import { getSimilar } from './similar';
import { makeScholarship } from './test-fixtures';

describe('getSimilar', () => {
  const now = new Date('2026-06-01');
  const target = makeScholarship({ id: 't', categories: ['Merit', 'Research'] });
  const both = makeScholarship({ id: 'both', categories: ['Merit', 'Research'] });
  const one = makeScholarship({ id: 'one', categories: ['Research'], amount: 90000 });
  const none = makeScholarship({ id: 'none', categories: ['Arts'] });
  const closed = makeScholarship({
    id: 'closed',
    categories: ['Merit', 'Research'],
    deadline: '2026-01-01',
  });

  it('ranks by shared categories, excludes itself, closed and unrelated scholarships', () => {
    expect(getSimilar(target, [target, one, none, both, closed], 3, now).map((s) => s.id)).toEqual([
      'both',
      'one',
    ]);
  });
});
