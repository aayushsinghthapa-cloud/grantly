import type { Scholarship, StudentProfile } from '@/types';

export const profile: StudentProfile = {
  name: 'Test Student',
  level: 'Undergraduate',
  field: 'Engineering',
  percentage: 82,
  familyIncome: 400000,
  state: 'Kerala',
  gender: 'Female',
  annualCost: 200000,
  interests: ['Merit', 'Women in STEM'],
};

/** Build a scholarship with sensible defaults; override only what a test cares about. */
export function makeScholarship(overrides: Partial<Scholarship> = {}): Scholarship {
  return {
    id: 'test',
    name: 'Test Scholarship',
    provider: 'Test Provider',
    providerType: 'Private',
    amount: 50000,
    amountType: 'annual',
    deadline: '2030-01-01',
    categories: ['Merit'],
    eligibility: { levels: ['Undergraduate'] },
    requiredDocuments: ['Aadhaar', 'Marksheet'],
    steps: [],
    summary: '',
    description: '',
    renewable: false,
    ...overrides,
  };
}
