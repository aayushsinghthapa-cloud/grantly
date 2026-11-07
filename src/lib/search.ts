import Fuse from 'fuse.js';
import type { Scholarship } from '@/types';

/**
 * Build a fuzzy search over scholarships once; returns a function that maps a query
 * to the set of matching ids (or null when the query is empty = no filtering).
 */
export function createScholarshipSearch(list: readonly Scholarship[]) {
  const fuse = new Fuse(list, {
    keys: [
      { name: 'name', weight: 3 },
      { name: 'provider', weight: 2 },
      { name: 'categories', weight: 2 },
      { name: 'eligibility.fields', weight: 1.5 },
      { name: 'summary', weight: 1 },
      { name: 'providerType', weight: 1 },
    ],
    threshold: 0.35,
    ignoreLocation: true,
  });
  return (query: string): Set<string> | null => {
    const q = query.trim();
    if (!q) return null;
    return new Set(fuse.search(q).map((r) => r.item.id));
  };
}
