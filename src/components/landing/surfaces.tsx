import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { Check, Clock } from 'lucide-react';
import { ProgressRing } from '@/components/ui';
import { SCHOLARSHIPS_BY_ID } from '@/data/scholarships';
import { DEMO_PROFILE } from '@/data/demoProfile';
import { STATUS_LABEL } from '@/data/constants';
import { computeFunding, type FundingSegmentKey } from '@/lib/funding';
import { SEASON_IDS, seasonTracker } from '@/lib/season';
import { daysLeft, daysLeftLabel, urgencyFor } from '@/lib/deadline';
import { formatINR, formatINRCompact } from '@/lib/format';
import type { MatchResult } from '@/lib/match';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/cn';
import type { Scholarship, TrackerStatus } from '@/types';

/*
 * Live surfaces for the landing page. Each one is real product markup computing its state
 * from the labelled sample student, never a painted mock: numbers come from the same
 * computeFunding / getMatch / getReadiness functions the app uses.
 */

const EASE = [0.23, 1, 0.32, 1] as const;

/** A rupee figure that glides between values (jumps straight there under reduced motion). */
export function AnimatedINR({
  value,
  compact,
  className,
}: {
  value: number;
  compact?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(value);
  const text = useTransform(mv, (v) =>
    compact ? formatINRCompact(Math.round(v / 1000) * 1000) : formatINR(Math.round(v)),
  );
  useEffect(() => {
    if (reduce) {
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, { duration: 0.7, ease: EASE });
    return () => controls.stop();
  }, [value, reduce, mv]);
  return <motion.span className={cn('tabular', className)}>{text}</motion.span>;
}

const SEG_STYLE: Partial<Record<FundingSegmentKey, string>> = {
  won: 'bg-primary',
  submitted: 'bg-primary/50',
  preparing: 'bg-accent',
};

/**
 * The stacked funding bar. Segments are full-width layers moved with transforms only
 * (translateX + scaleX from the left edge), never width, so changes stay on the compositor.
 */
export function FundingBar({ step, className }: { step: number; className?: string }) {
  const f = computeFunding(DEMO_PROFILE.annualCost, seasonTracker(step), SCHOLARSHIPS_BY_ID);
  let offset = 0;
  return (
    <div
      className={cn(
        'relative h-3 overflow-hidden rounded-full bg-surface-2 ring-1 ring-inset ring-border',
        className,
      )}
      aria-hidden
    >
      {f.segments
        .filter((s) => s.key in SEG_STYLE)
        .map((s) => {
          const style = { transform: `translateX(${offset}%) scaleX(${s.percent / 100})` };
          offset += s.percent;
          return (
            <span
              key={s.key}
              className={cn(
                'absolute inset-0 origin-left transition-transform duration-700 ease-apple motion-reduce:transition-none',
                SEG_STYLE[s.key],
              )}
              style={style}
            />
          );
        })}
    </div>
  );
}

const PILL: Record<TrackerStatus, string> = {
  saved: 'bg-surface-2 text-muted',
  preparing: 'bg-accent-soft text-ink',
  submitted: 'bg-primary-soft text-primary',
  won: 'bg-primary text-primary-fg',
  rejected: 'bg-danger-soft text-danger',
};

/** The funding panel in a given season step: headline figure, bar and (optionally) the four applications. */
export function GapPanel({
  step,
  showList = true,
  className,
}: {
  step: number;
  showList?: boolean;
  className?: string;
}) {
  const tracker = seasonTracker(step);
  const f = computeFunding(DEMO_PROFILE.annualCost, tracker, SCHOLARSHIPS_BY_ID);
  const inPlay = Math.min(f.potential, f.annualCost);
  const closed = f.gap === 0;
  return (
    <div
      className={cn(
        'rounded-3xl bg-surface p-5 shadow-lift ring-1 ring-border/70 sm:p-7',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[13px] font-medium text-muted">Funding gap · sample student</p>
          <p className="mt-1 text-2xl font-semibold leading-tight tracking-[-0.03em] sm:text-4xl">
            <AnimatedINR value={inPlay} compact />{' '}
            <span className="text-muted">of {formatINRCompact(f.annualCost)}</span>
          </p>
        </div>
        <div
          className={cn(
            'rounded-2xl px-3.5 py-2 text-right transition-colors duration-500',
            closed ? 'bg-primary-soft text-primary' : 'bg-surface-2',
          )}
        >
          <p className="text-[11px] font-medium text-muted">{closed ? 'Covered' : 'Gap'}</p>
          <p className="text-lg font-semibold">
            {closed ? (
              <Check className="ml-auto h-6 w-6" aria-label="Gap closed" />
            ) : (
              <AnimatedINR value={f.gap} compact />
            )}
          </p>
        </div>
      </div>
      <FundingBar step={step} className="mt-5" />
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted" aria-hidden>
        <li className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-primary" /> Won{' '}
          <AnimatedINR value={f.won} compact className="text-ink" />
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-primary/50" /> Submitted{' '}
          <AnimatedINR value={f.submitted} compact className="text-ink" />
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-accent" /> Preparing{' '}
          <AnimatedINR value={f.preparing} compact className="text-ink" />
        </li>
      </ul>
      {showList && (
        <ul className="mt-5 divide-y divide-border border-t border-border">
          {SEASON_IDS.map((id) => {
            const s = SCHOLARSHIPS_BY_ID.get(id)!;
            const status = tracker[id].status;
            return (
              <li key={id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span className="min-w-0">
                  <span className="block truncate font-medium">{s.name}</span>
                  <span className="tabular text-xs text-muted">{formatINR(s.amount)}</span>
                </span>
                <motion.span
                  key={status}
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.28, ease: EASE }}
                  className={cn(
                    'shrink-0 rounded-full px-2.5 py-1 text-xs font-medium',
                    PILL[status],
                  )}
                >
                  {STATUS_LABEL[status]}
                </motion.span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** Compact, real match row: ring, name, amount, deadline. Links to the scholarship. */
export function MatchMini({
  scholarship: s,
  match,
  className,
  linked = true,
  minimal = false,
}: {
  scholarship: Scholarship;
  match: MatchResult;
  className?: string;
  linked?: boolean;
  /** Ring and name only: for background planes, where a half-hidden footer reads as a glitch. */
  minimal?: boolean;
}) {
  const days = daysLeft(s.deadline);
  const urgent = urgencyFor(days) === 'urgent';
  const Title = linked ? Link : 'span';
  return (
    <div
      className={cn(
        'flex h-full flex-col rounded-3xl bg-surface p-5 shadow-soft ring-1 ring-border/70',
        className,
      )}
    >
      <div className="flex items-start gap-3.5">
        <ProgressRing value={match.score} size={48} stroke={4.5} label={`${match.score}% match`} />
        <div className="min-w-0">
          {!minimal && <p className="truncate text-xs text-muted">{s.provider}</p>}
          <Title
            to={`/scholarship/${s.id}`}
            className={cn('mt-0.5 block font-semibold leading-snug', linked && 'hover:underline')}
          >
            {s.name}
          </Title>
        </div>
      </div>
      {!minimal && (
        <div className="mt-auto flex items-end justify-between gap-2 pt-5">
          <p className="tabular text-xl font-semibold tracking-[-0.02em]">{formatINR(s.amount)}</p>
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
              urgent ? 'bg-danger-soft text-danger' : 'bg-surface-2 text-muted',
            )}
          >
            <Clock className="h-3 w-3" aria-hidden />
            {daysLeftLabel(days)}
          </span>
        </div>
      )}
    </div>
  );
}
