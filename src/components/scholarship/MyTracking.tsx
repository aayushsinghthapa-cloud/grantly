import { useId } from 'react';
import { AlarmClock, NotebookPen } from 'lucide-react';
import { Card, Select } from '@/components/ui';
import { useAppStore } from '@/store/app';
import { toast } from '@/store/toast';
import { daysLeft } from '@/lib/deadline';
import type { Scholarship } from '@/types';

const REMINDER_OPTIONS = [
  { value: 'off', label: 'No reminder' },
  { value: '1', label: '1 day before the deadline' },
  { value: '3', label: '3 days before the deadline' },
  { value: '7', label: '1 week before the deadline' },
  { value: '14', label: '2 weeks before the deadline' },
];

/** The student's own tracking for one scholarship: a deadline reminder and private notes. */
export function MyTracking({ scholarship: s }: { scholarship: Scholarship }) {
  const notesId = useId();
  const reminder = useAppStore((st) => st.reminders[s.id]);
  const note = useAppStore((st) => st.notes[s.id] ?? '');
  const setReminder = useAppStore((st) => st.setReminder);
  const setNote = useAppStore((st) => st.setNote);
  const closed = daysLeft(s.deadline) < 0;

  return (
    <Card as="section" aria-labelledby={`${notesId}-heading`} className="p-5 sm:p-6">
      <h2 id={`${notesId}-heading`} className="text-xl font-semibold">
        My reminders &amp; notes
      </h2>
      <div className="mt-4 space-y-4">
        <div className="flex items-end gap-3">
          <AlarmClock className="mb-3 h-4 w-4 shrink-0 text-primary" aria-hidden />
          <Select
            label="Remind me"
            value={reminder === undefined ? 'off' : String(reminder)}
            options={REMINDER_OPTIONS}
            disabled={closed}
            hint={
              closed
                ? 'This scholarship has closed.'
                : 'Shows in the bell and when you open GRANTLY.'
            }
            wrapperClassName="flex-1"
            onChange={(e) => {
              const v = e.target.value === 'off' ? null : Number(e.target.value);
              setReminder(s.id, v);
              toast({
                title: v === null ? 'Reminder removed' : 'Reminder set',
                description:
                  v === null
                    ? s.name
                    : `We’ll remind you ${v} day${v === 1 ? '' : 's'} before ${s.name} closes.`,
                tone: v === null ? 'default' : 'success',
              });
            }}
          />
        </div>
        <div className="flex items-start gap-3">
          <NotebookPen className="mt-9 h-4 w-4 shrink-0 text-primary" aria-hidden />
          <div className="flex flex-1 flex-col gap-1.5">
            <label htmlFor={notesId} className="text-sm font-medium">
              My notes
            </label>
            <textarea
              id={notesId}
              value={note}
              onChange={(e) => setNote(s.id, e.target.value)}
              rows={4}
              placeholder="Login ID, who you asked for a letter, what’s still pending…"
              aria-describedby={`${notesId}-hint`}
              className="w-full resize-y rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/80 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-0"
            />
            <p id={`${notesId}-hint`} className="text-xs text-muted">
              Saved automatically on this device.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
