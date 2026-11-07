import { useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDashed,
  Keyboard,
  Lock,
  MonitorSmartphone,
} from 'lucide-react';
import { buttonClasses } from '@/components/ui';
import { GapPanel, MatchMini } from '@/components/landing/surfaces';
import { RulesPanel, SeasonAct } from '@/components/landing/acts';
import { StartForm } from '@/components/landing/StartForm';
import { UrgencyChip } from '@/components/scholarship/UrgencyChip';
import { SCHOLARSHIPS, getScholarship } from '@/data/scholarships';
import { DEMO_PROFILE, buildDemoSeed } from '@/data/demoProfile';
import { STATUS_LABEL } from '@/data/constants';
import { PROBLEM_STATEMENT, REQUIREMENTS } from '@/data/brief';
import { useAppStore } from '@/store/app';
import { toast } from '@/store/toast';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { getMatch } from '@/lib/match';
import { getReadiness } from '@/lib/readiness';
import { daysLeft, isClosed } from '@/lib/deadline';
import { formatINR } from '@/lib/format';
import { mountScrollCraft } from '@/vendor/scrollcraft';
import { cn } from '@/lib/cn';
import '@/styles/scrollcraft.css';

/*
 * Landing page. Plan: docs/scrollcraft/builds/grantly-landing/BRIEF.md.
 *
 * Every panel is real product markup computing from the labelled sample student.
 * Progressive enhancement throughout: all content renders complete by default (for
 * crawlers, screenshots, pre-rendered HTML and reduced motion); animation only plays for
 * a visitor who scrolls. The scrollcraft engine drives the hero parallax/tilt, the pinned
 * signature act and the document wipe; it is destroyed on unmount.
 */

const PAIN_IDS = ['finding', 'understanding', 'applying', 'tracking'] as const;
/** The four pain points from the problem statement, worded from the shared requirements checklist. */
const PAIN_POINTS = REQUIREMENTS.slice(0, 4).map((r, i) => ({
  id: PAIN_IDS[i],
  problem: r.need,
  answer: r.answer,
}));

export default function LandingPage() {
  useDocumentTitle('');
  const rootRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const hasOwnProfile = useAppStore((s) => s.profile !== null && !s.isDemo);
  const loadDemo = useAppStore((s) => s.loadDemo);
  const navigate = useNavigate();

  useEffect(() => {
    if (!rootRef.current) return;
    const engine = mountScrollCraft(rootRef.current);
    // Re-measure once web fonts settle so pinned spans are exact.
    document.fonts?.ready.then(() => engine.layout());
    return () => engine.destroy();
  }, []);

  const matches = useMemo(
    () =>
      SCHOLARSHIPS.filter((s) => !isClosed(s.deadline))
        .map((s) => ({ scholarship: s, match: getMatch(DEMO_PROFILE, s) }))
        .filter(({ match }) => match.eligible)
        .sort((a, b) => b.match.score - a.match.score),
    [],
  );

  const tryDemo = () => {
    loadDemo();
    toast({
      title: 'Demo profile loaded',
      description: `Exploring as ${DEMO_PROFILE.name}`,
      tone: 'success',
    });
    navigate('/dashboard');
  };

  const scrollRail = (dir: 1 | -1) =>
    railRef.current?.scrollBy({
      left: dir * railRef.current.clientWidth * 0.8,
      behavior: 'smooth',
    });

  const heroFront = matches.find((m) => m.scholarship.id === 'future-engineers-merit')!;
  const heroBack = matches.filter((m) => m.scholarship.id !== 'future-engineers-merit').slice(0, 2);

  return (
    <div ref={rootRef} className="sc-root">
      {/* ------------------------------------------------------------------ Hero */}
      <section data-sc-act="flow" className="relative overflow-x-clip">
        <div className="container-page grid min-h-[calc(100svh-3.5rem)] grid-cols-1 items-center gap-12 py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16 lg:py-10">
          <div className="max-w-xl">
            <p className="mb-5 text-[13px] font-semibold text-primary">
              GRANTLY · Unified Scholarship Discovery &amp; Management Platform
            </p>
            <h1 className="text-balance text-[2.75rem] font-semibold leading-[1.02] tracking-[-0.04em] sm:text-6xl lg:text-[4.25rem]">
              Scholarships, <span className="text-muted">finally simple.</span>
            </h1>
            <p className="mt-6 max-w-md text-pretty text-lg leading-relaxed text-muted sm:text-xl">
              One profile. GRANTLY finds the scholarships you qualify for, explains why, guides each
              application and tracks every deadline.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Link
                to={hasOwnProfile ? '/dashboard' : '/onboarding'}
                className={buttonClasses('primary', 'lg')}
              >
                {hasOwnProfile ? 'Open dashboard' : 'Get started'}
              </Link>
              <button
                type="button"
                onClick={tryDemo}
                className="group inline-flex items-center gap-1 rounded-full text-base font-medium text-primary"
              >
                Try the demo
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-200 ease-apple group-hover:translate-x-0.5"
                  aria-hidden
                />
              </button>
            </div>
          </div>

          <figure
            className="relative mx-auto h-[22rem] w-full max-w-[34rem] sm:h-[31rem]"
            aria-label="Live preview of GRANTLY with a sample student"
          >
            <div
              data-sc-parallax="-1.2"
              className="absolute right-0 top-0 hidden w-[86%] origin-top-right scale-[0.88] grid-cols-2 gap-3 opacity-60 blur-[0.6px] sm:grid"
              aria-hidden
            >
              {heroBack.map((m) => (
                <MatchMini key={m.scholarship.id} {...m} linked={false} minimal />
              ))}
            </div>
            <div
              data-sc-parallax="-0.45"
              className="absolute right-0 top-0 w-[94%] sm:left-[4%] sm:right-auto sm:top-[27%] sm:w-[92%]"
            >
              <GapPanel step={2} showList={false} />
            </div>
            <div data-sc-parallax="0.6" className="absolute bottom-0 left-0 w-[70%] sm:w-[58%]">
              <div data-sc-tilt="6">
                <MatchMini {...heroFront} className="shadow-lift" />
              </div>
            </div>
            <figcaption className="absolute -bottom-9 right-0 text-xs text-muted">
              Sample student: {DEMO_PROFILE.name}, {DEMO_PROFILE.level.toLowerCase()} in{' '}
              {DEMO_PROFILE.field.toLowerCase()}
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ------------------------------------------------- The problem, the answer */}
      <section aria-labelledby="problem-heading" className="py-24 sm:py-32">
        <div className="container-page">
          <h2
            id="problem-heading"
            className="max-w-3xl text-balance text-[2rem] leading-[1.08] sm:text-5xl"
          >
            <span className="block">Thirty portals.</span>
            <span className="block text-muted">Rules written for lawyers.</span>
            <span className="block">Deadlines you hear about a day late.</span>
          </h2>
          <figure className="mt-8 max-w-2xl">
            <blockquote className="text-pretty border-l-2 border-primary pl-4 text-[17px] leading-relaxed">
              {PROBLEM_STATEMENT}
            </blockquote>
            <figcaption className="mt-2 pl-4 text-sm text-muted">The problem statement</figcaption>
          </figure>
          <h3 className="mt-14 text-xl font-semibold">How GRANTLY solves each part</h3>
          <dl className="mt-6 grid grid-cols-1 gap-x-10 gap-y-8 border-t border-border pt-8 sm:grid-cols-2 lg:grid-cols-4">
            {PAIN_POINTS.map((p) => (
              <div key={p.id}>
                <dt>
                  <a
                    href={`#${p.id}`}
                    className="flex items-center gap-2 text-lg font-semibold hover:underline"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                    {p.problem}
                  </a>
                </dt>
                <dd className="mt-1.5 text-pretty text-[15px] leading-relaxed text-muted">
                  {p.answer}
                </dd>
              </div>
            ))}
          </dl>
          <Link
            to="/requirements"
            className="group mt-10 inline-flex items-center gap-1 font-medium text-primary"
          >
            See the full requirements checklist
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 ease-apple group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
        </div>
      </section>

      {/* ---------------------------------------------------------------- Finding */}
      <section
        id="finding"
        aria-labelledby="finding-heading"
        className="scroll-mt-16 py-16 sm:py-24"
      >
        <div className="container-page flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <p className="text-[13px] font-semibold text-primary">Finding</p>
            <h2
              id="finding-heading"
              className="mt-2 text-balance text-[2rem] leading-[1.05] sm:text-5xl"
            >
              {matches.length} matches for Ananya, sorted by fit.
            </h2>
            <p className="mt-4 text-pretty text-[17px] leading-relaxed text-muted">
              Search, seven filters and a match score on every scholarship. Near-misses stay visible
              too, because some only miss by a few marks.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => scrollRail(-1)}
              aria-label="Previous matches"
              className="grid h-10 w-10 place-items-center rounded-full bg-surface shadow-soft ring-1 ring-border/70 transition-transform hover:bg-surface-2 active:scale-95"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => scrollRail(1)}
              aria-label="Next matches"
              className="grid h-10 w-10 place-items-center rounded-full bg-surface shadow-soft ring-1 ring-border/70 transition-transform hover:bg-surface-2 active:scale-95"
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>
        <div
          ref={railRef}
          role="region"
          aria-label="Matches for the sample student (scrolls sideways)"
          tabIndex={0}
          className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-6 pl-[max(1rem,calc((100vw-80rem)/2+2rem))] pr-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {matches.slice(0, 8).map((m) => (
            <div key={m.scholarship.id} className="w-[16.5rem] shrink-0 snap-start sm:w-[19rem]">
              <MatchMini {...m} className="min-h-[11.5rem]" />
            </div>
          ))}
          <div className="flex w-[16rem] shrink-0 snap-start flex-col justify-center pl-2">
            <Link
              to="/discover"
              className="group inline-flex items-center gap-1 text-lg font-medium text-primary"
            >
              See all in Discover
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 ease-apple group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- Understanding */}
      <section
        id="understanding"
        aria-labelledby="understanding-heading"
        className="scroll-mt-16 py-16 sm:py-24"
      >
        <div className="container-page grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:gap-20">
          <div className="max-w-md">
            <p className="text-[13px] font-semibold text-primary">Understanding</p>
            <h2
              id="understanding-heading"
              className="mt-2 text-balance text-[2rem] leading-[1.05] sm:text-5xl"
            >
              Every rule, checked against you.
            </h2>
            <p className="mt-4 text-pretty text-[17px] leading-relaxed text-muted">
              No more decoding eligibility. Each scholarship explains, in plain words, exactly why
              you do or don’t qualify. Jargon like “bonafide certificate” has a tooltip, and Compare
              puts up to three side by side.
            </p>
          </div>
          <RulesPanel />
        </div>
      </section>

      {/* --------------------------------------------------------------- Applying */}
      <DocumentsSection />

      {/* --------------------------------------------------------------- Tracking */}
      <TrackingSection />

      {/* ---------------------------------------------------------- Signature act */}
      <section className="pb-10 pt-20 sm:pt-28">
        <p className="container-page mx-auto max-w-3xl text-balance text-center text-[1.75rem] font-semibold leading-[1.15] tracking-[-0.03em] text-muted sm:text-[2.6rem]">
          Finding the money is half of it.{' '}
          <span className="text-ink">Paying for the whole year is the rest.</span>
        </p>
      </section>
      <SeasonAct />

      {/* ---------------------------------------------------- Built for everyone */}
      <section aria-labelledby="everyone-heading" className="py-20 sm:py-28">
        <div className="container-page">
          <h2
            id="everyone-heading"
            className="max-w-2xl text-balance text-[2rem] leading-[1.05] sm:text-5xl"
          >
            Built for every student, on every screen.
          </h2>
          <ul className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-[1.2fr_1fr_1fr]">
            <li className="flex gap-4">
              <Keyboard className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden />
              <p className="text-pretty text-[15px] leading-relaxed text-muted">
                <strong className="block text-base text-ink">
                  Keyboard and screen-reader ready
                </strong>
                Every action works without a mouse, including drag-and-drop on the tracker. WCAG AA
                contrast in light and dark, with zero automated accessibility violations.
              </p>
            </li>
            <li className="flex gap-4">
              <MonitorSmartphone className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden />
              <p className="text-pretty text-[15px] leading-relaxed text-muted">
                <strong className="block text-base text-ink">Phone to desktop</strong>
                Designed for 360px phones up, with a bottom tab bar, filter sheet and stacked
                tracker on mobile.
              </p>
            </li>
            <li className="flex gap-4">
              <Lock className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden />
              <p className="text-pretty text-[15px] leading-relaxed text-muted">
                <strong className="block text-base text-ink">Private by design</strong>
                No account and no server. Your profile and documents never leave your device.
              </p>
            </li>
          </ul>
        </div>
      </section>

      {/* ------------------------------------------------------------------ Close */}
      <section
        className="border-t border-border pb-28 pt-20 sm:pb-40"
        aria-labelledby="start-heading"
      >
        <div className="container-page text-center">
          <h2 id="start-heading" className="text-balance text-[2.25rem] leading-[1.05] sm:text-6xl">
            Start with two answers.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-pretty text-[17px] text-muted">
            The rest of your profile takes about a minute. Nothing leaves your device.
          </p>
          <StartForm />
        </div>
      </section>
    </div>
  );
}

/** Applying: the messy document list wipes into the ready one as the section crosses the screen. */
function DocumentsSection() {
  const scholarship = getScholarship('future-engineers-merit')!;
  const before = useMemo(() => getReadiness(scholarship, buildDemoSeed().vault), [scholarship]);

  const list = (ready: boolean) => (
    <div className="rounded-3xl bg-surface p-5 shadow-lift ring-1 ring-border/70 sm:p-7">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-semibold">Documents for {scholarship.name}</p>
        <p
          className={cn(
            'tabular shrink-0 text-sm font-medium',
            ready ? 'text-primary' : 'text-muted',
          )}
        >
          {ready ? before.total : before.ready.length} of {before.total} ready
        </p>
      </div>
      <ul className="mt-4 space-y-2">
        {scholarship.requiredDocuments.map((doc) => {
          const ok = ready || before.ready.includes(doc);
          const expired = !ready && before.expired.includes(doc);
          const Icon = ok ? CheckCircle2 : expired ? AlertTriangle : CircleDashed;
          const tone = ok ? 'text-primary' : expired ? 'text-danger' : 'text-muted';
          return (
            <li
              key={doc}
              className="flex items-center justify-between gap-3 rounded-2xl bg-surface-2/70 px-3.5 py-2.5 text-sm"
            >
              <span className="flex items-center gap-2.5">
                <Icon className={cn('h-4 w-4', tone)} aria-hidden />
                {doc}
              </span>
              <span className={cn('text-xs font-medium', tone)}>
                {ok ? 'Ready' : expired ? 'Expired' : 'Missing'}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <section
      id="applying"
      data-sc-act="flow"
      className="scroll-mt-16 py-16 sm:py-24"
      aria-labelledby="applying-heading"
    >
      <div className="container-page grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-20">
        <div className="relative order-2 lg:order-1">
          <div aria-hidden>{list(false)}</div>
          <div data-sc-reveal="up" data-sc-reveal-at="0.3 0.6" className="absolute inset-0">
            {list(true)}
          </div>
        </div>
        <div className="order-1 max-w-md lg:order-2">
          <p className="text-[13px] font-semibold text-primary">Applying</p>
          <h2
            id="applying-heading"
            className="mt-2 text-balance text-[2rem] leading-[1.05] sm:text-5xl"
          >
            A roadmap for every application.
          </h2>
          <p className="mt-4 text-pretty text-[17px] leading-relaxed text-muted">
            Each scholarship comes with plain-language steps you can tick off, and a document
            checklist fed by one vault. Mark a document once and every application knows, including
            when it expires.
          </p>
        </div>
      </div>
    </section>
  );
}

/** Tracking: the sample student's real tracker, soonest deadline first. */
function TrackingSection() {
  const rows = useMemo(() => {
    const { tracker } = buildDemoSeed();
    return Object.entries(tracker)
      .map(([id, entry]) => ({ s: getScholarship(id)!, status: entry.status }))
      .filter(({ s }) => s && daysLeft(s.deadline) >= 0)
      .sort((a, b) => daysLeft(a.s.deadline) - daysLeft(b.s.deadline));
  }, []);

  return (
    <section
      id="tracking"
      aria-labelledby="tracking-heading"
      className="scroll-mt-16 py-16 sm:py-24"
    >
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[13px] font-semibold text-primary">Tracking</p>
          <h2
            id="tracking-heading"
            className="mt-2 text-balance text-[2rem] leading-[1.05] sm:text-5xl"
          >
            Never hear about a deadline a day late.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-[17px] leading-relaxed text-muted">
            A drag-and-drop board from saved to won, a deadline radar coloured by urgency, a list of
            what needs action this week, and one-click export to your calendar.
          </p>
        </div>
        <div className="mx-auto mt-10 max-w-3xl rounded-3xl bg-surface p-3 shadow-lift ring-1 ring-border/70 sm:p-4">
          <ul className="divide-y divide-border">
            {rows.map(({ s, status }) => (
              <li
                key={s.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 px-3 py-3.5 sm:flex-nowrap"
              >
                <Link
                  to={`/scholarship/${s.id}`}
                  className="min-w-0 flex-1 font-medium hover:underline"
                >
                  {s.name}
                </Link>
                <span className="tabular text-sm text-muted">{formatINR(s.amount)}</span>
                <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium">
                  {STATUS_LABEL[status]}
                </span>
                <UrgencyChip deadline={s.deadline} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
