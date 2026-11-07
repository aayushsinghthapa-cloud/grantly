import { HelpCircle } from 'lucide-react';
import { ProgressRing } from '@/components/ui';
import type { MatchResult } from '@/lib/match';
import { cn } from '@/lib/cn';

/** Match score ring, or a neutral placeholder when there is no profile yet. */
export function MatchRing({
  match,
  size = 56,
  className,
}: {
  match: MatchResult | null;
  size?: number;
  className?: string;
}) {
  if (!match) {
    return (
      <div
        role="img"
        aria-label="Match score unavailable: create a profile"
        className={cn(
          'grid shrink-0 place-items-center rounded-full border-2 border-dashed border-border text-muted',
          className,
        )}
        style={{ width: size, height: size }}
      >
        <HelpCircle className="h-5 w-5" aria-hidden />
      </div>
    );
  }
  return (
    <ProgressRing
      value={match.score}
      size={size}
      tone={match.eligible ? 'auto' : 'muted'}
      label={`${match.score}% match${match.eligible ? '' : ', not eligible'}`}
      className={className}
    />
  );
}
