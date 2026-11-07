import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('h-8 w-8', className)} aria-hidden>
      <rect width="32" height="32" rx="9" className="fill-primary" />
      <circle cx="16" cy="16" r="9" fill="none" strokeWidth="3" className="stroke-primary-fg/25" />
      <path
        d="M16 7a9 9 0 0 1 8.6 11.7"
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
        className="stroke-accent"
      />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      className={cn('inline-flex items-center gap-2 rounded-lg', className)}
      aria-label="Grantly home"
    >
      <LogoMark />
      <span className="font-display text-xl font-semibold tracking-tight">Grantly</span>
    </Link>
  );
}
