import type { Category, DocType, EducationLevel, ProviderType, TrackerStatus } from '@/types';

export const EDUCATION_LEVELS: readonly EducationLevel[] = [
  'Class 11-12',
  'Diploma',
  'Undergraduate',
  'Postgraduate',
  'PhD',
];

export const CATEGORIES: readonly Category[] = [
  'Merit',
  'Need-based',
  'Women in STEM',
  'Sports',
  'Arts',
  'Research',
  'Minority',
  'Disability',
  'International',
];

export const PROVIDER_TYPES: readonly ProviderType[] = [
  'Government',
  'Private',
  'NGO',
  'University',
];

export const FIELDS: readonly string[] = [
  'Engineering',
  'Medicine',
  'Science',
  'Commerce',
  'Arts & Humanities',
  'Law',
  'Design',
  'Agriculture',
];

export const DOC_TYPES: readonly DocType[] = [
  'Aadhaar',
  'Photo',
  'Marksheet',
  'Income Certificate',
  'Bonafide Certificate',
  'Bank Passbook',
  'Caste Certificate',
  'Recommendation Letter',
  'Statement of Purpose',
  'Disability Certificate',
];

export const INDIAN_STATES: readonly string[] = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu & Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

export const TRACKER_STATUSES: readonly TrackerStatus[] = [
  'saved',
  'preparing',
  'submitted',
  'won',
  'rejected',
];

export const STATUS_LABEL: Record<TrackerStatus, string> = {
  saved: 'Saved',
  preparing: 'Preparing',
  submitted: 'Submitted',
  won: 'Won',
  rejected: 'Not selected',
};
