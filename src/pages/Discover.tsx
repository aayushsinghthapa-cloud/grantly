import { useDeferredValue, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SearchX, SlidersHorizontal, Search, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, EmptyState, Input, Select, Sheet, buttonClasses } from '@/components/ui';
import { FilterPanel } from '@/components/discover/FilterPanel';
import { ScholarshipCard } from '@/components/scholarship/ScholarshipCard';
import { CompareTray } from '@/components/scholarship/CompareTray';
import { SCHOLARSHIPS } from '@/data/scholarships';
import { useMatches } from '@/hooks/useMatches';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useAppStore } from '@/store/app';
import { createScholarshipSearch } from '@/lib/search';
import {
  DEFAULT_FILTERS,
  applyFilters,
  countActiveFilters,
  sortItems,
  type DiscoverFilters,
  type SortKey,
} from '@/lib/filters';

const search = createScholarshipSearch(SCHOLARSHIPS);

export default function DiscoverPage() {
  useDocumentTitle('Discover');
  const [params] = useSearchParams();
  const hasProfile = useAppStore((s) => s.profile !== null);
  const items = useMatches();

  const [query, setQuery] = useState(params.get('q') ?? '');
  const deferredQuery = useDeferredValue(query);
  const [filters, setFilters] = useState<DiscoverFilters>(() => ({
    ...DEFAULT_FILTERS,
    eligibleOnly: hasProfile && params.get('eligible') === '1',
  }));
  const [sort, setSort] = useState<SortKey>(hasProfile ? 'match' : 'deadline');
  const [sheetOpen, setSheetOpen] = useState(false);

  const results = useMemo(
    () => sortItems(applyFilters(items, filters, search(deferredQuery)), sort),
    [items, filters, deferredQuery, sort],
  );
  const activeCount = countActiveFilters(filters);
  const resetAll = () => {
    setFilters(DEFAULT_FILTERS);
    setQuery('');
  };

  const sortOptions = [
    { value: 'match', label: hasProfile ? 'Best match' : 'Best match (needs profile)' },
    { value: 'deadline', label: 'Deadline: soonest' },
    { value: 'amount', label: 'Amount: highest' },
  ];

  return (
    <div className="container-page">
      <PageHeader
        eyebrow="Discover"
        title="Find scholarships that fit you"
        description={`${SCHOLARSHIPS.length} scholarships, scored against your profile and explained in plain language.`}
      />

      {!hasProfile && (
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-accent/40 bg-accent-soft p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2 text-sm">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>
              <strong>See your match score on every scholarship.</strong> It takes about a minute,
              or try the demo profile.
            </span>
          </p>
          <Link to="/onboarding" className={buttonClasses('primary', 'sm')}>
            Create my profile
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[17rem_minmax(0,1fr)]">
        <aside aria-labelledby="filters-heading" className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto pb-6 pr-1">
            <h2 id="filters-heading" className="mb-4 text-lg font-semibold">
              Filters
            </h2>
            <FilterPanel filters={filters} onChange={setFilters} hasProfile={hasProfile} />
          </div>
        </aside>

        <section aria-labelledby="results-heading" className="min-w-0">
          <h2 id="results-heading" className="sr-only">
            Results
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <Input
              label="Search scholarships"
              hideLabel
              type="search"
              placeholder="Search by name, provider, field…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
              wrapperClassName="flex-1"
            />
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="flex-1 lg:hidden"
                onClick={() => setSheetOpen(true)}
                leftIcon={<SlidersHorizontal className="h-4 w-4" aria-hidden />}
              >
                Filters
                {activeCount > 0 && (
                  <span className="tabular rounded-full bg-primary px-1.5 text-xs text-primary-fg">
                    {activeCount}
                  </span>
                )}
              </Button>
              <Select
                label="Sort by"
                hideLabel
                value={sort}
                options={sortOptions}
                onChange={(e) => setSort(e.target.value as SortKey)}
                wrapperClassName="flex-1 sm:w-52"
              />
            </div>
          </div>

          <p className="mt-4 text-sm text-muted" aria-live="polite" aria-atomic="true">
            Showing <strong className="tabular text-ink">{results.length}</strong> of{' '}
            {SCHOLARSHIPS.length} scholarships
            {filters.eligibleOnly && ' you’re eligible for'}
          </p>

          {results.length === 0 ? (
            <EmptyState
              className="mt-6"
              icon={<SearchX className="h-6 w-6" />}
              title="No scholarships match that"
              description={
                filters.eligibleOnly
                  ? 'Try turning off “Eligible only” to see near-misses. Some only miss by a few marks.'
                  : 'Try a different search term, or loosen a filter or two.'
              }
              action={
                <Button variant="secondary" onClick={resetAll}>
                  Clear search and filters
                </Button>
              }
            />
          ) : (
            <ul className="mt-4 grid grid-cols-1 gap-4 pb-28 sm:grid-cols-2 2xl:grid-cols-3">
              {results.map((item, i) => (
                <motion.li
                  key={item.scholarship.id}
                  layout="position"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(i, 8) * 0.03 }}
                >
                  <ScholarshipCard {...item} />
                </motion.li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Filters"
        footer={
          <Button className="w-full" onClick={() => setSheetOpen(false)}>
            Show {results.length} result{results.length === 1 ? '' : 's'}
          </Button>
        }
      >
        <FilterPanel filters={filters} onChange={setFilters} hasProfile={hasProfile} />
      </Sheet>

      <CompareTray />
    </div>
  );
}
