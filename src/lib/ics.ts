import { addDays, format, parseISO } from 'date-fns';
import type { Scholarship } from '@/types';
import { formatINR } from './format';

/** RFC 5545 text escaping: backslash, semicolon, comma and newlines. */
export function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/** RFC 5545 line folding: lines longer than 75 octets continue on the next line with a leading space. */
export function foldIcsLine(line: string): string {
  const encoder = new TextEncoder();
  if (encoder.encode(line).length <= 75) return line;
  const parts: string[] = [];
  let current = '';
  for (const ch of line) {
    // Continuation lines start with a space, which counts towards their 75 octets.
    const limit = parts.length === 0 ? 75 : 74;
    if (encoder.encode(current + ch).length > limit) {
      parts.push(current);
      current = ch;
    } else current += ch;
  }
  parts.push(current);
  return parts.join('\r\n ');
}

const utcStamp = (d: Date) =>
  d
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');

interface IcsOptions {
  now?: Date;
  /** Origin used to build a link back to the scholarship page. */
  origin?: string;
  /** Days before the deadline to fire a reminder. */
  reminderDays?: number;
}

/**
 * Build an iCalendar file with one all-day event per scholarship deadline,
 * each with a reminder `reminderDays` before. Pure — returns the file contents.
 */
export function buildDeadlineCalendar(
  scholarships: readonly Scholarship[],
  { now = new Date(), origin = 'https://grantly.app', reminderDays = 3 }: IcsOptions = {},
): string {
  const stamp = utcStamp(now);
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Grantly//Scholarship deadlines//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  for (const s of scholarships) {
    const day = parseISO(s.deadline);
    const url = `${origin}/scholarship/${s.id}`;
    lines.push(
      'BEGIN:VEVENT',
      `UID:${s.id}-${s.deadline}@grantly`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${format(day, 'yyyyMMdd')}`,
      `DTEND;VALUE=DATE:${format(addDays(day, 1), 'yyyyMMdd')}`,
      `SUMMARY:${escapeIcsText(`Deadline: ${s.name}`)}`,
      `DESCRIPTION:${escapeIcsText(`${s.summary}\nAward: ${formatINR(s.amount)}\nProvider: ${s.provider}\nDetails: ${url}`)}`,
      `URL:${url}`,
      'TRANSP:TRANSPARENT',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapeIcsText(`${s.name} closes in ${reminderDays} days`)}`,
      `TRIGGER:-P${reminderDays}D`,
      'END:VALARM',
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  return lines.map(foldIcsLine).join('\r\n') + '\r\n';
}

/** Browser-only: trigger a download of the calendar file. */
export function downloadCalendar(scholarships: readonly Scholarship[], filename: string): void {
  const ics = buildDeadlineCalendar(scholarships, { origin: window.location.origin });
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
