import type { TrackerStatus } from '@/types';
import type { TrackerMap } from './funding';

/**
 * A scripted scholarship season for the demo student, used by the landing page's
 * "season scrubber". Each step is a real tracker state; the page runs it through the
 * real computeFunding(), so every number on screen is computed, not painted.
 */
export interface SeasonStep {
  /** Short caption shown while this step is active. */
  caption: string;
  statuses: Record<string, TrackerStatus>;
}

export const SEASON_IDS = [
  'kaveri-state-merit',
  'future-engineers-merit',
  'beti-shiksha-udaan',
  'code-for-tomorrow',
] as const;

export const SEASON: SeasonStep[] = [
  {
    caption: 'September. Four scholarships saved. Nothing in play yet.',
    statuses: {
      'kaveri-state-merit': 'saved',
      'future-engineers-merit': 'saved',
      'beti-shiksha-udaan': 'saved',
      'code-for-tomorrow': 'saved',
    },
  },
  {
    caption: 'October. Two applications started.',
    statuses: {
      'kaveri-state-merit': 'preparing',
      'future-engineers-merit': 'preparing',
      'beti-shiksha-udaan': 'saved',
      'code-for-tomorrow': 'saved',
    },
  },
  {
    caption: 'November. Two submitted, a third under way.',
    statuses: {
      'kaveri-state-merit': 'submitted',
      'future-engineers-merit': 'submitted',
      'beti-shiksha-udaan': 'preparing',
      'code-for-tomorrow': 'saved',
    },
  },
  {
    caption: 'December. The first award comes through. The gap is closed.',
    statuses: {
      'kaveri-state-merit': 'won',
      'future-engineers-merit': 'submitted',
      'beti-shiksha-udaan': 'submitted',
      'code-for-tomorrow': 'preparing',
    },
  },
  {
    caption: 'January. Three awards won. The year is paid for.',
    statuses: {
      'kaveri-state-merit': 'won',
      'future-engineers-merit': 'won',
      'beti-shiksha-udaan': 'won',
      'code-for-tomorrow': 'submitted',
    },
  },
];

export function seasonTracker(step: number): TrackerMap {
  const s = SEASON[Math.max(0, Math.min(SEASON.length - 1, step))];
  return Object.fromEntries(
    Object.entries(s.statuses).map(([id, status]) => [id, { status, updatedAt: '' }]),
  );
}

/** Map act progress (0..1) to a season step. The first and last steps get a little extra room. */
export function seasonStepAt(progress: number): number {
  const thresholds = [0.16, 0.36, 0.56, 0.76];
  return thresholds.filter((t) => progress >= t).length;
}
