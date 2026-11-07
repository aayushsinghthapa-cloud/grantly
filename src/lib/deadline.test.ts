import { describe, expect, it } from 'vitest';
import { daysLeft, daysLeftLabel, urgencyFor } from './deadline';

describe('deadline helpers', () => {
  const now = new Date('2026-03-10T18:30:00');

  it('counts calendar days regardless of time of day', () => {
    expect(daysLeft('2026-03-10', now)).toBe(0);
    expect(daysLeft('2026-03-17', now)).toBe(7);
    expect(daysLeft('2026-03-09', now)).toBe(-1);
  });

  it.each([
    [-1, 'closed'],
    [0, 'urgent'],
    [7, 'urgent'],
    [8, 'soon'],
    [21, 'soon'],
    [22, 'normal'],
  ] as const)('%i days → %s', (days, expected) => {
    expect(urgencyFor(days)).toBe(expected);
  });

  it('formats friendly labels', () => {
    expect(daysLeftLabel(-3)).toBe('Closed');
    expect(daysLeftLabel(0)).toBe('Due today');
    expect(daysLeftLabel(1)).toBe('1 day left');
    expect(daysLeftLabel(12)).toBe('12 days left');
  });
});
