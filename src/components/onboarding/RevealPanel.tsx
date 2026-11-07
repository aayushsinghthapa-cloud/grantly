import { useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, PartyPopper } from 'lucide-react';
import { Card, CountUp, buttonClasses } from '@/components/ui';
import { MatchRing } from '@/components/scholarship/MatchRing';
import { UrgencyChip } from '@/components/scholarship/UrgencyChip';
import { SCHOLARSHIPS } from '@/data/scholarships';
import { getMatch } from '@/lib/match';
import { isClosed } from '@/lib/deadline';
import { formatINR, formatINRCompact } from '@/lib/format';
import type { StudentProfile } from '@/types';

/** The "We found N scholarships worth ₹X for you" moment at the end of onboarding. */
export function RevealPanel({ profile }: { profile: StudentProfile }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const { count, total, top } = useMemo(() => {
    const eligible = SCHOLARSHIPS.filter((s) => !isClosed(s.deadline))
      .map((s) => ({ s, m: getMatch(profile, s) }))
      .filter(({ m }) => m.eligible)
      .sort((a, b) => b.m.score - a.m.score);
    return {
      count: eligible.length,
      total: eligible.reduce((sum, { s }) => sum + s.amount, 0),
      top: eligible.slice(0, 3),
    };
  }, [profile]);

  useEffect(() => headingRef.current?.focus(), []);

  const firstName = profile.name.split(' ')[0];

  return (
    <div className="mx-auto max-w-2xl py-6 text-center">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-accent text-accent-fg"
        aria-hidden
      >
        <PartyPopper className="h-8 w-8" />
      </motion.div>
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="text-balance text-3xl font-semibold outline-none sm:text-5xl"
      >
        {firstName}, we found <CountUp value={count} className="tabular text-primary" />{' '}
        scholarships worth{' '}
        <CountUp
          value={total}
          format={(n) => formatINRCompact(Math.round(n / 1000) * 1000)}
          className="tabular text-primary"
        />{' '}
        for you
      </h2>
      <p className="sr-only" aria-live="polite">
        {count} open scholarships you are eligible for, worth {formatINR(total)} in total.
      </p>
      <p className="mx-auto mt-4 max-w-lg text-muted">
        These are open now and match every hard requirement. Here are your strongest matches:
      </p>

      <ul className="mt-8 space-y-3 text-left">
        {top.map(({ s, m }, i) => (
          <motion.li
            key={s.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + i * 0.12 }}
          >
            <Card className="flex items-center gap-4 p-4 transition-shadow hover:shadow-lift">
              <MatchRing match={m} size={48} />
              <div className="min-w-0 flex-1">
                <Link to={`/scholarship/${s.id}`} className="font-semibold hover:underline">
                  {s.name}
                </Link>
                <p className="tabular text-sm text-muted">{formatINR(s.amount)}</p>
              </div>
              <UrgencyChip deadline={s.deadline} className="hidden sm:inline-flex" />
            </Card>
          </motion.li>
        ))}
      </ul>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link to="/dashboard" className={buttonClasses('primary', 'lg')}>
          Go to my dashboard
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
        <Link to="/discover?eligible=1" className={buttonClasses('secondary', 'lg')}>
          See all {count} matches
        </Link>
      </div>
    </div>
  );
}
