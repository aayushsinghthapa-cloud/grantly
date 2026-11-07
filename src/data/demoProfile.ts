import type { StudentProfile, TrackerEntry, Vault } from '@/types';

/** Sample student used by "Try demo profile" so judges can explore instantly. */
export const DEMO_PROFILE: StudentProfile = {
  name: 'Ananya Rao',
  level: 'Undergraduate',
  field: 'Engineering',
  percentage: 86,
  familyIncome: 420000,
  state: 'Karnataka',
  gender: 'Female',
  annualCost: 180000,
  interests: ['Merit', 'Women in STEM', 'Research'],
};

/**
 * A lived-in demo state so every screen has something to show on first load:
 * one win, one submitted, one in progress (due soon, with missing documents), and two saved.
 * Dates are relative to today so the demo never goes stale.
 */
export function buildDemoSeed(now: Date = new Date()): {
  tracker: Record<string, TrackerEntry>;
  vault: Vault;
  checklist: Record<string, number[]>;
} {
  const iso = (offsetDays: number) =>
    new Date(now.getTime() + offsetDays * 86_400_000).toISOString();
  return {
    tracker: {
      'kaveri-state-merit': { status: 'won', updatedAt: iso(-1) },
      'beti-shiksha-udaan': { status: 'submitted', updatedAt: iso(-3) },
      'future-engineers-merit': { status: 'preparing', updatedAt: iso(-2) },
      'shakti-women-stem': { status: 'saved', updatedAt: iso(-4) },
      'jigyasa-summer-research': { status: 'saved', updatedAt: iso(-5) },
    },
    vault: {
      Aadhaar: { has: true },
      Photo: { has: true },
      Marksheet: { has: true, note: 'Semester 3 marksheet' },
      'Bank Passbook': { has: true },
      'Income Certificate': {
        has: true,
        expiry: iso(-10).slice(0, 10),
        note: 'Renew at the tehsil office',
      },
    },
    checklist: {
      'future-engineers-merit': [0, 1],
      'beti-shiksha-udaan': [0, 1, 2, 3, 4],
    },
  };
}
