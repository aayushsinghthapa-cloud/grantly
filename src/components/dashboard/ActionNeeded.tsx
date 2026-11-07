import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCheck, FileWarning, ListChecks } from 'lucide-react';
import { Card } from '@/components/ui';
import { UrgencyChip } from '@/components/scholarship/UrgencyChip';
import { SCHOLARSHIPS_BY_ID } from '@/data/scholarships';
import { useAppStore } from '@/store/app';
import { getActionsNeeded } from '@/lib/actions';

/** Tracked applications due within a week that still have missing documents or steps. */
export function ActionNeeded() {
  const tracker = useAppStore((s) => s.tracker);
  const vault = useAppStore((s) => s.vault);
  const checklist = useAppStore((s) => s.checklist);
  const items = useMemo(
    () => getActionsNeeded(tracker, vault, checklist, SCHOLARSHIPS_BY_ID),
    [tracker, vault, checklist],
  );

  return (
    <Card as="section" aria-labelledby="action-heading" className="p-5 sm:p-6">
      <h2 id="action-heading" className="flex items-center gap-2 text-2xl font-semibold">
        Action needed
        {items.length > 0 && (
          <span className="tabular rounded-full bg-danger px-2 py-0.5 font-sans text-xs font-semibold text-white dark:text-bg">
            {items.length}
          </span>
        )}
      </h2>
      <p className="text-sm text-muted">Due within 7 days and not ready yet</p>

      {items.length === 0 ? (
        <div className="mt-5 flex items-center gap-3 rounded-xl bg-success-soft p-4 text-sm">
          <CheckCheck className="h-5 w-5 shrink-0 text-success" aria-hidden />
          <p>
            <strong>You’re all caught up.</strong> Nothing urgent this week.
          </p>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map(({ scholarship: s, missingDocs, stepsLeft }) => (
            <li key={s.id}>
              <Link
                to={`/scholarship/${s.id}`}
                className="group block rounded-xl border border-danger/30 bg-danger-soft/40 p-4 transition-colors hover:border-danger/60"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold leading-snug">{s.name}</p>
                  <UrgencyChip deadline={s.deadline} className="shrink-0" />
                </div>
                <ul className="mt-2 space-y-1 text-sm text-muted">
                  {missingDocs.length > 0 && (
                    <li className="flex items-start gap-2">
                      <FileWarning className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden />
                      <span>
                        {missingDocs.length} document{missingDocs.length === 1 ? '' : 's'} missing:{' '}
                        {missingDocs.join(', ')}
                      </span>
                    </li>
                  )}
                  {stepsLeft > 0 && (
                    <li className="flex items-center gap-2">
                      <ListChecks className="h-4 w-4 shrink-0" aria-hidden />
                      {stepsLeft} step{stepsLeft === 1 ? '' : 's'} left on the roadmap
                    </li>
                  )}
                </ul>
                <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  Finish this application{' '}
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
