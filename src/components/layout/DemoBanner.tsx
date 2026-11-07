import { Link, useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useAppStore } from '@/store/app';
import { DEMO_PROFILE } from '@/data/demoProfile';

/** Shown on app screens while the visitor is exploring with the sample student. */
export function DemoBanner() {
  const isDemo = useAppStore((s) => s.isDemo);
  const { pathname } = useLocation();
  if (!isDemo || pathname === '/' || pathname === '/onboarding') return null;
  return (
    <aside aria-label="Demo mode" className="border-b border-border/60 bg-primary-soft/70">
      <div className="container-page flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2 text-[13px]">
        <p className="flex items-center gap-2 text-ink">
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
          <span>
            You’re exploring as <strong className="font-semibold">{DEMO_PROFILE.name}</strong>, a
            sample student. Everything works; nothing is real.
          </span>
        </p>
        <Link to="/onboarding" className="font-semibold text-primary hover:underline">
          Use my own details
        </Link>
      </div>
    </aside>
  );
}
