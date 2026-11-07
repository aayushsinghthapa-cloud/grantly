export type EducationLevel = 'Class 11-12' | 'Undergraduate' | 'Postgraduate' | 'Diploma' | 'PhD';

export type Category =
  | 'Merit'
  | 'Need-based'
  | 'Women in STEM'
  | 'Sports'
  | 'Arts'
  | 'Research'
  | 'Minority'
  | 'Disability'
  | 'International';

export type ProviderType = 'Government' | 'Private' | 'NGO' | 'University';

export type DocType =
  | 'Aadhaar'
  | 'Income Certificate'
  | 'Marksheet'
  | 'Bonafide Certificate'
  | 'Bank Passbook'
  | 'Caste Certificate'
  | 'Photo'
  | 'Recommendation Letter'
  | 'Statement of Purpose'
  | 'Disability Certificate';

export interface ApplicationStep {
  title: string;
  detail: string;
}

export interface Eligibility {
  levels: EducationLevel[];
  /** e.g. 'Engineering', 'Medicine'. Undefined or containing 'Any' = open to all fields. */
  fields?: string[];
  minPercentage?: number;
  /** INR per year */
  maxFamilyIncome?: number;
  /** Undefined = open to all of India */
  states?: string[];
  gender?: 'Female' | 'Any';
  /** Extra condition the student must self-verify (not scored), e.g. "Must hold a disability certificate". */
  note?: string;
}

export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  providerType: ProviderType;
  /** INR per year (or total, for one-time awards) */
  amount: number;
  amountType: 'one-time' | 'annual' | 'full-tuition';
  /** ISO date (yyyy-MM-dd) */
  deadline: string;
  categories: Category[];
  eligibility: Eligibility;
  requiredDocuments: DocType[];
  steps: ApplicationStep[];
  summary: string;
  description: string;
  renewable: boolean;
  applicants?: number;
  seats?: number;
}

export interface StudentProfile {
  name: string;
  level: EducationLevel;
  field: string;
  percentage: number;
  familyIncome: number;
  state: string;
  gender: 'Female' | 'Male' | 'Other';
  /** Total annual cost of study — drives the Funding Gap Meter. */
  annualCost: number;
  interests: Category[];
}

export type TrackerStatus = 'saved' | 'preparing' | 'submitted' | 'won' | 'rejected';

export interface TrackerEntry {
  status: TrackerStatus;
  /** ISO timestamp */
  updatedAt: string;
}

export interface VaultEntry {
  has: boolean;
  note?: string;
  /** ISO date; an expired document no longer counts as ready. */
  expiry?: string;
}

export type Vault = Partial<Record<DocType, VaultEntry>>;
