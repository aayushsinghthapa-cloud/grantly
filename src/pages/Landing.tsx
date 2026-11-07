import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ClipboardCheck, Search, UserRoundPen } from 'lucide-react';
import { Badge, Card, ProgressRing, buttonClasses } from '@/components/ui';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const steps = [
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

export default function LandingPage() {
  useDocumentTitle('');
  const reduce = useReducedMotion();
  const fade = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
        };

  return (
    <>
      <section className="container-page grid items-center gap-12 pb-16 pt-12 sm:pt-20 lg:grid-cols-[1.15fr_1fr] lg:pt-24">
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
            className="text-5xl font-semibold leading-[1.05] sm:text-6xl lg:text-7xl"
          >
            Scholarships, <em className="font-normal text-primary">finally</em> simple.
          </motion.h1>
          <motion.p {...fade(0.1)} className="mt-6 max-w-xl text-lg text-muted">
            Grantly finds the scholarships you&apos;re eligible for, explains every rule in plain
            language, and tracks every document and deadline until the money lands.
          </motion.p>
          <motion.div {...fade(0.15)} className="mt-8 flex flex-wrap gap-3">
            <Link to="/onboarding" className={buttonClasses('primary', 'lg')}>
              Find my scholarships
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link to="/discover" className={buttonClasses('secondary', 'lg')}>
              Browse all
            </Link>
          </motion.div>
        </div>

        {/* Preview card illustrating the Match ring + funding bar motifs */}
        <motion.div {...fade(0.2)} aria-hidden className="relative mx-auto w-full max-w-md">
          <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-primary-soft/70" />
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
              <li className="flex gap-2">
                <span className="text-success">✓</span> Undergraduate in Engineering
              </li>
              <li className="flex gap-2">
                <span className="text-success">✓</span> Income ₹4.2L under the ₹6L limit
              </li>
              <li className="flex gap-2">
                <span className="text-success">✓</span> 86% marks above the 75% minimum
              </li>
            </ul>
            <div className="mt-6">
              <div className="flex justify-between text-xs text-muted">
                <span>Funding covered</span>
                <span className="tabular">₹1.2L of ₹1.8L</span>
              </div>
              <div className="mt-2 flex h-3 overflow-hidden rounded-full bg-surface-2">
                <div className="w-[45%] bg-primary" />
                <div className="w-[22%] bg-accent" />
              </div>
            </div>
          </Card>
        </motion.div>
      </section>

      <section aria-labelledby="how-heading" className="container-page py-12">
        <h2 id="how-heading" className="text-3xl font-semibold sm:text-4xl">
          How it works
        </h2>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, body }, i) => (
            <li key={title}>
              <Card className="h-full p-6">
                <div className="flex items-center justify-between">
                  <span
                    className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary"
                    aria-hidden
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="font-display text-3xl font-semibold text-border" aria-hidden>
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted">{body}</p>
              </Card>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
