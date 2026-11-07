import { isBefore, parseISO, startOfDay } from 'date-fns';
import type { DocType, Scholarship, Vault } from '@/types';

export interface Readiness {
  ready: DocType[];
  missing: DocType[];
  /** Marked as owned but past the expiry date — counted as missing too. */
  expired: DocType[];
  total: number;
  /** 0–100 */
  percent: number;
  complete: boolean;
}

export function isDocReady(vault: Vault, doc: DocType, now: Date = new Date()): boolean {
  const entry = vault[doc];
  if (!entry?.has) return false;
  if (entry.expiry && isBefore(parseISO(entry.expiry), startOfDay(now))) return false;
  return true;
}

/** How many of a scholarship's required documents the student already has in their Vault. */
export function getReadiness(
  scholarship: Pick<Scholarship, 'requiredDocuments'>,
  vault: Vault,
  now: Date = new Date(),
): Readiness {
  const ready: DocType[] = [];
  const missing: DocType[] = [];
  const expired: DocType[] = [];

  for (const doc of scholarship.requiredDocuments) {
    if (isDocReady(vault, doc, now)) ready.push(doc);
    else {
      missing.push(doc);
      if (vault[doc]?.has) expired.push(doc);
    }
  }

  const total = scholarship.requiredDocuments.length;
  const percent = total === 0 ? 100 : Math.round((ready.length / total) * 100);
  return { ready, missing, expired, total, percent, complete: missing.length === 0 };
}
