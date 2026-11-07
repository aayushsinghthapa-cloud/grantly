import type { Scholarship, StudentProfile } from '@/types';
import { formatINRCompact } from './format';

export interface MatchCriterion {
  /** Stable key, useful for React lists and tests. */
  key: 'level' | 'income' | 'percentage' | 'gender' | 'state' | 'field' | 'interests';
  label: string;
  met: boolean;
  /** Plain-English explanation, e.g. "Your family income ₹4.2L is under the ₹6L limit". */
  detail: string;
  /** Hard criteria decide eligibility; soft criteria only adjust the score.
   *  Field is hard only when the scholarship is restricted to specific fields. */
  kind: 'hard' | 'soft';
}

export interface MatchResult {
  /** 0–100 */
  score: number;
  eligible: boolean;
  criteria: MatchCriterion[];
}

/** Score weights. Hard criteria make up most of the score; fit and interests rank eligible options. */
export const WEIGHTS = { hard: 60, field: 20, interests: 20 } as const;
/** Ineligible scholarships are scaled down and never score above this, so they always rank below eligible ones. */
export const INELIGIBLE_CAP = 35;
const INELIGIBLE_SCALE = 0.5;

const isOpenField = (fields?: string[]) => !fields || fields.length === 0 || fields.includes('Any');

function hardCriteria(p: StudentProfile, s: Scholarship): MatchCriterion[] {
  const e = s.eligibility;
  const out: MatchCriterion[] = [];

  const levelOk = e.levels.includes(p.level);
  out.push({
    key: 'level',
    kind: 'hard',
    label: 'Education level',
    met: levelOk,
    detail: levelOk
      ? `Open to ${p.level} students like you`
      : `Only for ${e.levels.join(', ')} — you are ${p.level}`,
  });

  if (e.maxFamilyIncome !== undefined) {
    const ok = p.familyIncome <= e.maxFamilyIncome;
    out.push({
      key: 'income',
      kind: 'hard',
      label: 'Family income',
      met: ok,
      detail: ok
        ? `Your family income ${formatINRCompact(p.familyIncome)} is under the ${formatINRCompact(e.maxFamilyIncome)} limit`
        : `Your family income ${formatINRCompact(p.familyIncome)} is above the ${formatINRCompact(e.maxFamilyIncome)} limit`,
    });
  }

  if (e.minPercentage !== undefined) {
    const ok = p.percentage >= e.minPercentage;
    out.push({
      key: 'percentage',
      kind: 'hard',
      label: 'Minimum marks',
      met: ok,
      detail: ok
        ? `Your ${p.percentage}% meets the ${e.minPercentage}% minimum`
        : `Needs ${e.minPercentage}% — you have ${p.percentage}% (${e.minPercentage - p.percentage} points short)`,
    });
  }

  if (e.gender === 'Female') {
    const ok = p.gender === 'Female';
    out.push({
      key: 'gender',
      kind: 'hard',
      label: 'Gender',
      met: ok,
      detail: ok ? 'Reserved for women students — you qualify' : 'Reserved for women students only',
    });
  }

  if (e.states && e.states.length > 0) {
    const ok = e.states.includes(p.state);
    const where =
      e.states.length <= 2 ? e.states.join(' and ') : `${e.states.length} listed states`;
    out.push({
      key: 'state',
      kind: 'hard',
      label: 'State of residence',
      met: ok,
      detail: ok
        ? `Open to residents of ${p.state}`
        : `Only for residents of ${where} — you are in ${p.state}`,
    });
  }

  return out;
}

function fitCriteria(
  p: StudentProfile,
  s: Scholarship,
): { criteria: MatchCriterion[]; field: number; interests: number; fieldIsHard: boolean } {
  const open = isOpenField(s.eligibility.fields);
  const fieldOk = open || s.eligibility.fields!.includes(p.field);
  const fieldCriterion: MatchCriterion = {
    key: 'field',
    kind: open ? 'soft' : 'hard',
    label: 'Field of study',
    met: fieldOk,
    detail: open
      ? 'Open to every field of study'
      : fieldOk
        ? `Designed for ${p.field} students`
        : `Aimed at ${s.eligibility.fields!.join(', ')} — you study ${p.field}`,
  };

  const overlap = s.categories.filter((c) => p.interests.includes(c));
  const interestCriterion: MatchCriterion = {
    key: 'interests',
    kind: 'soft',
    label: 'Your interests',
    met: overlap.length > 0,
    detail:
      overlap.length > 0
        ? `Matches your interest in ${overlap.join(' and ')}`
        : `Not in your chosen interests (${s.categories.join(', ')})`,
  };

  // A field-specific scholarship that matches is a stronger signal than an open one.
  const field = !fieldOk ? 0 : open ? 0.75 : 1;
  const fieldIsHard = !open;
  const interests = overlap.length === 0 ? 0 : overlap.length === 1 ? 0.7 : 1;
  return { criteria: [fieldCriterion, interestCriterion], field, interests, fieldIsHard };
}

/**
 * Compare a student profile against a scholarship.
 * Pure and deterministic — the same inputs always give the same score.
 */
export function getMatch(profile: StudentProfile, scholarship: Scholarship): MatchResult {
  const hard = hardCriteria(profile, scholarship);
  const fit = fitCriteria(profile, scholarship);
  const fieldCriterion = fit.criteria[0];
  const hardMet = hard.filter((c) => c.met).length;
  const eligible = hardMet === hard.length && (!fit.fieldIsHard || fieldCriterion.met);

  const raw =
    WEIGHTS.hard * (hardMet / hard.length) +
    WEIGHTS.field * fit.field +
    WEIGHTS.interests * fit.interests;
  const score = Math.round(eligible ? raw : Math.min(raw * INELIGIBLE_SCALE, INELIGIBLE_CAP));

  return { score, eligible, criteria: [...hard, ...fit.criteria] };
}
