import type { ReactNode } from 'react';
import { Chip, Select, Switch } from '@/components/ui';
import { CATEGORIES, EDUCATION_LEVELS, PROVIDER_TYPES } from '@/data/constants';
import { DEFAULT_FILTERS, countActiveFilters, type DiscoverFilters } from '@/lib/filters';

interface FilterPanelProps {
  filters: DiscoverFilters;
  onChange: (next: DiscoverFilters) => void;
  hasProfile: boolean;
}

const AMOUNT_OPTIONS = [
  { value: '0', label: 'Any amount' },
  { value: '25000', label: '₹25,000 or more' },
  { value: '50000', label: '₹50,000 or more' },
  { value: '100000', label: '₹1,00,000 or more' },
  { value: '200000', label: '₹2,00,000 or more' },
];

const DEADLINE_OPTIONS = [
  { value: 'any', label: 'Any time' },
  { value: '7', label: 'Next 7 days' },
  { value: '30', label: 'Next 30 days' },
  { value: '90', label: 'Next 90 days' },
];

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function Group({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset className="border-t border-border pt-5">
      <legend className="float-left mb-3 w-full text-[13px] font-semibold text-ink">
        {legend}
      </legend>
      <div className="clear-both flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

/** Shared by the desktop sidebar and the mobile bottom sheet. */
export function FilterPanel({ filters: f, onChange, hasProfile }: FilterPanelProps) {
  const set = (patch: Partial<DiscoverFilters>) => onChange({ ...f, ...patch });
  const active = countActiveFilters(f);

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        <Switch
          label="Eligible only"
          description={
            hasProfile ? 'Hide scholarships you don’t qualify for' : 'Create a profile to use this'
          }
          checked={f.eligibleOnly}
          disabled={!hasProfile}
          onChange={(eligibleOnly) => set({ eligibleOnly })}
        />
        <Switch
          label="Hide closed"
          checked={f.hideClosed}
          onChange={(hideClosed) => set({ hideClosed })}
        />
      </div>

      <Group legend="Category">
        {CATEGORIES.map((c) => (
          <Chip
            key={c}
            selected={f.categories.includes(c)}
            onClick={() => set({ categories: toggle(f.categories, c) })}
          >
            {c}
          </Chip>
        ))}
      </Group>

      <Group legend="Education level">
        {EDUCATION_LEVELS.map((l) => (
          <Chip
            key={l}
            selected={f.levels.includes(l)}
            onClick={() => set({ levels: toggle(f.levels, l) })}
          >
            {l}
          </Chip>
        ))}
      </Group>

      <Group legend="Provider">
        {PROVIDER_TYPES.map((p) => (
          <Chip
            key={p}
            selected={f.providerTypes.includes(p)}
            onClick={() => set({ providerTypes: toggle(f.providerTypes, p) })}
          >
            {p}
          </Chip>
        ))}
      </Group>

      <div className="grid gap-4 border-t border-border pt-5">
        <Select
          label="Award amount"
          value={String(f.minAmount)}
          options={AMOUNT_OPTIONS}
          onChange={(e) => set({ minAmount: Number(e.target.value) })}
        />
        <Select
          label="Deadline"
          value={f.deadlineWithin === null ? 'any' : String(f.deadlineWithin)}
          options={DEADLINE_OPTIONS}
          onChange={(e) =>
            set({ deadlineWithin: e.target.value === 'any' ? null : Number(e.target.value) })
          }
        />
      </div>

      {active > 0 && (
        <button
          type="button"
          onClick={() => onChange(DEFAULT_FILTERS)}
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Reset all filters ({active})
        </button>
      )}
    </div>
  );
}
