import { useMemo, useRef, useState, type RefObject } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { ProgressRing } from '@/components/ui';
import { GapPanel } from './surfaces';
import { getScholarship } from '@/data/scholarships';
import { DEMO_PROFILE } from '@/data/demoProfile';
import { getMatch } from '@/lib/match';
import { SEASON, seasonStepAt } from '@/lib/season';
import { formatINR } from '@/lib/format';
import { cn } from '@/lib/cn';

const EASE = [0.23, 1, 0.32, 1] as const;

/** Progress (0..1) through a pinned act's travel: the same value the engine publishes as --sc-p. */
function usePinnedProgress(ref: RefObject<HTMLElement>, onChange: (p: number) => void) {
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  useMotionValueEvent(scrollYProgress, 'change', onChange);
}

/* ------------------------------------------------------------------ Turn --
 * Pin. The frame holds while a scholarship's rules are checked against the
 * sample student one by one, and the score settles. Real getMatch() output. */
export function RulesAct() {
  const ref = useRef<HTMLElement>(null);
  const scholarship = getScholarship('future-engineers-merit')!;
  const match = useMemo(() => getMatch(DEMO_PROFILE, scholarship), [scholarship]);
  const total = match.criteria.length;
  const [shown, setShown] = useState(0);

  usePinnedProgress(ref, (p) => {
    // Criteria arrive between 8% and 78% of the act; the rest is a settled hold.
    setShown(Math.max(0, Math.min(total, Math.floor(((p - 0.08) / 0.7) * total) + 1)));
  });
  const score = Math.round((match.score * shown) / total);

  return (
    <section
      ref={ref}
      data-sc-act="pin"
      data-sc-span="2.4"
      aria-labelledby="rules-heading"
      className="relative"
    >
      <div data-sc-stage className="flex items-center">
        <div className="container-page grid w-full grid-cols-1 items-center gap-8 pt-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:gap-20">
          <div className="max-w-md">
            <h2 id="rules-heading" className="text-balance text-[2rem] leading-[1.05] sm:text-5xl">
              Every rule, checked against you.
            </h2>
            <p className="mt-4 text-pretty text-[17px] leading-relaxed text-muted">
              One profile in. Each scholarship explains, in plain words, exactly why you do or don’t
              qualify.
            </p>
          </div>

          <div className="rounded-3xl bg-surface p-5 shadow-lift ring-1 ring-border/70 sm:p-7">
            <div className="flex items-center gap-4 border-b border-border pb-5">
              <ProgressRing value={score} size={64} stroke={5} label={`${match.score}% match`} />
              <div className="min-w-0">
                <p className="truncate text-xs text-muted">
                  {scholarship.provider} · sample student
                </p>
                <p className="font-semibold leading-snug">{scholarship.name}</p>
                <p className="tabular text-sm text-muted">{formatINR(scholarship.amount)} a year</p>
              </div>
            </div>
            <ul className="mt-2">
              {match.criteria.map((c, i) => {
                const on = i < shown;
                return (
                  <motion.li
                    key={c.key}
                    className="flex gap-3 py-2.5"
                    initial={false}
                    animate={{ opacity: on ? 1 : 0, y: on ? 0 : 8 }}
                    transition={{ duration: 0.32, ease: EASE }}
                  >
                    <span
                      className={cn(
                        'mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full transition-colors duration-300',
                        on
                          ? c.met
                            ? 'bg-primary text-primary-fg'
                            : 'bg-danger text-white'
                          : 'bg-surface-2 text-transparent',
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
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Peak --
 * The signature move. Scroll plays a scripted season through the real
 * computeFunding(); the bar redistributes and the gap counts down to zero.
 * Scrolling back reverses it exactly. Largest span on the page. */
export function SeasonAct() {
  const ref = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);
  usePinnedProgress(ref, (p) => setStep(seasonStepAt(p)));

  return (
    <section
      ref={ref}
      data-sc-act="pin"
      data-sc-span="3.4"
      aria-labelledby="season-heading"
      className="relative"
    >
      <div data-sc-stage className="flex items-center">
        <div className="container-page grid w-full grid-cols-1 items-center gap-6 pt-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:gap-20">
          <div className="order-2 lg:order-1">
            <GapPanel step={step} />
          </div>
          <div className="order-1 max-w-md lg:order-2">
            <h2 id="season-heading" className="text-balance text-[2rem] leading-[1.05] sm:text-5xl">
              Watch the gap close.
            </h2>
            <p className="mt-3 text-pretty text-[17px] leading-relaxed text-muted">
              Ananya’s year costs {formatINR(DEMO_PROFILE.annualCost)}. Scroll through her season.
            </p>
            {/* Polite live region: the caption narrates each step for screen readers too. */}
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
                    'h-1 flex-1 origin-left rounded-full bg-border transition-colors duration-300',
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
