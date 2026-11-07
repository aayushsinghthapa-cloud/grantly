import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpenCheck,
  CalendarClock,
  ClipboardCheck,
  Compass,
  KanbanSquare,
  Route,
  Search,
  UserRoundPen,
  type LucideIcon,
} from 'lucide-react';
import { Badge, Card, CountUp, ProgressRing, buttonClasses } from '@/components/ui';
import { SCHOLARSHIPS } from '@/data/scholarships';
import { useAppStore } from '@/store/app';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { daysLeft } from '@/lib/deadline';
import { formatINRCompact } from '@/lib/format';

// Live stats straight from the dataset (deadlines are relative to today, so these change daily).
const open = SCHOLARSHIPS.filter((s) => daysLeft(s.deadline) >= 0);
const STATS = {
  total: open.reduce((sum, s) => sum + s.amount, 0),
  count: open.length,
  closingThisWeek: open.filter((s) => daysLeft(s.deadline) <= 7).length,
};

const STEPS = [
  {
    icon: UserRoundPen,
    title: 'Tell us about you — once',
    body: 'One short eligibility profile: course, marks, family income, state and interests.',
  },
  {
    icon: Search,
    title: 'See what you actually qualify for',
    body: 'Every scholarship gets a Match Score with a plain-English “why you match”.',
  },
  {
    icon: ClipboardCheck,
    title: 'Apply with a roadmap',
    body: 'Step-by-step checklists, document readiness and a deadline radar keep you on track.',
  },
];

const PAIN_POINTS: {
  icon: LucideIcon;
  problem: string;
  feature: string;
  body: string;
  to: string;
  cta: string;
}[] = [
  {
    icon: Compass,
    problem: 'Finding',
    feature: 'Smart Discover',
    body: 'Fuzzy search, filters and a Match Score on every scholarship — sorted by how well it fits you.',
    to: '/discover',
    cta: 'Explore Discover',
  },
  {
    icon: BookOpenCheck,
    problem: 'Understanding',
    feature: 'Why you match',
    body: 'Each rule explained in plain language, side-by-side compare, and tooltips for jargon like “Bonafide”.',
    to: '/compare',
    cta: 'Try Compare',
  },
  {
    icon: Route,
    problem: 'Applying',
    feature: 'Roadmap + Document Vault',
    body: 'A step checklist for every application and “4 of 6 documents ready” — updated from one vault.',
    to: '/vault',
    cta: 'Open the Vault',
  },
  {
    icon: KanbanSquare,
    problem: 'Tracking',
    feature: 'Tracker + Deadline Radar',
    body: 'Drag applications from saved to submitted to won, with deadlines colour-coded by urgency.',
    to: '/tracker',
    cta: 'See the Tracker',
  },
];

export default function LandingPage() {
  useDocumentTitle('');
  const reduce = useReducedMotion();
  const hasProfile = useAppStore((s) => s.profile !== null);
  const fade = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
        };
  const inView = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: '-60px' },
          transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  const primaryCta = hasProfile ? (
    <Link to="/dashboard" className={buttonClasses('primary', 'lg')}>
      Go to my dashboard <ArrowRight className="h-4 w-4" aria-hidden />
    </Link>
  ) : (
    <Link to="/onboarding" className={buttonClasses('primary', 'lg')}>
      Find my scholarships <ArrowRight className="h-4 w-4" aria-hidden />
    </Link>
  );

  return (
    <>
      <section className="container-page grid items-center gap-12 pb-12 pt-12 sm:pt-20 lg:grid-cols-[1.15fr_1fr] lg:pt-24">
        <div>
          <motion.p
            {...fade()}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-sm text-muted"
          >
            <span className="h-2 w-2 rounded-full bg-accent" aria-hidden />
            One profile. Every scholarship, explained.
          </motion.p>
          <motion.h1
            {...fade(0.05)}
            className="text-balance text-5xl font-semibold leading-[1.05] sm:text-6xl lg:text-7xl"
          >
            Scholarships, <em className="font-normal text-primary">finally</em> simple.
          </motion.h1>
          <motion.p {...fade(0.1)} className="mt-6 max-w-xl text-lg text-muted">
            Grantly finds the scholarships you&apos;re eligible for, explains every rule in plain
            language, and tracks every document and deadline until the money lands.
          </motion.p>
          <motion.div {...fade(0.15)} className="mt-8 flex flex-wrap gap-3">
            {primaryCta}
            <Link to="/discover" className={buttonClasses('secondary', 'lg')}>
              Browse all {SCHOLARSHIPS.length}
            </Link>
          </motion.div>
        </div>

        {/* Decorative preview of the Match ring + Funding Gap motifs. */}
        <motion.div {...fade(0.2)} aria-hidden className="relative mx-auto w-full max-w-md">
          <div className="absolute -inset-3 -z-10 rounded-[2rem] bg-primary-soft/70 sm:-inset-6" />
          <Card className="p-6 shadow-lift">
            <div className="flex items-start gap-4">
              <ProgressRing value={87} size={72} stroke={6} />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Lumen Foundation
                </p>
                <p className="mt-1 font-display text-xl font-semibold leading-snug">
                  Future Engineers Merit Award
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge tone="primary">Merit</Badge>
                  <Badge tone="danger">5 days left</Badge>
                </div>
              </div>
            </div>
            <ul className="mt-5 space-y-2 text-sm">
              {[
                'Undergraduate in Engineering',
                'Income ₹4.2L under the ₹6L limit',
                '86% marks above the 75% minimum',
              ].map((t) => (
                <li key={t} className="flex gap-2">
                  <span className="text-success">✓</span> {t}
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <div className="flex justify-between text-xs text-muted">
                <span>Funding covered</span>
                <span className="tabular">₹1.2L of ₹1.8L</span>
              </div>
              <div className="mt-2 flex h-3 overflow-hidden rounded-full bg-surface-2">
                <motion.div
                  className="bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: '45%' }}
                  transition={{ duration: 1, delay: 0.6 }}
                />
                <motion.div
                  className="bg-accent"
                  initial={{ width: 0 }}
                  animate={{ width: '22%' }}
                  transition={{ duration: 0.8, delay: 1.2 }}
                />
              </div>
            </div>
          </Card>
        </motion.div>
      </section>

      {/* Live stats */}
      <section aria-label="Scholarships on Grantly right now" className="container-page">
        <dl className="grid grid-cols-1 divide-y divide-border rounded-2xl border border-border bg-surface sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <Stat label="in open scholarships">
            <CountUp
              value={STATS.total}
              format={(n) => formatINRCompact(Math.round(n / 10000) * 10000)}
            />
          </Stat>
          <Stat label="scholarships accepting applications">
            <CountUp value={STATS.count} />
          </Stat>
          <Stat label="closing this week" accent>
            <CountUp value={STATS.closingThisWeek} />
          </Stat>
        </dl>
      </section>

      <section aria-labelledby="how-heading" className="container-page py-16">
        <h2 id="how-heading" className="text-3xl font-semibold sm:text-4xl">
          How it works
        </h2>
        <ol className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <motion.li key={title} {...inView(i * 0.08)}>
              <Card className="h-full p-6">
                <div className="flex items-center justify-between">
                  <span
                    className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary"
                    aria-hidden
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="font-display text-3xl font-semibold text-muted" aria-hidden>
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted">{body}</p>
              </Card>
            </motion.li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="pain-heading" className="border-y border-border bg-surface py-16">
        <div className="container-page">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Built for the hard parts
          </p>
          <h2 id="pain-heading" className="mt-2 max-w-2xl text-3xl font-semibold sm:text-4xl">
            Four things that make scholarships hard — and what Grantly does about each
          </h2>
          <ul className="mt-10 grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-2">
            {PAIN_POINTS.map(({ icon: Icon, problem, feature, body, to, cta }, i) => (
              <motion.li key={problem} {...inView(i * 0.06)} className="flex gap-4">
                <span
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent-soft text-ink"
                  aria-hidden
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-medium text-muted">{problem}</p>
                  <h3 className="text-xl font-semibold">{feature}</h3>
                  <p className="mt-1 text-sm text-muted">{body}</p>
                  <Link
                    to={to}
                    className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                  >
                    {cta} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="gap-spotlight" className="container-page py-16">
        <Card className="grid grid-cols-1 items-center gap-8 overflow-hidden p-6 sm:p-10 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              Only on Grantly
            </p>
            <h2 id="gap-spotlight" className="mt-2 text-3xl font-semibold sm:text-4xl">
              Know exactly how much is still missing
            </h2>
            <p className="mt-3 text-muted">
              Tell us what a year of study costs you. The Funding Gap Meter adds up what you’ve won,
              what’s pending and what you’re preparing — then suggests the best-matched scholarships
              to close the rest.
            </p>
            <div className="mt-6">{primaryCta}</div>
          </div>
          <motion.div {...inView()} aria-hidden className="rounded-2xl bg-surface-2 p-6">
            <p className="font-display text-4xl font-semibold">
              ₹1.4L <span className="text-muted">of</span> ₹1.8L
            </p>
            <p className="text-sm text-muted">could be covered · ₹44K gap</p>
            <div className="mt-5 flex h-4 overflow-hidden rounded-full border border-dashed border-muted/50">
              <div className="w-[14%] bg-primary" />
              <div className="w-[20%] border-l-2 border-surface-2 bg-primary/55" />
              <div className="w-[42%] border-l-2 border-surface-2 bg-accent" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              {[
                ['Won', '₹25K', 'bg-primary'],
                ['Submitted', '₹36K', 'bg-primary/55'],
                ['Preparing', '₹75K', 'bg-accent'],
                ['Gap', '₹44K', 'border border-dashed border-muted'],
              ].map(([l, v, c]) => (
                <div key={l}>
                  <span className="flex items-center gap-1.5 text-xs text-muted">
                    <span className={`h-2.5 w-2.5 rounded-full ${c}`} /> {l}
                  </span>
                  <span className="font-semibold">{v}</span>
                </div>
              ))}
            </div>
            <p className="mt-5 flex items-center gap-2 rounded-xl bg-surface p-3 text-sm">
              <CalendarClock className="h-4 w-4 shrink-0 text-accent" />
              <span>
                Apply to <strong>Code for Tomorrow</strong> to close it
              </span>
            </p>
          </motion.div>
        </Card>
      </section>
    </>
  );
}

function Stat({
  label,
  children,
  accent,
}: {
  label: string;
  children: ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col p-6 text-center">
      <dt className="order-2 mt-1 text-sm text-muted">{label}</dt>
      <dd
        className={`tabular order-1 font-display text-4xl font-semibold ${accent ? 'text-danger' : ''}`}
      >
        {children}
      </dd>
    </div>
  );
}
