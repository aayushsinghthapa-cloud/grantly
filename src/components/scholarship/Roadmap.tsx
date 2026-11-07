import { useId } from 'react';
import { motion } from 'framer-motion';
import { Check, Send } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { useAppStore } from '@/store/app';
import { toast } from '@/store/toast';
import type { Scholarship } from '@/types';
import { cn } from '@/lib/cn';

const EMPTY: number[] = [];

/** Interactive step-by-step application checklist. Progress is persisted per scholarship. */
export function Roadmap({ scholarship: s }: { scholarship: Scholarship }) {
  const baseId = useId();
  const done = useAppStore((st) => st.checklist[s.id] ?? EMPTY);
  const status = useAppStore((st) => st.tracker[s.id]?.status);
  const toggleStep = useAppStore((st) => st.toggleStep);
  const setStatus = useAppStore((st) => st.setStatus);

  const total = s.steps.length;
  const complete = done.length;
  const allDone = complete === total;

  const onToggle = (i: number) => {
    const willStart = complete === 0 && (!status || status === 'saved');
    toggleStep(s.id, i);
    if (willStart)
      toast({
        title: 'Moved to Preparing',
        description: 'Nice start — we’ll track this in your board.',
        tone: 'success',
      });
  };

  return (
    <Card as="section" aria-labelledby="roadmap-heading" className="p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 id="roadmap-heading" className="text-2xl font-semibold">
          Application roadmap
        </h2>
        <p className="tabular text-sm text-muted">
          {complete} of {total} steps done
        </p>
      </div>
      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2"
        role="progressbar"
        aria-label="Roadmap progress"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={complete}
        aria-valuetext={`${complete} of ${total} steps done`}
      >
        <motion.div
          className="h-full rounded-full bg-primary"
          animate={{ width: `${(complete / total) * 100}%` }}
        />
      </div>

      <ol className="relative mt-6">
        {s.steps.map((step, i) => {
          const checked = done.includes(i);
          const id = `${baseId}-step-${i}`;
          return (
            <li key={step.title} className="relative flex gap-4 pb-6 last:pb-0">
              {i < total - 1 && (
                <span
                  className={cn(
                    'absolute left-[15px] top-9 h-[calc(100%-2.5rem)] w-0.5',
                    checked ? 'bg-primary' : 'bg-border',
                  )}
                  aria-hidden
                />
              )}
              <div className="relative">
                <input
                  id={id}
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(i)}
                  className="peer sr-only"
                />
                <label
                  htmlFor={id}
                  className={cn(
                    'grid h-8 w-8 cursor-pointer place-items-center rounded-full border-2 text-sm font-semibold transition-colors',
                    'peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-surface',
                    checked
                      ? 'border-primary bg-primary text-primary-fg'
                      : 'border-border bg-surface text-muted hover:border-primary',
                  )}
                >
                  {checked ? (
                    <Check className="h-4 w-4" aria-hidden />
                  ) : (
                    <span aria-hidden>{i + 1}</span>
                  )}
                  <span className="sr-only">
                    Mark step {i + 1} “{step.title}” as {checked ? 'not done' : 'done'}
                  </span>
                </label>
              </div>
              <div className="min-w-0 pt-1">
                <p
                  className={cn('font-semibold', checked && 'text-muted line-through decoration-1')}
                >
                  {step.title}
                </p>
                <p className="mt-1 text-sm text-muted">{step.detail}</p>
              </div>
            </li>
          );
        })}
      </ol>

      {allDone && status !== 'submitted' && status !== 'won' && status !== 'rejected' && (
        <div className="mt-6 flex flex-col gap-3 rounded-xl bg-primary-soft p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium">Every step is done. Have you submitted it?</p>
          <Button
            size="sm"
            leftIcon={<Send className="h-4 w-4" aria-hidden />}
            onClick={() => {
              setStatus(s.id, 'submitted');
              toast({
                title: 'Marked as submitted',
                description: 'Good luck! We’ll keep it on your tracker.',
                tone: 'success',
              });
            }}
          >
            Mark as submitted
          </Button>
        </div>
      )}
    </Card>
  );
}
