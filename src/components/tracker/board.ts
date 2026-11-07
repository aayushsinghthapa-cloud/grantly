import type { TrackerStatus } from '@/types';

export interface ZoneMeta {
  status: TrackerStatus;
  label: string;
  hint: string;
  dot: string;
}

/** Board columns. "Result" holds two drop zones so a drop is never ambiguous. */
export const COLUMNS: { title: string; zones: ZoneMeta[] }[] = [
  {
    title: 'Saved',
    zones: [{ status: 'saved', label: 'Saved', hint: 'Shortlisted, not started', dot: 'bg-muted' }],
  },
  {
    title: 'Preparing',
    zones: [
      {
        status: 'preparing',
        label: 'Preparing',
        hint: 'Gathering documents & steps',
        dot: 'bg-accent',
      },
    ],
  },
  {
    title: 'Submitted',
    zones: [
      {
        status: 'submitted',
        label: 'Submitted',
        hint: 'Waiting for a result',
        dot: 'bg-primary/60',
      },
    ],
  },
  {
    title: 'Result',
    zones: [
      { status: 'won', label: 'Won', hint: 'Congratulations!', dot: 'bg-success' },
      {
        status: 'rejected',
        label: 'Not selected',
        hint: 'Every no gets you closer',
        dot: 'bg-danger',
      },
    ],
  },
];

export const ZONES: ZoneMeta[] = COLUMNS.flatMap((c) => c.zones);
