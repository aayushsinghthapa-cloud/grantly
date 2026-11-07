/**
 * The official challenge and how GRANTLY meets each requirement.
 * Single source for the landing page, the /requirements page and the command palette,
 * so the mapping shown to users is the same everywhere.
 */

export const TRACK_TITLE = 'GRANTLY: Unified Scholarship Discovery & Management Platform';

export const PROBLEM_STATEMENT =
  'Students struggle to find relevant scholarships, understand their options, navigate application processes, and keep track of important information. Build a modern digital experience that turns this complex journey into a seamless one.';

export interface Requirement {
  id: string;
  /** What the problem statement or rules ask for. */
  need: string;
  /** How GRANTLY answers it, in one sentence. */
  answer: string;
  /** The concrete features that deliver it. */
  features: string[];
  /** Where to try it in the live app. */
  links: { label: string; to: string }[];
}

export const REQUIREMENTS: Requirement[] = [
  {
    id: 'find',
    need: 'Find relevant scholarships',
    answer:
      'Every scholarship is scored against one student profile, so the relevant ones rise to the top.',
    features: [
      'Match score (0 to 100) on every scholarship, from education level, income, marks, gender, state, field and interests',
      'Fuzzy search plus 7 filters: category, level, provider, amount, deadline window, eligible only, hide closed',
      'Sort by best match, soonest deadline or highest amount',
      '4-step onboarding that ends with "We found N scholarships worth ₹X for you"',
      '⌘K / Ctrl+K command palette to jump to any scholarship',
    ],
    links: [
      { label: 'Discover', to: '/discover' },
      { label: 'Onboarding', to: '/onboarding' },
    ],
  },
  {
    id: 'understand',
    need: 'Understand their options',
    answer:
      'Each rule is checked against the student in plain words, and options can be compared side by side.',
    features: [
      '"Why you match": a tick or cross for every eligibility rule, with the reason ("Your family income ₹4.2L is under the ₹6L limit")',
      'Compare up to 3 scholarships: differences highlighted, best value marked',
      'Plain-language summaries, selection odds, renewability and glossary tooltips for jargon',
      'Similar scholarships on every page, eligible ones first',
    ],
    links: [
      { label: 'A scholarship', to: '/scholarship/future-engineers-merit' },
      { label: 'Compare', to: '/compare' },
    ],
  },
  {
    id: 'apply',
    need: 'Navigate application processes',
    answer:
      'Each scholarship comes with a step-by-step roadmap and a document checklist fed by one vault.',
    features: [
      'Application roadmap: 4 to 6 plain-language steps with saved progress; finishing them offers "Mark as submitted"',
      'Document readiness ("4 of 6 ready") computed live from the Document Vault',
      'Document Vault with expiry dates and notes; expired documents count as missing',
      '"Action needed" list for applications due this week that are not ready yet',
    ],
    links: [
      { label: 'Roadmap', to: '/scholarship/future-engineers-merit' },
      { label: 'Vault', to: '/vault' },
    ],
  },
  {
    id: 'track',
    need: 'Keep track of important information',
    answer: 'One tracker, one deadline radar, reminders and notes, all from the same profile.',
    features: [
      'Tracker board (Saved, Preparing, Submitted, Won, Not selected) with drag-and-drop and a keyboard menu',
      'Deadline Radar: next 60 days on a timeline or list, coloured by urgency',
      'Deadline reminders and a notification centre (plus optional browser notifications)',
      'Private notes on every scholarship, and calendar (.ics) export',
      'Funding Gap Meter: how much of the yearly cost is won, pending and still missing',
    ],
    links: [
      { label: 'Tracker', to: '/tracker' },
      { label: 'Dashboard', to: '/dashboard' },
    ],
  },
  {
    id: 'unified',
    need: 'A unified, seamless experience',
    answer: 'One profile drives every screen, and the whole journey lives in one app.',
    features: [
      'One eligibility profile, editable any time, updates every score and suggestion instantly',
      'Dashboard that brings funding, deadlines and next actions together',
      'Data export and import, so the student owns their information',
      'No account or sign-up needed, and nothing leaves the device',
    ],
    links: [
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'Profile', to: '/profile' },
    ],
  },
];

/** The hackathon's rules, and how this build satisfies each. */
export const RULES: { rule: string; how: string }[] = [
  { rule: 'Modern frontend framework', how: 'React 18, TypeScript (strict), Vite, Tailwind CSS' },
  {
    rule: 'Responsive across screen sizes',
    how: 'Checked at 360, 768, 1280 and 1536px; bottom tab bar and sheets on mobile',
  },
  {
    rule: 'Mock data and local storage allowed',
    how: '30 sample scholarships; everything persisted locally, with export/import',
  },
  {
    rule: 'Working deployment and public repository',
    how: 'Live on GitHub Pages; source on GitHub with CI on every push',
  },
];
