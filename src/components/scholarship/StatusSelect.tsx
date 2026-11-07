import { Select } from '@/components/ui';
import { STATUS_LABEL, TRACKER_STATUSES } from '@/data/constants';
import { useAppStore } from '@/store/app';
import { toast } from '@/store/toast';
import type { TrackerStatus } from '@/types';

const OPTIONS = [
  { value: 'none', label: 'Not tracking' },
  ...TRACKER_STATUSES.map((s) => ({ value: s, label: STATUS_LABEL[s] })),
];

/** Native select for application status — compact and fully keyboard/screen-reader friendly. */
export function StatusSelect({
  id,
  name,
  className,
}: {
  id: string;
  name: string;
  className?: string;
}) {
  const status = useAppStore((s) => s.tracker[id]?.status);
  const setStatus = useAppStore((s) => s.setStatus);
  return (
    <Select
      label="Application status"
      value={status ?? 'none'}
      options={OPTIONS}
      wrapperClassName={className}
      onChange={(e) => {
        const next = e.target.value === 'none' ? null : (e.target.value as TrackerStatus);
        setStatus(id, next);
        toast({
          title: next ? `Status: ${STATUS_LABEL[next]}` : 'Removed from tracker',
          description: name,
          tone: next === 'won' ? 'success' : 'default',
        });
      }}
    />
  );
}
