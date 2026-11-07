import { describe, expect, it } from 'vitest';
import { getReadiness } from './readiness';

describe('getReadiness', () => {
  const s = { requiredDocuments: ['Aadhaar', 'Marksheet', 'Income Certificate', 'Photo'] as const };
  const now = new Date('2026-06-01');

  it('splits required documents into ready and missing', () => {
    const r = getReadiness(
      { requiredDocuments: [...s.requiredDocuments] },
      { Aadhaar: { has: true }, Photo: { has: true }, Marksheet: { has: false } },
      now,
    );
    expect(r.ready).toEqual(['Aadhaar', 'Photo']);
    expect(r.missing).toEqual(['Marksheet', 'Income Certificate']);
    expect(r.percent).toBe(50);
    expect(r.complete).toBe(false);
  });

  it('treats an expired document as missing and flags it', () => {
    const r = getReadiness(
      { requiredDocuments: ['Income Certificate'] },
      { 'Income Certificate': { has: true, expiry: '2026-03-31' } },
      now,
    );
    expect(r.ready).toEqual([]);
    expect(r.expired).toEqual(['Income Certificate']);
  });

  it('is complete when nothing is required', () => {
    expect(getReadiness({ requiredDocuments: [] }, {}, now)).toMatchObject({
      percent: 100,
      complete: true,
    });
  });
});
