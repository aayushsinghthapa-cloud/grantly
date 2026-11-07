import { useMemo } from 'react';
import { SCHOLARSHIPS, SCHOLARSHIPS_BY_ID } from '@/data/scholarships';
import { getMatch, type MatchResult, type ScholarshipWithMatch } from '@/lib/match';
import { getReadiness, type Readiness } from '@/lib/readiness';
import { computeFunding, suggestGapClosers } from '@/lib/funding';
import { useAppStore } from '@/store/app';
import type { Scholarship } from '@/types';

export type { ScholarshipWithMatch };

/** Every scholarship paired with its match result for the current profile. Recomputed only when the profile changes. */
export function useMatches(): ScholarshipWithMatch[] {
  const profile = useAppStore((s) => s.profile);
  return useMemo(
    () =>
      SCHOLARSHIPS.map((scholarship) => ({
        scholarship,
        match: profile ? getMatch(profile, scholarship) : null,
      })),
    [profile],
  );
}

export function useMatch(scholarship: Scholarship | undefined): MatchResult | null {
  const profile = useAppStore((s) => s.profile);
  return useMemo(
    () => (profile && scholarship ? getMatch(profile, scholarship) : null),
    [profile, scholarship],
  );
}

export function useReadiness(scholarship: Scholarship | undefined): Readiness | null {
  const vault = useAppStore((s) => s.vault);
  return useMemo(
    () => (scholarship ? getReadiness(scholarship, vault) : null),
    [scholarship, vault],
  );
}

/** Funding Gap Meter data + "close your gap" suggestions. */
export function useFunding() {
  const profile = useAppStore((s) => s.profile);
  const tracker = useAppStore((s) => s.tracker);
  return useMemo(() => {
    if (!profile) return null;
    const summary = computeFunding(profile.annualCost, tracker, SCHOLARSHIPS_BY_ID);
    const suggestions = suggestGapClosers(profile, SCHOLARSHIPS, tracker, summary.gap);
    return { summary, suggestions };
  }, [profile, tracker]);
}
