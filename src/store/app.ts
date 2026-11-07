import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEMO_PROFILE, buildDemoSeed } from '@/data/demoProfile';
import type {
  DocType,
  StudentProfile,
  TrackerEntry,
  TrackerStatus,
  Vault,
  VaultEntry,
} from '@/types';

export const MAX_COMPARE = 3;

interface AppData {
  profile: StudentProfile | null;
  /** Scholarship id → tracker status. Absent = not tracked. */
  tracker: Record<string, TrackerEntry>;
  vault: Vault;
  /** Scholarship id → indices of completed roadmap steps. */
  checklist: Record<string, number[]>;
  /** Scholarship ids selected for side-by-side comparison (max 3). */
  compare: string[];
  /** True while the visitor is exploring with the sample student rather than their own profile. */
  isDemo: boolean;
  /** Scholarship id → remind this many days before the deadline. */
  reminders: Record<string, number>;
  /** Scholarship id → the student's own notes (contacts, login IDs, what's pending). */
  notes: Record<string, string>;
}

interface AppActions {
  setProfile: (profile: StudentProfile) => void;
  updateProfile: (patch: Partial<StudentProfile>) => void;

  /** Set a status, or pass null to stop tracking. */
  setStatus: (id: string, status: TrackerStatus | null) => void;
  /** Save ↔ unsave. Unsaving only removes items still in the "saved" column. Returns new saved state. */
  toggleSaved: (id: string) => boolean;

  toggleStep: (id: string, stepIndex: number) => void;

  setDoc: (doc: DocType, entry: VaultEntry) => void;
  toggleDoc: (doc: DocType) => void;

  /** Returns false if the compare tray is already full. */
  toggleCompare: (id: string) => boolean;
  clearCompare: () => void;

  /** Remind N days before the deadline, or null to turn the reminder off. */
  setReminder: (id: string, daysBefore: number | null) => void;
  setNote: (id: string, note: string) => void;
  /** Replace all data with a validated backup. Returns false if the file isn't a Grantly backup. */
  importData: (data: unknown) => boolean;

  /** Load the sample student plus a realistic tracker/vault state. */
  loadDemo: () => void;
  resetAll: () => void;
}

export type AppState = AppData & AppActions;

const initialData: AppData = {
  profile: null,
  tracker: {},
  vault: {},
  checklist: {},
  compare: [],
  isDemo: false,
  reminders: {},
  notes: {},
};

/** Three strong demo matches, so Compare has something to show straight away. */
const DEMO_REMINDERS: Record<string, number> = {
  'future-engineers-merit': 3,
  'jigyasa-summer-research': 1,
};
const DEMO_NOTES: Record<string, string> = {
  'future-engineers-merit':
    'Ask Prof. Iyer for the recommendation by Monday. Bonafide certificate: request at the college office (2 days).',
};

const DATA_KEYS = [
  'profile',
  'tracker',
  'vault',
  'checklist',
  'compare',
  'isDemo',
  'reminders',
  'notes',
] as const;

/** Only the persisted data fields of the store (no actions). */
export function pickData(s: AppData): AppData {
  return Object.fromEntries(DATA_KEYS.map((k) => [k, s[k]])) as unknown as AppData;
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * Validate an imported backup. Accepts the file written by "Export my data". Anything that
 * doesn't look like one is rejected rather than half-applied.
 */
export function parseBackup(data: unknown): AppData | null {
  if (!isRecord(data) || data.app !== 'grantly' || !isRecord(data.data)) return null;
  const d = data.data;
  if (d.profile !== null && !isRecord(d.profile)) return null;
  for (const k of ['tracker', 'vault', 'checklist', 'reminders', 'notes'] as const) {
    if (d[k] !== undefined && !isRecord(d[k])) return null;
  }
  if (d.compare !== undefined && !Array.isArray(d.compare)) return null;
  return {
    profile: (d.profile as AppData['profile']) ?? null,
    tracker: (d.tracker as AppData['tracker']) ?? {},
    vault: (d.vault as AppData['vault']) ?? {},
    checklist: (d.checklist as AppData['checklist']) ?? {},
    compare: ((d.compare as string[]) ?? [])
      .filter((x) => typeof x === 'string')
      .slice(0, MAX_COMPARE),
    isDemo: d.isDemo === true,
    reminders: (d.reminders as AppData['reminders']) ?? {},
    notes: (d.notes as AppData['notes']) ?? {},
  };
}

/** The JSON document written by "Export my data". */
export function buildBackup(s: AppData) {
  return { app: 'grantly', version: 3, exportedAt: new Date().toISOString(), data: pickData(s) };
}

export const DEMO_COMPARE = ['future-engineers-merit', 'shakti-women-stem', 'kaveri-state-merit'];
const STORAGE_KEY = 'grantly-data';

const now = () => new Date().toISOString();

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialData,

      // Saving a real profile ends demo mode.
      setProfile: (profile) => set({ profile, isDemo: false }),
      updateProfile: (patch) => {
        const current = get().profile;
        if (current) set({ profile: { ...current, ...patch } });
      },

      setStatus: (id, status) =>
        set((s) => {
          const tracker = { ...s.tracker };
          if (status === null) delete tracker[id];
          else tracker[id] = { status, updatedAt: now() };
          return { tracker };
        }),

      toggleSaved: (id) => {
        const entry = get().tracker[id];
        if (!entry) {
          get().setStatus(id, 'saved');
          return true;
        }
        if (entry.status === 'saved') {
          get().setStatus(id, null);
          return false;
        }
        return true; // Already further along — keep it tracked.
      },

      toggleStep: (id, stepIndex) =>
        set((s) => {
          const done = s.checklist[id] ?? [];
          const next = done.includes(stepIndex)
            ? done.filter((i) => i !== stepIndex)
            : [...done, stepIndex].sort((a, b) => a - b);
          // Starting the roadmap moves a saved (or untracked) scholarship into "Preparing".
          const entry = s.tracker[id];
          const tracker =
            next.length > 0 && (!entry || entry.status === 'saved')
              ? { ...s.tracker, [id]: { status: 'preparing' as const, updatedAt: now() } }
              : s.tracker;
          return { checklist: { ...s.checklist, [id]: next }, tracker };
        }),

      setDoc: (doc, entry) => set((s) => ({ vault: { ...s.vault, [doc]: entry } })),
      toggleDoc: (doc) =>
        set((s) => {
          const prev = s.vault[doc];
          return { vault: { ...s.vault, [doc]: { ...prev, has: !prev?.has } } };
        }),

      toggleCompare: (id) => {
        const { compare } = get();
        if (compare.includes(id)) {
          set({ compare: compare.filter((c) => c !== id) });
          return true;
        }
        if (compare.length >= MAX_COMPARE) return false;
        set({ compare: [...compare, id] });
        return true;
      },
      clearCompare: () => set({ compare: [] }),

      setReminder: (id, daysBefore) =>
        set((s) => {
          const reminders = { ...s.reminders };
          if (daysBefore === null) delete reminders[id];
          else reminders[id] = daysBefore;
          return { reminders };
        }),
      setNote: (id, note) =>
        set((s) => {
          const notes = { ...s.notes };
          if (note.trim() === '') delete notes[id];
          else notes[id] = note;
          return { notes };
        }),
      importData: (data) => {
        const parsed = parseBackup(data);
        if (!parsed) return false;
        set(parsed);
        return true;
      },

      loadDemo: () =>
        set({
          ...buildDemoSeed(),
          profile: DEMO_PROFILE,
          compare: DEMO_COMPARE,
          isDemo: true,
          reminders: DEMO_REMINDERS,
          notes: DEMO_NOTES,
        }),
      resetAll: () => set(initialData),
    }),
    {
      name: STORAGE_KEY,
      version: 3,
      // v1 had no isDemo flag: infer it from whether the saved profile is the sample student.
      migrate: (persisted, version) => {
        const state = persisted as AppData;
        if (version < 2) state.isDemo = state.profile?.name === DEMO_PROFILE.name;
        if (version < 3) {
          state.reminders ??= {};
          state.notes ??= {};
        }
        return state;
      },
      storage: createJSONStorage(() => localStorage),
      partialize: (s): AppData => pickData(s),
    },
  ),
);

/**
 * First visit only: open the app with the sample student loaded, so every screen shows
 * real features immediately. A banner makes it clear, and creating a profile replaces it.
 * Returning visitors (including anyone who reset their data) are left alone.
 */
export function seedDemoOnFirstVisit(): void {
  try {
    if (localStorage.getItem(STORAGE_KEY) === null) useAppStore.getState().loadDemo();
  } catch {
    // Storage blocked (private mode, sandbox): the app still works without persistence.
  }
}
