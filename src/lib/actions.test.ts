import { describe, expect, it } from 'vitest';
import { getActionsNeeded } from './actions';
import { makeScholarship } from './test-fixtures';

const now = new Date('2026-06-01');
const mk = (id: string, deadline: string) =>
  makeScholarship({
    id,
    deadline,
    requiredDocuments: ['Aadhaar', 'Photo'],
    steps: [
      { title: 'a', detail: '' },
      { title: 'b', detail: '' },
    ],
  });
const soon = mk('soon', '2026-06-03');
const later = mk('later', '2026-07-30');
const ready = mk('ready', '2026-06-04');
const submitted = mk('submitted', '2026-06-02');
const catalogue = new Map([soon, later, ready, submitted].map((s) => [s.id, s]));
const entry = (status: 'saved' | 'preparing' | 'submitted') => ({ status, updatedAt: '' });

describe('getActionsNeeded', () => {
  it('flags only open, in-progress items due this week that still need work', () => {
    const items = getActionsNeeded(
      {
        soon: entry('preparing'),
        later: entry('saved'),
        ready: entry('preparing'),
        submitted: entry('submitted'),
      },
      { Aadhaar: { has: true }, Photo: { has: true } },
      { soon: [0], ready: [0, 1] },
      catalogue,
      { now },
    );
    expect(items).toEqual([{ scholarship: soon, days: 2, missingDocs: [], stepsLeft: 1 }]);
  });

  it('reports missing documents', () => {
    const [item] = getActionsNeeded({ soon: entry('saved') }, {}, {}, catalogue, { now });
    expect(item.missingDocs).toEqual(['Aadhaar', 'Photo']);
    expect(item.stepsLeft).toBe(2);
  });
});
