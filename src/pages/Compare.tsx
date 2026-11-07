import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Columns3, Plus, Trophy, X } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, EmptyState, Switch, buttonClasses } from '@/components/ui';
import { MatchRing } from '@/components/scholarship/MatchRing';
import { GlossaryTerm } from '@/components/scholarship/GlossaryTerm';
import { getScholarship } from '@/data/scholarships';
import { useAppStore, MAX_COMPARE } from '@/store/app';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { getMatch, type MatchResult } from '@/lib/match';
import { getReadiness, type Readiness } from '@/lib/readiness';
import { daysLeft, daysLeftLabel, formatDeadline } from '@/lib/deadline';
import { amountSuffix, formatINR, formatINRCompact } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { Scholarship } from '@/types';

interface Column {
  s: Scholarship;
  match: MatchResult | null;
  readiness: Readiness;
}

interface Row {
  label: ReactNode;
  /** Plain value used to detect differences between columns. */
  key: (c: Column) => string;
  render: (c: Column) => ReactNode;
  /** Numeric getter + direction to highlight the best column. */
  best?: { get: (c: Column) => number | null; prefer: 'max' | 'min' };
  needsProfile?: boolean;
}

const odds = (s: Scholarship) =>
  s.applicants && s.seats ? Math.max(1, Math.round(s.applicants / s.seats)) : null;

const ROWS: Row[] = [
  {
    label: 'Match score',
    needsProfile: true,
    key: (c) => String(c.match?.score),
    render: (c) => (c.match ? `${c.match.score}%` : '—'),
    best: { get: (c) => c.match?.score ?? null, prefer: 'max' },
  },
  {
    label: 'You’re eligible',
    needsProfile: true,
    key: (c) => String(c.match?.eligible),
    render: (c) =>
      c.match?.eligible ? (
        <span className="font-semibold text-success">Yes</span>
      ) : (
        <span className="font-semibold text-danger">Not yet</span>
      ),
  },
  {
    label: 'Award',
    key: (c) => String(c.s.amount),
    render: (c) => (
      <>
        <span className="tabular font-display text-lg font-semibold">{formatINR(c.s.amount)}</span>
        <span className="block text-xs text-muted">{amountSuffix(c.s.amountType)}</span>
      </>
    ),
    best: { get: (c) => c.s.amount, prefer: 'max' },
  },
  {
    label: 'Deadline',
    key: (c) => c.s.deadline,
    render: (c) => (
      <>
        {formatDeadline(c.s.deadline)}
        <span className="block text-xs text-muted">{daysLeftLabel(daysLeft(c.s.deadline))}</span>
      </>
    ),
  },
  {
    label: 'Provider',
    key: (c) => c.s.providerType,
    render: (c) => `${c.s.provider} (${c.s.providerType})`,
  },
  {
    label: 'Education level',
    key: (c) => c.s.eligibility.levels.join(),
    render: (c) => c.s.eligibility.levels.join(', '),
  },
  {
    label: 'Field of study',
    key: (c) => c.s.eligibility.fields?.join() ?? 'any',
    render: (c) => c.s.eligibility.fields?.join(', ') ?? 'Any field',
  },
  {
    label: 'Minimum marks',
    key: (c) => String(c.s.eligibility.minPercentage ?? 0),
    render: (c) => (c.s.eligibility.minPercentage ? `${c.s.eligibility.minPercentage}%` : 'None'),
  },
  {
    label: 'Family income limit',
    key: (c) => String(c.s.eligibility.maxFamilyIncome ?? 'none'),
    render: (c) =>
      c.s.eligibility.maxFamilyIncome
        ? `Up to ${formatINRCompact(c.s.eligibility.maxFamilyIncome)}`
        : 'No limit',
  },
  {
    label: 'Location',
    key: (c) => c.s.eligibility.states?.join() ?? 'all',
    render: (c) => (c.s.eligibility.states ? c.s.eligibility.states.join(', ') : 'All of India'),
  },
  {
    label: 'Gender',
    key: (c) => c.s.eligibility.gender ?? 'Any',
    render: (c) => (c.s.eligibility.gender === 'Female' ? 'Women only' : 'Everyone'),
  },
  {
    label: 'Documents',
    key: (c) => c.s.requiredDocuments.join(),
    render: (c) => (
      <>
        <span className="font-semibold">
          {c.readiness.ready.length} of {c.readiness.total} ready
        </span>
        <ul className="mt-1 space-y-0.5 text-xs">
          {c.s.requiredDocuments.map((d) => (
            <li key={d} className={c.readiness.ready.includes(d) ? 'text-success' : 'text-muted'}>
              {c.readiness.ready.includes(d) ? '✓' : '○'} {d}
              <span className="sr-only">
                {c.readiness.ready.includes(d) ? ' (ready)' : ' (missing)'}
              </span>
            </li>
          ))}
        </ul>
      </>
    ),
    best: { get: (c) => c.readiness.percent, prefer: 'max' },
  },
  {
    label: <GlossaryTerm term="Renewable" />,
    key: (c) => String(c.s.renewable),
    render: (c) => (c.s.renewable ? 'Yes, every year' : 'No'),
  },
  {
    label: 'Selection odds',
    key: (c) => String(odds(c.s)),
    render: (c) => (odds(c.s) ? `1 in ${odds(c.s)}` : 'Not published'),
    best: { get: (c) => odds(c.s), prefer: 'min' },
  },
  {
    label: 'Steps to apply',
    key: (c) => String(c.s.steps.length),
    render: (c) => `${c.s.steps.length} steps`,
    best: { get: (c) => c.s.steps.length, prefer: 'min' },
  },
];

/** Index of the single best column for a row, or null when tied / not comparable. */
function bestIndex(row: Row, cols: Column[]): number | null {
  if (!row.best || cols.length < 2) return null;
  const values = cols.map(row.best.get);
  const valid = values.filter((v): v is number => v !== null);
  if (valid.length < 2) return null;
  const target = row.best.prefer === 'max' ? Math.max(...valid) : Math.min(...valid);
  const winners = values.filter((v) => v === target).length;
  return winners === 1 ? values.indexOf(target) : null;
}

export default function ComparePage() {
  useDocumentTitle('Compare');
  const compare = useAppStore((s) => s.compare);
  const profile = useAppStore((s) => s.profile);
  const vault = useAppStore((s) => s.vault);
  const toggleCompare = useAppStore((s) => s.toggleCompare);
  const clearCompare = useAppStore((s) => s.clearCompare);
  const [diffOnly, setDiffOnly] = useState(false);

  const cols: Column[] = useMemo(
    () =>
      compare
        .map(getScholarship)
        .filter((s) => s !== undefined)
        .map((s) => ({
          s,
          match: profile ? getMatch(profile, s) : null,
          readiness: getReadiness(s, vault),
        })),
    [compare, profile, vault],
  );

  const rows = ROWS.filter((r) => !r.needsProfile || profile)
    .map((r) => ({ row: r, differs: new Set(cols.map(r.key)).size > 1 }))
    .filter(({ differs }) => !diffOnly || differs);

  if (cols.length === 0) {
    return (
      <div className="container-page pb-16">
        <PageHeader eyebrow="Compare" title="Compare side by side" />
        <EmptyState
          icon={<Columns3 className="h-6 w-6" />}
          title="Nothing to compare yet"
          description={`Tick “Compare” on up to ${MAX_COMPARE} scholarships in Discover to see them side by side, with differences highlighted.`}
          action={
            <Link to="/discover" className={buttonClasses('primary')}>
              Go to Discover
            </Link>
          }
        />
      </div>
    );
  }

  const emptySlots = MAX_COMPARE - cols.length;

  return (
    <div className="container-page pb-16">
      <PageHeader
        eyebrow="Compare"
        title="Compare side by side"
        description="Rows that differ are highlighted, and the strongest option in each row is marked."
        actions={
          <Button variant="ghost" size="sm" onClick={clearCompare}>
            Clear all
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <Switch
          label="Only show differences"
          checked={diffOnly}
          onChange={setDiffOnly}
          className="w-full max-w-xs"
        />
        {cols.length === 1 ? (
          <p className="text-sm text-muted">Add at least one more scholarship to compare.</p>
        ) : (
          <p className="text-sm text-muted md:hidden" aria-hidden>
            Swipe the table sideways to see all {cols.length} →
          </p>
        )}
      </div>

      {/* Focusable so keyboard users can scroll the table horizontally (WCAG 2.1.1). */}
      <div
        role="region"
        aria-label="Comparison table (scrolls sideways on small screens)"
        tabIndex={0}
        className="overflow-x-auto rounded-2xl border border-border bg-surface"
      >
        <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
          <caption className="sr-only">
            Side-by-side comparison of {cols.length} scholarships
          </caption>
          <thead>
            <tr className="border-b border-border">
              <th
                scope="col"
                className="sticky left-0 z-10 w-40 bg-surface p-4 align-bottom text-xs font-semibold uppercase tracking-wider text-muted"
              >
                Scholarship
              </th>
              {cols.map(({ s, match }) => (
                <th key={s.id} scope="col" className="min-w-[13rem] p-4 align-top font-normal">
                  <div className="flex items-start justify-between gap-2">
                    <MatchRing match={match} size={48} />
                    <button
                      type="button"
                      onClick={() => toggleCompare(s.id)}
                      aria-label={`Remove ${s.name} from comparison`}
                      className="rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-ink"
                    >
                      <X className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                  <Link
                    to={`/scholarship/${s.id}`}
                    className="mt-3 block font-display text-lg font-semibold leading-snug hover:underline"
                  >
                    {s.name}
                  </Link>
                </th>
              ))}
              {Array.from({ length: emptySlots }, (_, i) => (
                <td key={`empty-${i}`} className="min-w-[13rem] p-4 align-top">
                  <Link
                    to="/discover"
                    className="grid h-full min-h-28 place-items-center rounded-xl border-2 border-dashed border-border text-sm font-medium text-muted hover:border-primary hover:text-primary"
                  >
                    <span className="flex items-center gap-1.5">
                      <Plus className="h-4 w-4" aria-hidden /> Add a scholarship
                    </span>
                  </Link>
                </td>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ row, differs }, ri) => {
              const best = bestIndex(row, cols);
              return (
                <tr
                  key={ri}
                  className={cn(
                    'border-b border-border last:border-0',
                    differs && cols.length > 1 && 'bg-accent-soft/40',
                  )}
                >
                  <th
                    scope="row"
                    className={cn(
                      'sticky left-0 z-10 p-4 align-top font-medium',
                      differs && cols.length > 1 ? 'bg-accent-soft' : 'bg-surface',
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {differs && cols.length > 1 && (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                      )}
                      {row.label}
                    </span>
                    {differs && cols.length > 1 && <span className="sr-only"> (differs)</span>}
                  </th>
                  {cols.map((c, ci) => (
                    <td key={c.s.id} className="p-4 align-top">
                      <div className={cn(best === ci && '-m-2 rounded-xl bg-primary-soft p-2')}>
                        {row.render(c)}
                        {best === ci && (
                          <span className="mt-1 flex items-center gap-1 text-xs font-semibold text-primary">
                            <Trophy className="h-3 w-3" aria-hidden /> Best
                          </span>
                        )}
                      </div>
                    </td>
                  ))}
                  {Array.from({ length: emptySlots }, (_, i) => (
                    <td key={`e-${i}`} aria-hidden />
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && (
        <p className="mt-4 text-sm text-muted">
          These scholarships are identical on every row shown.
        </p>
      )}
    </div>
  );
}
