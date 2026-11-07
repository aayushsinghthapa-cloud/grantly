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
};

const now = () => new Date().toISOString();

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialData,

      setProfile: (profile) => set({ profile }),
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

      loadDemo: () => set({ ...buildDemoSeed(), profile: DEMO_PROFILE, compare: [] }),
      resetAll: () => set(initialData),
    }),
    {
      name: 'grantly-data',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ profile, tracker, vault, checklist, compare }): AppData => ({
        profile,
        tracker,
        vault,
        checklist,
        compare,
      }),
    },
  ),
);
