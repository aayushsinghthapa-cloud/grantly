import { describe, expect, it } from 'vitest';
import { dueReminders, getNotifications } from './notifications';
import { makeScholarship } from './test-fixtures';
import { parseBackup, buildBackup } from '@/store/app';

const now = new Date('2026-06-01');
const soon = makeScholarship({ id: 'soon', name: 'Soon Award', deadline: '2026-06-04' });
const later = makeScholarship({ id: 'later', name: 'Later Award', deadline: '2026-07-20' });
const done = makeScholarship({ id: 'done', name: 'Done Award', deadline: '2026-06-02' });
const catalogue = new Map([soon, later, done].map((s) => [s.id, s]));
const entry = (status: 'saved' | 'preparing' | 'submitted') => ({ status, updatedAt: '' });

describe('getNotifications', () => {
  it('raises a reminder only inside the window the student chose', () => {
    const base = { tracker: {}, vault: {}, catalogue, now };
    expect(getNotifications({ ...base, reminders: { soon: 3 } })[0]).toMatchObject({
      kind: 'reminder',
      href: '/scholarship/soon',
    });
    expect(getNotifications({ ...base, reminders: { soon: 1 } })).toEqual([]);
    expect(getNotifications({ ...base, reminders: { later: 7 } })).toEqual([]);
  });

  it('warns about open applications closing within a week, but not submitted ones', () => {
    const list = getNotifications({
      tracker: { soon: entry('saved'), done: entry('submitted'), later: entry('preparing') },
      vault: {},
      reminders: {},
      catalogue,
      now,
    });
    expect(list.map((n) => n.id)).toEqual(['deadline:soon']);
    expect(list[0].detail).toMatch(/only saved/);
  });

  it('does not double up a deadline that already has a reminder', () => {
    const list = getNotifications({
      tracker: { soon: entry('preparing') },
      vault: {},
      reminders: { soon: 5 },
      catalogue,
      now,
    });
    expect(list.map((n) => n.kind)).toEqual(['reminder']);
  });

  it('flags expired documents and links to them in the vault', () => {
    const list = getNotifications({
      tracker: {},
      vault: {
        'Income Certificate': { has: true, expiry: '2026-05-01' },
        Photo: { has: true, expiry: '2027-01-01' },
      },
      reminders: {},
      catalogue,
      now,
    });
    expect(list).toEqual([
      expect.objectContaining({ kind: 'document', href: '/vault#doc-income-certificate' }),
    ]);
  });

  it('orders by urgency and separates due reminders', () => {
    const list = getNotifications({
      tracker: { done: entry('preparing') },
      vault: { Photo: { has: true, expiry: '2026-01-01' } },
      reminders: { soon: 3 },
      catalogue,
      now,
    });
    expect(list.map((n) => n.kind)).toEqual(['deadline', 'reminder', 'document']);
    expect(dueReminders(list)).toHaveLength(1);
  });
});

describe('backup format', () => {
  it('round-trips through export and import', () => {
    const data = {
      profile: null,
      tracker: { soon: entry('saved') },
      vault: {},
      checklist: { soon: [0] },
      compare: ['soon'],
      isDemo: false,
      reminders: { soon: 3 },
      notes: { soon: 'call the office' },
    };
    expect(parseBackup(JSON.parse(JSON.stringify(buildBackup(data))))).toEqual(data);
  });

  it('rejects files that are not Grantly backups', () => {
    expect(parseBackup({ hello: 'world' })).toBeNull();
    expect(parseBackup({ app: 'grantly', data: { tracker: 'nope' } })).toBeNull();
    expect(parseBackup('text')).toBeNull();
  });
});
