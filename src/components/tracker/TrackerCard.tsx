import { forwardRef, type HTMLAttributes } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRightLeft,
  FileCheck2,
  GripVertical,
  ListChecks,
  MoreHorizontal,
  Trash2,
} from 'lucide-react';
import { Menu } from '@/components/ui';
import { UrgencyChip } from '@/components/scholarship/UrgencyChip';
import type { TrackedItem } from '@/hooks/useMatches';
import { formatINR } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { TrackerStatus } from '@/types';
import { ZONES } from './board';

interface TrackerCardProps {
  item: TrackedItem;
  onMove: (status: TrackerStatus | null) => void;
  /** Props from dnd-kit for the drag handle (listeners + a11y attributes). */
  handleProps?: HTMLAttributes<HTMLButtonElement>;
  dragging?: boolean;
  overlay?: boolean;
}

export const TrackerCard = forwardRef<
  HTMLDivElement,
  TrackerCardProps & HTMLAttributes<HTMLDivElement>
>(function TrackerCard({ item, onMove, handleProps, dragging, overlay, className, ...rest }, ref) {
  const { scholarship: s, entry, readiness, stepsDone } = item;
  const done =
    entry.status === 'won' || entry.status === 'rejected' || entry.status === 'submitted';

  return (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border border-border bg-surface p-3 shadow-soft',
        dragging && 'opacity-40',
        overlay && 'rotate-2 shadow-lift ring-2 ring-primary',
        className,
      )}
      {...rest}
    >
      <div className="flex items-start gap-1">
        <button
          type="button"
          className="-ml-1 mt-0.5 grid h-7 w-6 shrink-0 cursor-grab touch-none place-items-center rounded-md text-muted hover:bg-surface-2 hover:text-ink active:cursor-grabbing"
          aria-label={`Drag ${s.name}`}
          {...handleProps}
        >
          <GripVertical className="h-4 w-4" aria-hidden />
        </button>
        <Link
          to={`/scholarship/${s.id}`}
          className="min-w-0 flex-1 text-sm font-semibold leading-snug hover:underline"
        >
          {s.name}
        </Link>
        <Menu
          label={`Move ${s.name}`}
          trigger={<MoreHorizontal className="h-4 w-4" aria-hidden />}
          items={[
            ...ZONES.filter((z) => z.status !== entry.status).map((z) => ({
              label: `Move to ${z.label}`,
              icon: <ArrowRightLeft className="h-3.5 w-3.5 text-muted" aria-hidden />,
              onSelect: () => onMove(z.status),
            })),
            {
              label: 'Remove from tracker',
              icon: <Trash2 className="h-3.5 w-3.5 text-danger" aria-hidden />,
              onSelect: () => onMove(null),
            },
          ]}
        />
      </div>
      <p className="tabular ml-5 mt-1 text-sm text-muted">{formatINR(s.amount)}</p>
      <div className="ml-5 mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted">
        {!done && <UrgencyChip deadline={s.deadline} />}
        <span className="inline-flex items-center gap-1" title="Documents ready">
          <FileCheck2
            className={cn('h-3.5 w-3.5', readiness.complete && 'text-success')}
            aria-hidden
          />
          <span className="tabular">
            {readiness.ready.length}/{readiness.total}
          </span>
          <span className="sr-only">documents ready</span>
        </span>
        <span className="inline-flex items-center gap-1" title="Roadmap steps done">
          <ListChecks className="h-3.5 w-3.5" aria-hidden />
          <span className="tabular">
            {stepsDone}/{s.steps.length}
          </span>
          <span className="sr-only">steps done</span>
        </span>
      </div>
    </div>
  );
});
