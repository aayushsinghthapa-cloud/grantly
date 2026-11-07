import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { List, Radar } from 'lucide-react';
import { Badge, Card, EmptyState, TabPanel, Tabs, buttonClasses } from '@/components/ui';
import { UrgencyChip } from '@/components/scholarship/UrgencyChip';
import { useTrackedItems } from '@/hooks/useMatches';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { STATUS_LABEL } from '@/data/constants';
import {
  daysLeft,
  daysLeftLabel,
  formatDeadlineShort,
  urgencyFor,
  type Urgency,
} from '@/lib/deadline';
import { placeOnTimeline } from '@/lib/radar';
import { formatINRCompact } from '@/lib/format';
import { cn } from '@/lib/cn';

const WINDOW = 60;
const LANE_HEIGHT = 34;

const dotClass: Record<Urgency, string> = {
  urgent: 'bg-danger ring-danger/25',
  soon: 'bg-accent ring-accent/30',
  normal: 'bg-primary ring-primary/25',
  closed: 'bg-muted ring-muted/20',
};

type View = 'timeline' | 'list';

/** Next 60 days of tracked deadlines — a timeline on wide screens, a grouped list everywhere. */
export function DeadlineRadar() {
  const wide = useMediaQuery('(min-width: 768px)');
  const [view, setView] = useState<View | null>(null);
  const active: View = view ?? (wide ? 'timeline' : 'list');
  const tracked = useTrackedItems();

  const items = useMemo(
    () =>
      tracked
        .filter(({ entry }) => entry.status !== 'won' && entry.status !== 'rejected')
        .map((t) => {
          const days = daysLeft(t.scholarship.deadline);
          return { ...t, days, urgency: urgencyFor(days) };
        })
        .filter((t) => t.days >= 0 && t.days <= WINDOW)
        .sort((a, b) => a.days - b.days),
    [tracked],
  );
  const placed = useMemo(() => placeOnTimeline(items, WINDOW, 6), [items]);
  const lanes = Math.max(1, ...placed.map((p) => p.lane + 1));
  const idBase = 'radar';

  const groups = [
    { label: 'This week', items: items.filter((i) => i.days <= 7) },
    { label: 'Next 2 weeks', items: items.filter((i) => i.days > 7 && i.days <= 21) },
    { label: 'Later', items: items.filter((i) => i.days > 21) },
  ].filter((g) => g.items.length > 0);

  return (
    <Card as="section" aria-labelledby="radar-heading" className="p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="radar-heading" className="text-2xl font-semibold">
            Deadline radar
          </h2>
          <p className="text-sm text-muted">
            Your tracked applications due in the next {WINDOW} days
          </p>
        </div>
        <Tabs
          label="Radar view"
          idBase={idBase}
          value={active}
          onChange={setView}
          items={[
            {
              value: 'timeline',
              label: 'Timeline',
              icon: <Radar className="h-4 w-4" aria-hidden />,
            },
            { value: 'list', label: 'List', icon: <List className="h-4 w-4" aria-hidden /> },
          ]}
        />
      </div>

      {items.length === 0 ? (
        <EmptyState
          className="mt-5"
          icon={<Radar className="h-6 w-6" />}
          title="Nothing on the radar"
          description="Save scholarships from Discover and their deadlines will appear here."
          action={
            <Link to="/discover" className={buttonClasses('secondary', 'sm')}>
              Find scholarships
            </Link>
          }
        />
      ) : active === 'timeline' ? (
        <TabPanel idBase={idBase} value="timeline" className="mt-6 outline-none">
          <div className="relative px-2">
            {/* Week bands */}
            <div className="relative" style={{ height: lanes * LANE_HEIGHT + 24 }}>
              <div
                className="absolute inset-y-0 left-0 w-[11.67%] rounded-l-lg bg-danger-soft/70"
                aria-hidden
              />
              <div
                className="absolute inset-y-0 left-[11.67%] w-[23.33%] bg-warning-soft/50"
                aria-hidden
              />
              {[0, 7, 14, 21, 28, 35, 42, 49, 56].map((d) => (
                <div
                  key={d}
                  className="absolute inset-y-0 border-l border-border"
                  style={{ left: `${(d / WINDOW) * 100}%` }}
                  aria-hidden
                />
              ))}
              <div className="absolute inset-y-0 left-0 w-0.5 bg-ink" aria-hidden />
              <ul className="relative h-full" aria-label="Deadlines on a timeline, soonest first">
                {placed.map((p) => (
                  <li
                    key={p.scholarship.id}
                    className="absolute -translate-x-1/2"
                    style={{ left: `${p.pct}%`, top: 12 + p.lane * LANE_HEIGHT }}
                  >
                    <Link
                      to={`/scholarship/${p.scholarship.id}`}
                      className="group relative grid h-6 w-6 place-items-center rounded-full"
                      aria-label={`${p.scholarship.name}: ${daysLeftLabel(p.days)}, ${STATUS_LABEL[p.entry.status]}`}
                    >
                      <span
                        className={cn(
                          'h-4 w-4 rounded-full ring-4 transition-transform group-hover:scale-125',
                          dotClass[p.urgency],
                        )}
                      />
                      <span
                        className={cn(
                          'pointer-events-none absolute bottom-full z-20 mb-2 hidden w-max max-w-56 rounded-lg bg-ink px-2.5 py-1.5 text-xs text-bg shadow-lift group-hover:block group-focus-visible:block',
                          p.pct > 70
                            ? 'right-0'
                            : p.pct < 20
                              ? 'left-0'
                              : 'left-1/2 -translate-x-1/2',
                        )}
                        aria-hidden
                      >
                        <strong className="block">{p.scholarship.name}</strong>
                        {daysLeftLabel(p.days)} · {formatINRCompact(p.scholarship.amount)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative mt-2 h-5 text-xs text-muted" aria-hidden>
              {[0, 7, 14, 21, 30, 45, 60].map((d) => (
                <span
                  key={d}
                  className={cn(
                    'absolute',
                    d === 0 ? 'left-0' : d === 60 ? 'right-0' : '-translate-x-1/2',
                  )}
                  style={d === 0 || d === 60 ? undefined : { left: `${(d / WINDOW) * 100}%` }}
                >
                  {d === 0 ? 'Today' : `${d}d`}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted">
            <Legend className="bg-danger" label="Due in 7 days or less" />
            <Legend className="bg-accent" label="Due in 8–21 days" />
            <Legend className="bg-primary" label="Later" />
          </div>
        </TabPanel>
      ) : (
        <TabPanel idBase={idBase} value="list" className="mt-5 space-y-5 outline-none">
          {groups.map((g) => (
            <div key={g.label}>
              <h3 className="font-sans text-xs font-semibold uppercase tracking-wider text-muted">
                {g.label}
              </h3>
              <ul className="mt-2 divide-y divide-border rounded-xl border border-border">
                {g.items.map((i) => (
                  <li key={i.scholarship.id} className="flex items-center gap-3 p-3">
                    <span
                      className={cn(
                        'h-2.5 w-2.5 shrink-0 rounded-full',
                        dotClass[i.urgency].split(' ')[0],
                      )}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/scholarship/${i.scholarship.id}`}
                        className="line-clamp-2 text-sm font-semibold hover:underline"
                      >
                        {i.scholarship.name}
                      </Link>
                      <p className="text-xs text-muted">
                        {formatDeadlineShort(i.scholarship.deadline)} ·{' '}
                        {formatINRCompact(i.scholarship.amount)}
                      </p>
                    </div>
                    <Badge className="hidden sm:inline-flex">{STATUS_LABEL[i.entry.status]}</Badge>
                    <UrgencyChip deadline={i.scholarship.deadline} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </TabPanel>
      )}
    </Card>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn('h-2.5 w-2.5 rounded-full', className)} aria-hidden />
      {label}
    </span>
  );
}
