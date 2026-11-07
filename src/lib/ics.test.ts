import { describe, expect, it } from 'vitest';
import { buildDeadlineCalendar, escapeIcsText, foldIcsLine } from './ics';
import { makeScholarship } from './test-fixtures';

describe('ics export', () => {
  const s = makeScholarship({
    id: 'abc',
    name: 'Merit, Award; 2026',
    deadline: '2026-12-14',
    summary: 'Line one',
  });
  const ics = buildDeadlineCalendar([s], {
    now: new Date('2026-11-01T10:00:00Z'),
    origin: 'https://example.com',
  });

  it('produces a valid calendar envelope with CRLF line endings', () => {
    expect(ics.startsWith('BEGIN:VCALENDAR\r\nVERSION:2.0\r\n')).toBe(true);
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
    expect(ics.replace(/\r\n/g, '')).not.toMatch(/\n/);
  });

  it('creates an all-day event on the deadline with a 3-day reminder', () => {
    expect(ics).toContain('DTSTART;VALUE=DATE:20261214');
    expect(ics).toContain('DTEND;VALUE=DATE:20261215');
    expect(ics).toContain('TRIGGER:-P3D');
    expect(ics).toContain('UID:abc-2026-12-14@grantly');
    expect(ics).toContain('DTSTAMP:20261101T100000Z');
  });

  it('escapes special characters in text fields', () => {
    expect(escapeIcsText('a,b;c\\d\ne')).toBe('a\\,b\\;c\\\\d\\ne');
    expect(ics).toContain('SUMMARY:Deadline: Merit\\, Award\\; 2026');
  });

  it('folds long lines to 75 octets, including multi-byte characters', () => {
    const folded = foldIcsLine(`DESCRIPTION:${'₹'.repeat(60)}`);
    for (const line of folded.split('\r\n'))
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    expect(
      folded
        .split('\r\n')
        .slice(1)
        .every((l) => l.startsWith(' ')),
    ).toBe(true);
    expect(folded.replace(/\r\n /g, '')).toBe(`DESCRIPTION:${'₹'.repeat(60)}`);
  });
});
