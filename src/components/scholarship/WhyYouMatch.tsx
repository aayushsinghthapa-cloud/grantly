import { Link } from 'react-router-dom';
import { AlertCircle, Check, Info, X } from 'lucide-react';
import { Card, buttonClasses } from '@/components/ui';
import { MatchRing } from './MatchRing';
import type { MatchResult } from '@/lib/match';
import { cn } from '@/lib/cn';

interface WhyYouMatchProps {
  match: MatchResult | null;
  note?: string;
}

/** Criterion-by-criterion breakdown in plain language, so the score is never a black box. */
export function WhyYouMatch({ match, note }: WhyYouMatchProps) {
  return (
    <Card as="section" aria-labelledby="why-heading" className="p-5 sm:p-6">
      <h2 id="why-heading" className="text-2xl font-semibold">
        Why you match
      </h2>

      {!match ? (
        <div className="mt-4 rounded-xl bg-surface-2 p-4">
          <p className="text-sm text-muted">
            Create your profile to see, rule by rule, whether you qualify for this scholarship.
          </p>
          <Link to="/onboarding" className={buttonClasses('primary', 'sm', 'mt-3')}>
            Create my profile
          </Link>
        </div>
      ) : (
        <>
          <div
            className={cn(
              'mt-4 flex items-center gap-4 rounded-xl p-4',
              match.eligible ? 'bg-success-soft' : 'bg-danger-soft',
            )}
          >
            <MatchRing match={match} size={52} />
            <p className="text-sm">
              <strong
                className={cn('block text-base', match.eligible ? 'text-success' : 'text-danger')}
              >
                {match.eligible ? 'You meet every requirement' : 'You don’t meet every requirement'}
              </strong>
              {match.eligible
                ? 'Your score reflects how closely this fits your field and interests.'
                : (() => {
                    const n = match.criteria.filter((c) => c.kind === 'hard' && !c.met).length;
                    return `${n === 1 ? 'The requirement' : `${n} requirements`} marked below ${n === 1 ? 'rules' : 'rule'} you out for now.`;
                  })()}
            </p>
          </div>

          <ul className="mt-5 divide-y divide-border">
            {match.criteria.map((c) => (
              <li key={c.key} className="flex gap-3 py-3">
                <span
                  className={cn(
                    'mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full',
                    c.met
                      ? 'bg-success-soft text-success'
                      : c.kind === 'hard'
                        ? 'bg-danger-soft text-danger'
                        : 'bg-surface-2 text-muted',
                  )}
                  aria-hidden
                >
                  {c.met ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">
                    {c.label}
                    <span className="sr-only">: {c.met ? 'met' : 'not met'}.</span>
                    {c.kind === 'soft' && (
                      <span className="ml-2 text-xs font-normal text-muted">
                        (affects score only)
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-muted">{c.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {note && (
        <p className="mt-4 flex gap-2 rounded-xl border border-accent/50 bg-accent-soft p-3 text-sm">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>
            <strong>Also check:</strong> {note}
          </span>
        </p>
      )}
      <p className="mt-4 flex items-start gap-2 text-xs text-muted">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        Requirements decide eligibility. Field fit and your interests only adjust the match score.
      </p>
    </Card>
  );
}
