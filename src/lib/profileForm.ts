import type { Category, EducationLevel, StudentProfile } from '@/types';

/** Profile form values are strings while editing so inputs can be empty; converted on submit. */
export interface ProfileDraft {
  name: string;
  gender: StudentProfile['gender'] | '';
  state: string;
  level: EducationLevel | '';
  field: string;
  percentage: string;
  familyIncome: string;
  annualCost: string;
  interests: Category[];
}
export type DraftKey = keyof ProfileDraft;
export type DraftErrors = Partial<Record<DraftKey, string>>;

export const ALL_DRAFT_KEYS: readonly DraftKey[] = [
  'name',
  'gender',
  'state',
  'level',
  'field',
  'percentage',
  'familyIncome',
  'annualCost',
  'interests',
];

export const EMPTY_DRAFT: ProfileDraft = {
  name: '',
  gender: '',
  state: '',
  level: '',
  field: '',
  percentage: '',
  familyIncome: '',
  annualCost: '',
  interests: [],
};

export function draftFromProfile(p: StudentProfile): ProfileDraft {
  return {
    ...p,
    percentage: String(p.percentage),
    familyIncome: String(p.familyIncome),
    annualCost: String(p.annualCost),
  };
}

/** Call only after validateDraft() returns no errors. */
export function profileFromDraft(d: ProfileDraft): StudentProfile {
  return {
    name: d.name.trim(),
    gender: d.gender as StudentProfile['gender'],
    state: d.state,
    level: d.level as EducationLevel,
    field: d.field,
    percentage: Number(d.percentage),
    familyIncome: Number(d.familyIncome),
    annualCost: Number(d.annualCost),
    interests: d.interests,
  };
}

/** Plain-language validation for the given fields. Empty object = valid. */
export function validateDraft(
  d: ProfileDraft,
  keys: readonly DraftKey[] = ALL_DRAFT_KEYS,
): DraftErrors {
  const e: DraftErrors = {};
  const num = (v: string) => (v.trim() === '' ? NaN : Number(v));
  for (const k of keys) {
    switch (k) {
      case 'name':
        if (d.name.trim().length < 2) e.name = 'Please enter your name (at least 2 letters).';
        break;
      case 'gender':
        if (!d.gender)
          e.gender = 'Please choose an option. Some scholarships are reserved for women.';
        break;
      case 'state':
        if (!d.state) e.state = 'Please choose your state. Some scholarships are state-specific.';
        break;
      case 'level':
        if (!d.level) e.level = 'Please choose your current level of study.';
        break;
      case 'field':
        if (!d.field) e.field = 'Please choose your field of study.';
        break;
      case 'percentage': {
        const n = num(d.percentage);
        if (Number.isNaN(n) || n < 0 || n > 100)
          e.percentage = 'Enter a percentage between 0 and 100.';
        break;
      }
      case 'familyIncome': {
        const n = num(d.familyIncome);
        if (Number.isNaN(n) || n < 0)
          e.familyIncome = 'Enter your family’s yearly income in rupees (0 is fine).';
        break;
      }
      case 'annualCost': {
        const n = num(d.annualCost);
        if (Number.isNaN(n) || n <= 0)
          e.annualCost = 'Enter your yearly cost of study. A rough estimate is fine.';
        break;
      }
      case 'interests':
        if (d.interests.length === 0)
          e.interests = 'Pick at least one so we can rank scholarships for you.';
        break;
    }
  }
  return e;
}
