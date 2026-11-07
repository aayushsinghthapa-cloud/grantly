import { cn } from '@/lib/cn';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('relative overflow-hidden rounded-xl bg-surface-2', className)} aria-hidden>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-surface/60 to-transparent" />
    </div>
  );
}

/** Generic page-level fallback used while lazy routes load. */
export function PageSkeleton() {
  return (
    <div className="container-page py-10" role="status" aria-label="Loading page">
      <Skeleton className="h-10 w-2/3 max-w-md" />
      <Skeleton className="mt-3 h-5 w-1/2 max-w-sm" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-44" />
        ))}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
