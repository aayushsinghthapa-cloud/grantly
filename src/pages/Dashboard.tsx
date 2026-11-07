import { Link, useNavigate } from 'react-router-dom';
import { Compass, FileCheck2, Send, Trophy, Wand2, Bookmark } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, Card, EmptyState, buttonClasses } from '@/components/ui';
import { FundingGapMeter } from '@/components/dashboard/FundingGapMeter';
import { DeadlineRadar } from '@/components/dashboard/DeadlineRadar';
import { ActionNeeded } from '@/components/dashboard/ActionNeeded';
import { useTrackedItems } from '@/hooks/useMatches';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useAppStore } from '@/store/app';
import { toast } from '@/store/toast';
import { DOC_TYPES } from '@/data/constants';
import { isDocReady } from '@/lib/readiness';
import { daysLeft } from '@/lib/deadline';
import { formatINRCompact } from '@/lib/format';
import type { ReactNode } from 'react';

function greeting(hour = new Date().getHours()) {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  useDocumentTitle('Dashboard');
  const profile = useAppStore((s) => s.profile);
  const vault = useAppStore((s) => s.vault);
  const loadDemo = useAppStore((s) => s.loadDemo);
  const tracked = useTrackedItems();
  const navigate = useNavigate();

  if (!profile) {
    return (
      <div className="container-page pb-16">
        <PageHeader eyebrow="Dashboard" title="Your scholarship dashboard" />
        <EmptyState
          icon={<Compass className="h-6 w-6" />}
          title="Let’s set up your profile first"
          description="Your dashboard shows your funding gap, deadlines and next actions, all personalised to your profile."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/onboarding" className={buttonClasses('primary')}>
                Create my profile
              </Link>
              <Button
                variant="accent"
                leftIcon={<Wand2 className="h-4 w-4" aria-hidden />}
                onClick={() => {
                  loadDemo();
                  toast({ title: 'Demo profile loaded', tone: 'success' });
                  navigate('/dashboard');
                }}
              >
                Try demo profile
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  const count = (status: string) => tracked.filter((t) => t.entry.status === status).length;
  const wonTotal = tracked
    .filter((t) => t.entry.status === 'won')
    .reduce((sum, t) => sum + t.scholarship.amount, 0);
  const docsReady = DOC_TYPES.filter((d) => isDocReady(vault, d)).length;
  const dueThisWeek = tracked.filter((t) => {
    const d = daysLeft(t.scholarship.deadline);
    return (t.entry.status === 'saved' || t.entry.status === 'preparing') && d >= 0 && d <= 7;
  }).length;

  return (
    <div className="container-page pb-16">
      <PageHeader
        eyebrow="Dashboard"
        title={`${greeting()}, ${profile.name.split(' ')[0]}`}
        description={
          dueThisWeek > 0
            ? `You have ${dueThisWeek} application${dueThisWeek === 1 ? '' : 's'} due this week. Let’s get them over the line.`
            : 'No deadlines this week. A good moment to line up your next applications.'
        }
        actions={
          <Link to="/discover?eligible=1" className={buttonClasses('secondary')}>
            <Compass className="h-4 w-4" aria-hidden /> Find more
          </Link>
        }
      />

      <ul className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Quick stats">
        <Stat
          icon={<Bookmark className="h-4 w-4" />}
          label="Tracking"
          value={tracked.length}
          to="/tracker"
        />
        <Stat
          icon={<Send className="h-4 w-4" />}
          label="Submitted"
          value={count('submitted')}
          to="/tracker"
        />
        <Stat
          icon={<Trophy className="h-4 w-4" />}
          label="Won so far"
          value={formatINRCompact(wonTotal)}
          to="/tracker"
        />
        <Stat
          icon={<FileCheck2 className="h-4 w-4" />}
          label="Documents ready"
          value={`${docsReady}/${DOC_TYPES.length}`}
          to="/vault"
        />
      </ul>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="min-w-0 space-y-6">
          <FundingGapMeter />
          <DeadlineRadar />
        </div>
        <div className="min-w-0">
          <ActionNeeded />
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  to,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  to: string;
}) {
  return (
    <li>
      <Card className="h-full p-4 transition-shadow hover:shadow-lift">
        <Link to={to} className="block rounded-lg">
          <span className="flex items-center gap-1.5 text-xs font-medium text-muted">
            <span className="text-primary" aria-hidden>
              {icon}
            </span>
            {label}
          </span>
          <span className="tabular mt-1 block font-display text-2xl font-semibold sm:text-3xl">
            {value}
          </span>
        </Link>
      </Card>
    </li>
  );
}
