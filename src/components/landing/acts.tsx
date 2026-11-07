import { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { ProgressRing } from '@/components/ui';
import { GapPanel } from './surfaces';
import { getScholarship } from '@/data/scholarships';
import { DEMO_PROFILE } from '@/data/demoProfile';
import { getMatch } from '@/lib/match';
import { SEASON, seasonStepAt } from '@/lib/season';
import { formatINR } from '@/lib/format';
import { usePlayOnScroll } from '@/hooks/usePlayOnScroll';
import { cn } from '@/lib/cn';

const EASE = [0.23, 1, 0.32, 1] as const;

/* ---------------------------------------------------------- Understanding --
 * A scholarship's rules checked against the sample student by the real getMatch().
 * Rests complete; for a visitor scrolling in, the rules tick in one by one. */
export function RulesPanel() {
  const ref = useRef<HTMLDivElement>(null);
  const phase = usePlayOnScroll(ref);
  const scholarship = getScholarship('future-engineers-merit')!;
  const match = useMemo(() => getMatch(DEMO_PROFILE, scholarship), [scholarship]);
  const hidden = phase === 'armed';

  return (
    <div ref={ref} className="rounded-3xl bg-surface p-5 shadow-lift ring-1 ring-border/70 sm:p-7">
      <div className="flex items-center gap-4 border-b border-border pb-5">
        <ProgressRing
          value={hidden ? 0 : match.score}
          size={64}
          stroke={5}
          label={`${match.score}% match`}
        />
        <div className="min-w-0">
          <p className="truncate text-xs text-muted">{scholarship.provider} · sample student</p>
          <p className="font-semibold leading-snug">{scholarship.name}</p>
          <p className="tabular text-sm text-muted">{formatINR(scholarship.amount)} a year</p>
        </div>
      </div>
      <ul className="mt-2">
        {match.criteria.map((c, i) => (
          <motion.li
            key={c.key}
            className="flex gap-3 py-2.5"
            initial={false}
            animate={hidden ? { opacity: 0, y: 8 } : { opacity: 1, y: 0 }}
            transition={{
              duration: 0.36,
              ease: EASE,
              delay: phase === 'playing' ? 0.15 + i * 0.14 : 0,
            }}
          >
            <span
              className={cn(
                'mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full',
                c.met ? 'bg-primary text-primary-fg' : 'bg-danger text-white',
              )}
              aria-hidden
            >
              {c.met ? (
                <Check className="h-3 w-3" strokeWidth={3} />
              ) : (
                <X className="h-3 w-3" strokeWidth={3} />
              )}
            </span>
            <span className="min-w-0 text-sm">
              <span className="font-medium">{c.label}</span>
              <span className="sr-only">: {c.met ? 'met' : 'not met'}.</span>
              <span className="block text-muted">{c.detail}</span>
            </span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

/* --------------------------------------------------------------- Signature --
 * The season scrubber. Pinned; scroll plays a scripted season through the real
 * computeFunding() and the gap counts down to zero. Rests on the finished season
 * (gap covered) until a visitor scrolls toward it, then hands control to the scroll. */
export function SeasonAct() {
  const ref = useRef<HTMLElement>(null);
  const phase = usePlayOnScroll(ref, { playAt: 1 });
  const [scrollStep, setScrollStep] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  useMotionValueEvent(scrollYProgress, 'change', (p) => setScrollStep(seasonStepAt(p)));
  const step = phase === 'final' ? SEASON.length - 1 : scrollStep;

  return (
    <section
      ref={ref}
      id="signature"
      data-sc-act="pin"
      data-sc-span="1.7"
      aria-labelledby="season-heading"
      className="relative"
    >
      <div data-sc-stage className="flex items-center">
        <div className="container-page grid w-full grid-cols-1 items-center gap-6 pt-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:gap-20">
          <div className="order-2 lg:order-1">
            <GapPanel step={step} />
          </div>
          <div className="order-1 max-w-md lg:order-2">
            <p className="text-[13px] font-semibold text-primary">The Funding Gap Meter</p>
            <h2
              id="season-heading"
              className="mt-2 text-balance text-[2rem] leading-[1.05] sm:text-5xl"
            >
              Watch the gap close.
            </h2>
            <p className="mt-3 text-pretty text-[17px] leading-relaxed text-muted">
              Most tools stop at a list. GRANTLY answers the real question: is my year paid for?
              Ananya’s year costs {formatINR(DEMO_PROFILE.annualCost)}. Scroll through her season.
            </p>
            <div className="relative mt-5 h-14" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={step}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.26, ease: EASE }}
                  className="absolute inset-x-0 top-0 text-pretty font-medium"
                >
                  {SEASON[step].caption}
                </motion.p>
              </AnimatePresence>
            </div>
            <ol className="mt-1 flex gap-1.5" aria-hidden>
              {SEASON.map((_, i) => (
                <li
                  key={i}
                  className={cn(
                    'h-1 flex-1 rounded-full bg-border transition-colors duration-300',
                    i <= step && 'bg-ink',
                  )}
                />
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
