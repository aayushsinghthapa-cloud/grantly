import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button, Input, Select } from '@/components/ui';
import { EDUCATION_LEVELS } from '@/data/constants';
import { SCHOLARSHIPS } from '@/data/scholarships';
import { isClosed } from '@/lib/deadline';
import { formatINRCompact } from '@/lib/format';
import type { EducationLevel } from '@/types';

/**
 * The close: an actual input, not a button. Two answers produce a live, honest count
 * (open scholarships at that level whose minimum marks you meet; income, state and other
 * rules are checked once the full profile exists), and Continue carries both into onboarding.
 */
export function StartForm() {
  const navigate = useNavigate();
  const [level, setLevel] = useState<EducationLevel | ''>('');
  const [marks, setMarks] = useState('');
  const pct = Number(marks);
  const marksValid = marks.trim() !== '' && pct >= 0 && pct <= 100;

  const result = useMemo(() => {
    if (!level) return null;
    const open = SCHOLARSHIPS.filter(
      (s) =>
        !isClosed(s.deadline) &&
        s.eligibility.levels.includes(level) &&
        (!marksValid || (s.eligibility.minPercentage ?? 0) <= pct),
    );
    return { count: open.length, total: open.reduce((sum, s) => sum + s.amount, 0) };
  }, [level, pct, marksValid]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    navigate('/onboarding', { state: { prefill: { level, percentage: marksValid ? marks : '' } } });
  };

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto mt-10 w-full max-w-xl text-left"
      aria-describedby="start-result"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <Select
          label="What are you studying?"
          placeholder="Choose your level"
          value={level}
          options={EDUCATION_LEVELS}
          onChange={(e) => setLevel(e.target.value as EducationLevel)}
        />
        <Input
          label="Latest marks (%)"
          type="number"
          inputMode="decimal"
          min={0}
          max={100}
          placeholder="e.g. 82"
          value={marks}
          onChange={(e) => setMarks(e.target.value)}
        />
      </div>
      <p
        id="start-result"
        className="mt-4 min-h-12 text-pretty text-[15px] text-muted"
        aria-live="polite"
      >
        {result ? (
          <>
            <strong className="tabular text-ink">{result.count}</strong> open scholarships worth{' '}
            <strong className="tabular text-ink">{formatINRCompact(result.total)}</strong> take{' '}
            {level} students
            {marksValid ? ` with ${pct}%` : ''}. Income, state and field are checked next.
          </>
        ) : (
          'Two answers, and we’ll show you what’s open before you sign up for anything.'
        )}
      </p>
      <Button
        type="submit"
        size="lg"
        className="mt-2 w-full sm:w-auto"
        rightIcon={<ArrowRight className="h-4 w-4" aria-hidden />}
      >
        Continue
      </Button>
    </form>
  );
}
