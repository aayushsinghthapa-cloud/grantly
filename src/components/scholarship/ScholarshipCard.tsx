import { memo, useId } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { Badge } from '@/components/ui';
import { MatchRing } from './MatchRing';
import { UrgencyChip } from './UrgencyChip';
import { useAppStore } from '@/store/app';
import { toast } from '@/store/toast';
import { STATUS_LABEL } from '@/data/constants';
import { amountSuffix, formatINR } from '@/lib/format';
import type { ScholarshipWithMatch } from '@/lib/match';
import { cn } from '@/lib/cn';

/**
 * Discover card. The title link is stretched over the whole card (after:inset-0) so the card is
 * one big click target, while Save / Compare sit above it (relative z-10) as separate controls.
 */
export const ScholarshipCard = memo(function ScholarshipCard({
  scholarship: s,
  match,
}: ScholarshipWithMatch) {
  const titleId = useId();
  const entry = useAppStore((st) => st.tracker[s.id]);
  const inCompare = useAppStore((st) => st.compare.includes(s.id));
  const toggleSaved = useAppStore((st) => st.toggleSaved);
  const toggleCompare = useAppStore((st) => st.toggleCompare);

  const onSave = () => {
    if (entry && entry.status !== 'saved') {
      toast({
        title: `Already in your tracker`,
        description: `Status: ${STATUS_LABEL[entry.status]}`,
      });
      return;
    }
    const saved = toggleSaved(s.id);
    toast({
      title: saved ? 'Saved to your tracker' : 'Removed from saved',
      description: s.name,
      tone: saved ? 'success' : 'default',
    });
  };

  const onCompare = () => {
    if (!toggleCompare(s.id))
      toast({
        title: 'Compare is full',
        description: 'You can compare up to 3 scholarships.',
        tone: 'danger',
      });
  };

  const tracked = Boolean(entry);
  const ineligible = match && !match.eligible;

  return (
    <article
      aria-labelledby={titleId}
      className={cn(
        'group relative flex h-full flex-col rounded-2xl bg-surface p-5 shadow-soft ring-1 ring-border/70 transition-[transform,box-shadow] duration-300 ease-apple',
        'focus-within:shadow-lift hover:-translate-y-0.5 hover:shadow-lift',
        inCompare && 'ring-2 ring-primary',
      )}
    >
      <div className="flex items-start gap-4">
        <MatchRing match={match} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-muted">
            {s.provider} · {s.providerType}
          </p>
          <h3 id={titleId} className="mt-1 font-display text-lg font-semibold leading-snug">
            <Link
              to={`/scholarship/${s.id}`}
              className="rounded-sm after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:ring-0 focus-visible:after:ring-2 focus-visible:after:ring-primary"
            >
              {s.name}
            </Link>
          </h3>
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-muted">{s.summary}</p>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-2">
        <p>
          <span className="tabular font-display text-2xl font-semibold">{formatINR(s.amount)}</span>{' '}
          <span className="text-xs text-muted">{amountSuffix(s.amountType)}</span>
        </p>
        <UrgencyChip deadline={s.deadline} />
      </div>

      <div className="mb-4 mt-3 flex flex-wrap gap-1.5">
        {ineligible && <Badge tone="danger">Not eligible</Badge>}
        {s.categories.slice(0, 2).map((c) => (
          <Badge key={c} tone="primary">
            {c}
          </Badge>
        ))}
        {entry && entry.status !== 'saved' && (
          <Badge tone="accent">{STATUS_LABEL[entry.status]}</Badge>
        )}
      </div>

      <div className="relative z-10 mt-auto flex items-center justify-between gap-2 border-t border-border pt-4">
        <button
          type="button"
          onClick={onSave}
          aria-pressed={tracked}
          aria-label={`${tracked ? 'Saved' : 'Save'}: ${s.name}`}
          className={cn(
            'inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium transition-colors',
            tracked ? 'text-primary hover:bg-primary-soft' : 'text-ink hover:bg-surface-2',
          )}
        >
          {tracked ? (
            <BookmarkCheck className="h-4 w-4" aria-hidden />
          ) : (
            <Bookmark className="h-4 w-4" aria-hidden />
          )}
          {tracked ? 'Saved' : 'Save'}
        </button>
        <label className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-lg px-2.5 text-sm font-medium hover:bg-surface-2">
          <input
            type="checkbox"
            checked={inCompare}
            onChange={onCompare}
            className="h-4 w-4 rounded border-border accent-[rgb(var(--primary))]"
          />
          Compare
          <span className="sr-only">{s.name}</span>
        </label>
      </div>
    </article>
  );
});
