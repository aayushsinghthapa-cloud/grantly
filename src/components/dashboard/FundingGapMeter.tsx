import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bookmark, Check, Pencil, PiggyBank, Sparkles } from 'lucide-react';
import { Button, Card, CountUp, Input } from '@/components/ui';
import { MatchRing } from '@/components/scholarship/MatchRing';
import { UrgencyChip } from '@/components/scholarship/UrgencyChip';
import { useFunding } from '@/hooks/useMatches';
import { useAppStore } from '@/store/app';
import { toast } from '@/store/toast';
import { formatINR, formatINRCompact } from '@/lib/format';
import type { FundingSegmentKey } from '@/lib/funding';
import { cn } from '@/lib/cn';

const SEGMENT_META: Record<
  FundingSegmentKey,
  { label: string; bar: string; dot: string; hint: string }
> = {
  won: { label: 'Won', bar: 'bg-primary', dot: 'bg-primary', hint: 'Money confirmed' },
  submitted: {
    label: 'Submitted',
    bar: 'bg-primary/55',
    dot: 'bg-primary/55',
    hint: 'Awaiting a result',
  },
  preparing: {
    label: 'Preparing',
    bar: 'bg-accent',
    dot: 'bg-accent',
    hint: 'You’re working on these',
  },
  saved: {
    label: 'Saved',
    bar: '',
    dot: 'border-2 border-accent/60',
    hint: 'Not started, not counted',
  },
  gap: {
    label: 'Gap',
    bar: 'bg-transparent',
    dot: 'border border-dashed border-muted',
    hint: 'Still to find',
  },
};

/**
 * Signature feature: how much of the student's annual cost their scholarships could cover,
 * as an animated stacked bar, plus greedy suggestions that would close the remaining gap.
 */
export function FundingGapMeter() {
  const data = useFunding();
  const profile = useAppStore((s) => s.profile);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const setStatus = useAppStore((s) => s.setStatus);
  const [editing, setEditing] = useState(false);
  const [costDraft, setCostDraft] = useState('');
  const costRef = useRef<HTMLInputElement>(null);

  // Move focus into the field when the inline editor opens (instead of autoFocus).
  useEffect(() => {
    if (editing) costRef.current?.select();
  }, [editing]);

  if (!data || !profile) return null;
  const { summary: f, suggestions } = data;
  const inPlay = Math.min(f.potential, f.annualCost);
  const coveredPct = f.annualCost ? Math.round((inPlay / f.annualCost) * 100) : 0;
  const suggestedTotal = suggestions.at(-1)?.cumulative ?? 0;

  const description = `${formatINR(inPlay)} of your ${formatINR(f.annualCost)} yearly cost could be covered (${coveredPct}%). ${
    f.gap > 0 ? `Remaining gap: ${formatINR(f.gap)}.` : 'Your costs are fully covered.'
  } Won ${formatINR(f.won)}, submitted ${formatINR(f.submitted)}, preparing ${formatINR(f.preparing)}, saved ${formatINR(f.saved)}.`;

  const saveCost = () => {
    const n = Number(costDraft);
    if (!Number.isFinite(n) || n <= 0) {
      toast({ title: 'Enter a cost above ₹0', tone: 'danger' });
      return;
    }
    updateProfile({ annualCost: n });
    setEditing(false);
    toast({ title: 'Annual cost updated', description: formatINR(n), tone: 'success' });
  };

  return (
    <Card as="section" aria-labelledby="gap-heading" className="overflow-hidden">
      <div className="p-5 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2
              id="gap-heading"
              className="flex items-center gap-2 text-[15px] font-semibold text-muted"
            >
              <PiggyBank className="h-4 w-4 text-accent" aria-hidden /> Funding gap
            </h2>
            <p className="mt-3 font-display text-3xl font-semibold leading-tight sm:text-5xl">
              <CountUp
                value={inPlay}
                format={(n) => formatINRCompact(Math.round(n / 1000) * 1000)}
                className="tabular"
              />
              <span className="text-muted"> of </span>
              <span className="tabular">{formatINRCompact(f.annualCost)}</span>
              <span className="block text-xl font-normal text-muted sm:inline sm:text-3xl">
                {' '}
                could be covered
              </span>
            </p>
          </div>
          <div className="text-right">
            {f.gap > 0 ? (
              <p className="rounded-2xl bg-accent-soft px-4 py-3">
                <span className="block text-[13px] font-medium text-muted">Gap</span>
                <span className="tabular font-display text-3xl font-semibold">
                  {formatINRCompact(f.gap)}
                </span>
              </p>
            ) : (
              <p className="flex items-center gap-2 rounded-2xl bg-success-soft px-4 py-3 font-semibold text-success">
                <Check className="h-5 w-5" aria-hidden /> Fully covered
              </p>
            )}
          </div>
        </div>

        {/* Stacked bar — decorative for AT; the description and legend carry the data. */}
        <div className="mt-6" role="img" aria-label={description}>
          <div
            className="flex h-5 overflow-hidden rounded-full border border-dashed border-muted/50 bg-surface-2"
            aria-hidden
          >
            {f.segments
              // Saved money isn't in play, so only won/submitted/preparing fill the bar; the rest reads as gap.
              .filter((s) => s.key === 'won' || s.key === 'submitted' || s.key === 'preparing')
              .map((s, i) => (
                <motion.div
                  key={s.key}
                  className={cn(
                    'h-full',
                    SEGMENT_META[s.key].bar,
                    i > 0 && 'border-l-2 border-surface',
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${s.percent}%` }}
                  transition={{ duration: 0.9, delay: 0.15 * i, ease: [0.22, 1, 0.36, 1] }}
                  style={{ borderLeftWidth: s.percent === 0 ? 0 : undefined }}
                />
              ))}
          </div>
          <div className="mt-1.5 flex justify-between text-xs text-muted" aria-hidden>
            <span>₹0</span>
            <span className="tabular">{formatINRCompact(f.annualCost)} / year</span>
          </div>
        </div>

        <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-5">
          {f.segments.map((s) => {
            const meta = SEGMENT_META[s.key];
            return (
              <li key={s.key} className="min-w-0">
                <span className="flex items-center gap-1.5 text-xs font-medium text-muted">
                  <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', meta.dot)} aria-hidden />
                  {meta.label}
                  {s.count > 0 && <span className="tabular">· {s.count}</span>}
                </span>
                <span className="tabular block font-semibold">{formatINR(s.amount)}</span>
                <span className="block text-xs text-muted">{meta.hint}</span>
              </li>
            );
          })}
        </ul>

        <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-muted">
          {editing ? (
            <form
              className="flex flex-wrap items-end gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                saveCost();
              }}
            >
              <Input
                label="Yearly cost of study (₹)"
                type="number"
                inputMode="numeric"
                min={1}
                step={10000}
                value={costDraft}
                onChange={(e) => setCostDraft(e.target.value)}
                ref={costRef}
                className="h-9 w-40"
              />
              <Button type="submit" size="sm">
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </form>
          ) : (
            <>
              Based on a yearly cost of{' '}
              <strong className="tabular text-ink">{formatINR(f.annualCost)}</strong>.
              <button
                type="button"
                onClick={() => {
                  setCostDraft(String(f.annualCost));
                  setEditing(true);
                }}
                className="inline-flex items-center gap-1 rounded-md font-semibold text-primary hover:underline"
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden /> Edit
              </button>
            </>
          )}
        </div>
      </div>

      {f.gap > 0 && (
        <div className="border-t border-border bg-surface-2/60 p-5 sm:p-8">
          <h3 className="flex items-center gap-2 text-xl font-semibold">
            <Sparkles className="h-5 w-5 text-accent" aria-hidden /> Close your gap
          </h3>
          {suggestions.length === 0 ? (
            <p className="mt-2 text-sm text-muted">
              No more open scholarships match your profile right now.{' '}
              <Link to="/discover" className="font-semibold text-primary hover:underline">
                Browse near-misses
              </Link>
              . Some only miss by a few marks.
            </p>
          ) : (
            <>
              <p className="mt-1 text-sm text-muted">
                {suggestedTotal >= f.gap
                  ? 'Applying to these could close your entire gap'
                  : 'These would shrink your gap the most'}
                , worth <strong className="tabular text-ink">{formatINR(suggestedTotal)}</strong>{' '}
                together.
              </p>
              <ul className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                {suggestions.map(({ scholarship: s, score }) => (
                  <li
                    key={s.id}
                    className="flex flex-col rounded-2xl border border-border bg-surface p-4"
                  >
                    <div className="flex items-start gap-3">
                      <MatchRing match={{ score, eligible: true, criteria: [] }} size={44} />
                      <div className="min-w-0">
                        <Link
                          to={`/scholarship/${s.id}`}
                          className="font-semibold leading-snug hover:underline"
                        >
                          {s.name}
                        </Link>
                        <p className="tabular text-sm text-muted">{formatINR(s.amount)}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2 pt-1">
                      <UrgencyChip deadline={s.deadline} />
                      <Button
                        size="sm"
                        variant="secondary"
                        leftIcon={<Bookmark className="h-4 w-4" aria-hidden />}
                        onClick={() => {
                          // Saving alone isn't "in play", so start it straight away in Preparing.
                          setStatus(s.id, 'preparing');
                          toast({
                            title: 'Added to Preparing',
                            description: `${s.name} now counts towards your gap.`,
                            tone: 'success',
                          });
                        }}
                      >
                        Start<span className="sr-only"> applying to {s.name}</span>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </Card>
  );
}
