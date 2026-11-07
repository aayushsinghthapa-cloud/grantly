import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, CalendarClock, RefreshCw, Users, CalendarPlus } from 'lucide-react';
import { Badge, Card, Button } from '@/components/ui';
import { MatchRing } from '@/components/scholarship/MatchRing';
import { UrgencyChip } from '@/components/scholarship/UrgencyChip';
import { WhyYouMatch } from '@/components/scholarship/WhyYouMatch';
import { Roadmap } from '@/components/scholarship/Roadmap';
import { DocumentReadiness } from '@/components/scholarship/DocumentReadiness';
import { StatusSelect } from '@/components/scholarship/StatusSelect';
import { GlossaryTerm } from '@/components/scholarship/GlossaryTerm';
import { ScholarshipCard } from '@/components/scholarship/ScholarshipCard';
import { SCHOLARSHIPS, getScholarship } from '@/data/scholarships';
import { useMatch } from '@/hooks/useMatches';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useAppStore } from '@/store/app';
import { toast } from '@/store/toast';
import { getMatch } from '@/lib/match';
import { getSimilar } from '@/lib/similar';
import { daysLeft, formatDeadline, urgencyFor } from '@/lib/deadline';
import { amountSuffix, formatINR } from '@/lib/format';
import { cn } from '@/lib/cn';
import { downloadCalendar } from '@/lib/ics';
import NotFoundPage from './NotFound';

export default function ScholarshipPage() {
  const { id = '' } = useParams();
  const scholarship = getScholarship(id);
  useDocumentTitle(scholarship?.name ?? 'Scholarship not found');
  const match = useMatch(scholarship);
  const profile = useAppStore((s) => s.profile);
  const inCompare = useAppStore((s) => s.compare.includes(id));
  const toggleCompare = useAppStore((s) => s.toggleCompare);

  const similar = useMemo(
    () =>
      scholarship
        ? getSimilar(scholarship, SCHOLARSHIPS, 6)
            .map((s) => ({ scholarship: s, match: profile ? getMatch(profile, s) : null }))
            // Stable sort keeps similarity order within each group; eligible options come first.
            .sort((a, b) => Number(b.match?.eligible ?? 0) - Number(a.match?.eligible ?? 0))
            .slice(0, 3)
        : [],
    [scholarship, profile],
  );

  if (!scholarship) return <NotFoundPage />;
  const s = scholarship;
  const days = daysLeft(s.deadline);
  const urgency = urgencyFor(days);
  const odds = s.applicants && s.seats ? Math.max(1, Math.round(s.applicants / s.seats)) : null;

  return (
    <div className="container-page pb-16">
      <Link
        to="/discover"
        className="mt-6 inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back to Discover
      </Link>

      {/* Hero */}
      <Card className="mt-4 overflow-hidden">
        <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-sm text-muted">
              <Building2 className="h-4 w-4" aria-hidden />
              {s.provider} · {s.providerType}
            </p>
            <h1 className="mt-2 text-3xl font-semibold leading-tight sm:text-5xl">{s.name}</h1>
            <p className="mt-3 max-w-2xl text-lg text-muted">{s.summary}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {s.categories.map((c) => (
                <Badge key={c} tone="primary">
                  {c}
                </Badge>
              ))}
              {s.renewable && (
                <Badge tone="success">
                  <RefreshCw className="h-3 w-3" aria-hidden />
                  <GlossaryTerm term="Renewable" />
                </Badge>
              )}
              {s.amountType === 'full-tuition' && (
                <Badge tone="accent">
                  <GlossaryTerm term="Full tuition" />
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 lg:flex-col lg:items-end">
            <MatchRing match={match} size={96} />
            <p className="text-sm text-muted lg:text-right">
              {match ? (match.eligible ? 'Your match score' : 'Not eligible yet') : 'Match score'}
            </p>
          </div>
        </div>

        <dl className="grid grid-cols-1 border-t border-border sm:grid-cols-3">
          <div className="border-b border-border p-5 sm:border-b-0 sm:border-r sm:px-8">
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted">Award</dt>
            <dd className="mt-1">
              <span className="tabular font-display text-3xl font-semibold">
                {formatINR(s.amount)}
              </span>{' '}
              <span className="text-sm text-muted">{amountSuffix(s.amountType)}</span>
            </dd>
          </div>
          <div className="border-b border-border p-5 sm:border-b-0 sm:border-r sm:px-8">
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted">Deadline</dt>
            <dd className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span
                className={cn(
                  'tabular font-display text-3xl font-semibold',
                  urgency === 'urgent' && 'text-danger',
                  urgency === 'soon' && 'text-warning',
                )}
              >
                {days < 0 ? 'Closed' : days === 0 ? 'Today' : `${days} day${days === 1 ? '' : 's'}`}
              </span>
              <span className="text-sm text-muted">{formatDeadline(s.deadline)}</span>
            </dd>
          </div>
          <div className="p-5 sm:px-8">
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted">
              Competition
            </dt>
            <dd className="mt-1">
              {odds ? (
                <>
                  <span className="tabular font-display text-3xl font-semibold">1 in {odds}</span>{' '}
                  <span className="text-sm text-muted">selected</span>
                  <span className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                    <Users className="h-3 w-3" aria-hidden />
                    {s.applicants!.toLocaleString('en-IN')} applied for{' '}
                    {s.seats!.toLocaleString('en-IN')} awards last year
                  </span>
                </>
              ) : (
                <span className="text-sm text-muted">Not published</span>
              )}
            </dd>
          </div>
        </dl>

        <div className="flex flex-col gap-4 border-t border-border bg-surface-2/60 p-5 sm:flex-row sm:items-end sm:justify-between sm:px-8">
          <StatusSelect id={s.id} name={s.name} className="sm:w-64" />
          <div className="flex flex-wrap items-center gap-3">
            <UrgencyChip deadline={s.deadline} />
            <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface px-3 text-sm font-medium hover:bg-surface-2">
              <input
                type="checkbox"
                checked={inCompare}
                onChange={() => {
                  if (!toggleCompare(s.id))
                    toast({
                      title: 'Compare is full',
                      description: 'Remove one to add this.',
                      tone: 'danger',
                    });
                }}
                className="h-4 w-4 accent-[rgb(var(--primary))]"
              />
              Add to compare
            </label>
            {inCompare && (
              <Link to="/compare" className="text-sm font-semibold text-primary hover:underline">
                View comparison
              </Link>
            )}
            {days >= 0 && (
              <Button
                variant="secondary"
                size="sm"
                className="h-10"
                leftIcon={<CalendarPlus className="h-4 w-4" aria-hidden />}
                onClick={() => {
                  downloadCalendar([s], `${s.id}-deadline.ics`);
                  toast({
                    title: 'Calendar file downloaded',
                    description: 'Open it to add the deadline with a 3-day reminder.',
                    tone: 'success',
                  });
                }}
              >
                Add to calendar
              </Button>
            )}
          </div>
        </div>
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-6">
          <WhyYouMatch match={match} note={s.eligibility.note} />
          <Roadmap scholarship={s} />
          <Card as="section" aria-labelledby="about-heading" className="p-5 sm:p-6">
            <h2 id="about-heading" className="text-2xl font-semibold">
              About this scholarship
            </h2>
            <p className="mt-3 leading-relaxed text-muted">{s.description}</p>
            <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
              <Fact label="Who can apply" value={s.eligibility.levels.join(', ')} />
              <Fact label="Fields" value={s.eligibility.fields?.join(', ') ?? 'Any field'} />
              <Fact
                label="Minimum marks"
                value={s.eligibility.minPercentage ? `${s.eligibility.minPercentage}%` : 'None'}
              />
              <Fact
                label="Family income limit"
                value={
                  s.eligibility.maxFamilyIncome
                    ? `${formatINR(s.eligibility.maxFamilyIncome)} / year`
                    : 'No limit'
                }
              />
              <Fact label="Where" value={s.eligibility.states?.join(', ') ?? 'All of India'} />
              <Fact
                label="Gender"
                value={s.eligibility.gender === 'Female' ? 'Women only' : 'Everyone'}
              />
            </dl>
          </Card>
        </div>

        <aside
          className="space-y-6 lg:sticky lg:top-24 lg:self-start"
          aria-label="Application checklist"
        >
          <DocumentReadiness scholarship={s} />
          <Card className="flex items-start gap-3 p-5">
            <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
            <p className="text-sm text-muted">
              <strong className="text-ink">Tip:</strong> aim to submit at least 3 days before the
              deadline. Portals often slow down on the final day, and institute verification can
              take time.
            </p>
          </Card>
        </aside>
      </div>

      {similar.length > 0 && (
        <section aria-labelledby="similar-heading" className="mt-12">
          <h2 id="similar-heading" className="text-2xl font-semibold sm:text-3xl">
            Similar scholarships
          </h2>
          <ul className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {similar.map((item) => (
              <li key={item.scholarship.id}>
                <ScholarshipCard {...item} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</dt>
      <dd className="mt-1">{value}</dd>
    </div>
  );
}
