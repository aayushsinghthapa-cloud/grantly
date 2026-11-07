import { Clock } from 'lucide-react';
import { Badge, type BadgeTone } from '@/components/ui';
import { daysLeft, daysLeftLabel, formatDeadline, urgencyFor, type Urgency } from '@/lib/deadline';

const tone: Record<Urgency, BadgeTone> = {
  closed: 'neutral',
  urgent: 'danger',
  soon: 'warning',
  normal: 'neutral',
};

/** Deadline chip: red ≤ 7 days, amber ≤ 21 days, neutral otherwise. Includes the full date for screen readers. */
export function UrgencyChip({ deadline, className }: { deadline: string; className?: string }) {
  const days = daysLeft(deadline);
  const urgency = urgencyFor(days);
  return (
    <Badge
      tone={tone[urgency]}
      className={className}
      title={`Deadline: ${formatDeadline(deadline)}`}
    >
      <Clock className="h-3 w-3" aria-hidden />
      <span>{daysLeftLabel(days)}</span>
      <span className="sr-only">, deadline {formatDeadline(deadline)}</span>
    </Badge>
  );
}
