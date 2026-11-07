import { useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, CircleDashed, AlertTriangle } from 'lucide-react';
import { buttonClasses } from '@/components/ui';
import { GapPanel, MatchMini } from '@/components/landing/surfaces';
import { RulesAct, SeasonAct } from '@/components/landing/acts';
import { StartForm } from '@/components/landing/StartForm';
import { SCHOLARSHIPS, getScholarship } from '@/data/scholarships';
import { DEMO_PROFILE, buildDemoSeed } from '@/data/demoProfile';
import { useAppStore } from '@/store/app';
import { toast } from '@/store/toast';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { getMatch } from '@/lib/match';
import { getReadiness } from '@/lib/readiness';
import { isClosed } from '@/lib/deadline';
import { mountScrollCraft } from '@/vendor/scrollcraft';
import { cn } from '@/lib/cn';
import '@/styles/scrollcraft.css';

/*
 * Landing page, built with the scroll-craft method (grammar: Live surface).
 * Plan and rationale: docs/scrollcraft/builds/grantly-landing/BRIEF.md.
 *
 * Every panel is real product markup computing from the labelled sample student.
 * The scrollcraft engine drives the data-sc-* devices (parallax, tilt, pin, pan,
 * reveal, flow reveals); bespoke behaviour lives in the acts and reads the same
 * scroll progress. The engine is mounted on this subtree and destroyed on unmount.
 */
export default function LandingPage() {
  useDocumentTitle('');
  const rootRef = useRef<HTMLDivElement>(null);
  const hasProfile = useAppStore((s) => s.profile !== null);
  const loadDemo = useAppStore((s) => s.loadDemo);
  const navigate = useNavigate();

  useEffect(() => {
    if (!rootRef.current) return;
    const engine = mountScrollCraft(rootRef.current);
    // Re-measure once web fonts settle so pinned spans and rail widths are exact.
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

  const heroFront = matches.find((m) => m.scholarship.id === 'future-engineers-merit')!;
  const heroBack = matches.filter((m) => m.scholarship.id !== 'future-engineers-merit').slice(0, 2);

  return (
    <div ref={rootRef} className="sc-root">
      {/* ---------------------------------------------------------- 1 Hero --
          Parallax: three real panels at different depths. Copy rides at 1x. */}
      <section data-sc-act="flow" className="relative overflow-x-clip">
        <div className="container-page grid min-h-[calc(100svh-3.5rem)] grid-cols-1 items-center gap-12 py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16 lg:py-10">
          <div className="max-w-xl">
            <h1 className="text-balance text-[2.75rem] font-semibold leading-[1.02] tracking-[-0.04em] sm:text-6xl lg:text-[4.25rem]">
              Scholarships, <span className="text-muted">finally simple.</span>
            </h1>
            <p className="mt-6 max-w-md text-pretty text-lg leading-relaxed text-muted sm:text-xl">
              One profile. Grantly finds what you qualify for, explains why, and tracks every
              deadline.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Link
                to={hasProfile ? '/dashboard' : '/onboarding'}
                className={buttonClasses('primary', 'lg')}
              >
                {hasProfile ? 'Open dashboard' : 'Get started'}
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
            aria-label="Live preview with a sample student"
          >
            {/* back plane: further away, so smaller, softer and lower contrast */}
            <div
              data-sc-parallax="-1.2"
              className="absolute right-0 top-0 hidden w-[86%] origin-top-right scale-[0.88] grid-cols-2 gap-3 opacity-60 blur-[0.6px] sm:grid"
              aria-hidden
            >
              {heroBack.map((m) => (
                <MatchMini key={m.scholarship.id} {...m} linked={false} minimal />
              ))}
            </div>
            {/* mid plane: the funding panel, mid-season */}
            <div
              data-sc-parallax="-0.45"
              className="absolute right-0 top-0 w-[94%] sm:left-[4%] sm:right-auto sm:top-[27%] sm:w-[92%]"
            >
              <GapPanel step={2} showList={false} />
            </div>
            {/* front plane: overlaps the panel; moves faster and tilts toward the pointer */}
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

      {/* ------------------------------------------------------- 2 Tension --
          Flow + in. The mess, named plainly. Anchored right. */}
      <section className="py-24 sm:py-36">
        <div className="container-page flex justify-end">
          <div className="max-w-3xl" data-sc-in data-sc-stagger="70">
            <h2 className="text-balance text-[2rem] leading-[1.08] sm:text-5xl">
              <span className="block">Thirty portals.</span>
              <span className="block text-muted">Rules written for lawyers.</span>
              <span className="block">Deadlines you hear about a day late.</span>
            </h2>
            <p className="mt-6 max-w-lg text-pretty text-[17px] leading-relaxed text-muted">
              Students miss money they already qualify for, because finding it, understanding it and
              keeping track of it is a part-time job.
            </p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- 3 Turn -- */}
      <RulesAct />

      {/* --------------------------------------------------------- 4 Range --
          Pan: sideways reads as breadth. Heading is the rail's first item. */}
      <section
        data-sc-act="pan"
        data-sc-span="3"
        aria-labelledby="range-heading"
        className="relative"
      >
        <div data-sc-stage className="flex items-center">
          <div
            data-sc-pan="0.06"
            className="items-stretch gap-4 pl-[max(1rem,calc((100vw-80rem)/2+2rem))] pr-[8vw] pt-14"
          >
            <div className="flex w-[18rem] shrink-0 flex-col justify-center pr-6 sm:w-[22rem]">
              <h2
                id="range-heading"
                className="text-balance text-[2rem] leading-[1.05] sm:text-5xl"
              >
                {matches.length} matches for Ananya.
              </h2>
              <p className="mt-4 text-[17px] text-muted">
                Sorted by how well they fit her, not by who paid to be first.
              </p>
            </div>
            {matches.slice(0, 7).map((m) => (
              <div key={m.scholarship.id} className="w-[16.5rem] shrink-0 sm:w-[19rem]">
                <MatchMini {...m} className="min-h-[11.5rem]" />
              </div>
            ))}
            <div className="flex w-[17rem] shrink-0 flex-col justify-center pl-4">
              <p className="text-pretty text-xl font-medium">
                Plus the near-misses. Some only miss by a few marks.
              </p>
              <Link
                to="/discover"
                className="group mt-3 inline-flex items-center gap-1 font-medium text-primary"
              >
                Open Discover
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-200 ease-apple group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- 5 Breath --
          Authored silence before the peak. */}
      <section className="py-28 sm:py-44">
        <p
          data-sc-in
          className="container-page mx-auto max-w-3xl text-balance text-center text-[1.75rem] font-semibold leading-[1.15] tracking-[-0.03em] text-muted sm:text-[2.6rem]"
        >
          Finding the money is half of it.{' '}
          <span className="text-ink">Paying for the whole year is the rest.</span>
        </p>
      </section>

      {/* ---------------------------------------------------------- 6 Peak -- */}
      <SeasonAct />

      {/* --------------------------------------------------------- 7 Order -- */}
      <DocumentsAct />

      {/* ---------------------------------------------------- 8 Commitment --
          The close is a real input. */}
      <section className="pb-28 pt-12 sm:pb-40" aria-labelledby="start-heading">
        <div className="container-page text-center" data-sc-in data-sc-stagger="60">
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

/** Reveal: a wipe is a change of state. The messy list becomes the ready one. */
function DocumentsAct() {
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
    <section data-sc-act="flow" className="py-24 sm:py-36" aria-labelledby="docs-heading">
      <div className="container-page grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-20">
        <div className="relative">
          <div aria-hidden>{list(false)}</div>
          {/* The ready state wipes up over the messy one as the section crosses the screen. */}
          <div data-sc-reveal="up" data-sc-reveal-at="0.32 0.62" className="absolute inset-0">
            {list(true)}
          </div>
        </div>
        <div className="max-w-md" data-sc-in data-sc-stagger="70">
          <h2 id="docs-heading" className="text-balance text-[2rem] leading-[1.05] sm:text-5xl">
            Documents, sorted once.
          </h2>
          <p className="mt-4 text-pretty text-[17px] leading-relaxed text-muted">
            Mark what you have in one vault. Every application shows what’s ready, what’s missing
            and what expired, before the deadline does.
          </p>
        </div>
      </div>
    </section>
  );
}
