import { useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, CircleDashed, FileText } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge, Card, Input, ProgressRing, Switch } from '@/components/ui';
import { GlossaryTerm } from '@/components/scholarship/GlossaryTerm';
import { DOC_TYPES } from '@/data/constants';
import { DOC_HINTS } from '@/data/glossary';
import { getScholarship } from '@/data/scholarships';
import { useAppStore } from '@/store/app';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { docAnchor, isDocReady } from '@/lib/readiness';
import { cn } from '@/lib/cn';
import type { DocType, Scholarship } from '@/types';

export default function VaultPage() {
  useDocumentTitle('Document vault');
  const vault = useAppStore((s) => s.vault);
  const tracker = useAppStore((s) => s.tracker);
  const setDoc = useAppStore((s) => s.setDoc);
  const { hash } = useLocation();

  // Scholarships still in play (not won/rejected) → which of them need each document.
  const neededBy = useMemo(() => {
    const map = new Map<DocType, Scholarship[]>();
    for (const [id, entry] of Object.entries(tracker)) {
      if (entry.status === 'won' || entry.status === 'rejected') continue;
      const s = getScholarship(id);
      if (!s) continue;
      for (const doc of s.requiredDocuments) map.set(doc, [...(map.get(doc) ?? []), s]);
    }
    return map;
  }, [tracker]);

  const readyCount = DOC_TYPES.filter((d) => isDocReady(vault, d)).length;
  const blockers = DOC_TYPES.filter(
    (d) => !isDocReady(vault, d) && (neededBy.get(d)?.length ?? 0) > 0,
  ).sort((a, b) => neededBy.get(b)!.length - neededBy.get(a)!.length);

  // Deep links like /vault#doc-income-certificate scroll to and focus that document.
  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(hash.slice(1));
    el?.scrollIntoView({ block: 'center' });
    el?.focus({ preventScroll: true });
  }, [hash]);

  return (
    <div className="container-page pb-16">
      <PageHeader
        eyebrow="Document vault"
        title="Your documents, ready once"
        description="Mark what you already have. Every scholarship’s readiness updates instantly — no uploads, nothing leaves your device."
      />

      <Card className="grid grid-cols-1 gap-6 p-5 sm:p-6 md:grid-cols-[auto_minmax(0,1fr)] md:items-center">
        <div className="flex items-center gap-4">
          <ProgressRing
            value={(readyCount / DOC_TYPES.length) * 100}
            size={80}
            stroke={7}
            tone="primary"
            showValue={false}
            label={`${readyCount} of ${DOC_TYPES.length} documents ready`}
          />
          <div>
            <p className="tabular font-display text-3xl font-semibold">
              {readyCount}
              <span className="text-lg text-muted"> / {DOC_TYPES.length}</span>
            </p>
            <p className="text-sm text-muted">documents ready</p>
          </div>
        </div>
        <div className="md:border-l md:border-border md:pl-6">
          <h2 className="text-lg font-semibold">What’s holding you back</h2>
          {blockers.length === 0 ? (
            <p className="mt-1 text-sm text-muted">
              {neededBy.size === 0 ? (
                <>
                  Save a few scholarships from{' '}
                  <Link to="/discover" className="font-semibold text-primary hover:underline">
                    Discover
                  </Link>{' '}
                  and we’ll tell you which documents to prioritise.
                </>
              ) : (
                'Nothing! You have every document your tracked scholarships need.'
              )}
            </p>
          ) : (
            <ul className="mt-2 flex flex-wrap gap-2">
              {blockers.map((d) => (
                <li key={d}>
                  <a
                    href={`#${docAnchor(d)}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-sm hover:border-primary"
                  >
                    {d}
                    <span className="tabular rounded-full bg-danger-soft px-1.5 text-xs font-semibold text-danger">
                      {neededBy.get(d)!.length}
                    </span>
                    <span className="sr-only">tracked scholarships need this</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      <ul className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {DOC_TYPES.map((doc) => {
          const entry = vault[doc];
          const ready = isDocReady(vault, doc);
          const expired = Boolean(entry?.has) && !ready;
          const needs = neededBy.get(doc) ?? [];
          const headingId = `${docAnchor(doc)}-title`;
          return (
            <li key={doc}>
              <Card
                as="article"
                id={docAnchor(doc)}
                tabIndex={-1}
                aria-labelledby={headingId}
                className={cn(
                  'flex h-full flex-col p-5 outline-none focus:ring-2 focus:ring-primary',
                  expired && 'border-danger/50',
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={cn(
                        'grid h-10 w-10 shrink-0 place-items-center rounded-xl',
                        ready
                          ? 'bg-success-soft text-success'
                          : expired
                            ? 'bg-danger-soft text-danger'
                            : 'bg-surface-2 text-muted',
                      )}
                      aria-hidden
                    >
                      <FileText className="h-5 w-5" />
                    </span>
                    <h2
                      id={headingId}
                      className="font-sans text-base font-semibold tracking-normal"
                    >
                      <GlossaryTerm term={doc} />
                    </h2>
                  </div>
                  {ready ? (
                    <Badge tone="success">
                      <CheckCircle2 className="h-3 w-3" aria-hidden /> Ready
                    </Badge>
                  ) : expired ? (
                    <Badge tone="danger">
                      <AlertTriangle className="h-3 w-3" aria-hidden /> Expired
                    </Badge>
                  ) : (
                    <Badge>
                      <CircleDashed className="h-3 w-3" aria-hidden /> Missing
                    </Badge>
                  )}
                </div>

                <p className="mt-3 text-sm text-muted">{DOC_HINTS[doc]}</p>
                {needs.length > 0 && (
                  <p className="mt-2 text-xs font-medium text-ink">
                    Needed for {needs.length} tracked scholarship{needs.length === 1 ? '' : 's'}
                  </p>
                )}

                <div className="mt-auto space-y-3 border-t border-border pt-4 [&:not(:first-child)]:mt-4">
                  <Switch
                    label="I have this"
                    checked={Boolean(entry?.has)}
                    onChange={(has) => setDoc(doc, { ...entry, has })}
                  />
                  {entry?.has && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Input
                        label="Valid until"
                        type="date"
                        value={entry.expiry ?? ''}
                        onChange={(e) =>
                          setDoc(doc, { ...entry, expiry: e.target.value || undefined })
                        }
                        error={expired ? 'This date has passed — renew it.' : undefined}
                        className="h-10 text-sm"
                      />
                      <Input
                        label="Note"
                        placeholder="e.g. attested copy"
                        value={entry.note ?? ''}
                        onChange={(e) =>
                          setDoc(doc, { ...entry, note: e.target.value || undefined })
                        }
                        className="h-10 text-sm"
                      />
                    </div>
                  )}
                </div>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
