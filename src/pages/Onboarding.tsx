import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Lock, Wand2 } from 'lucide-react';
import { Button, Card, Chip, Input, Select } from '@/components/ui';
import { RevealPanel } from '@/components/onboarding/RevealPanel';
import { CATEGORIES, EDUCATION_LEVELS, FIELDS, INDIAN_STATES } from '@/data/constants';
import { useAppStore } from '@/store/app';
import { toast } from '@/store/toast';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatINR } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { EducationLevel, StudentProfile } from '@/types';
import {
  EMPTY_DRAFT,
  draftFromProfile,
  profileFromDraft,
  validateDraft,
  type DraftErrors,
  type DraftKey,
  type ProfileDraft,
} from '@/lib/profileForm';

type Draft = ProfileDraft;
type Errors = DraftErrors;

const STEPS = [
  { title: 'About you', fields: ['name', 'gender', 'state'] },
  { title: 'Academics', fields: ['level', 'field', 'percentage'] },
  { title: 'Finances', fields: ['familyIncome', 'annualCost'] },
  { title: 'Interests', fields: ['interests'] },
] as const satisfies readonly { title: string; fields: readonly DraftKey[] }[];

const fieldId = (k: DraftKey) => `ob-${k}`;

export default function OnboardingPage() {
  useDocumentTitle('Build your profile');
  // The sample student is not the visitor's profile: start them from a blank form.
  const existing = useAppStore((s) => (s.isDemo ? null : s.profile));
  const setProfile = useAppStore((s) => s.setProfile);
  const loadDemo = useAppStore((s) => s.loadDemo);

  // Answers typed into the landing page's "Start with two answers" form arrive as router state.
  const prefill = (useLocation().state as { prefill?: Partial<Draft> } | null)?.prefill;
  const [draft, setDraft] = useState<Draft>(() => {
    const base = existing ? draftFromProfile(existing) : EMPTY_DRAFT;
    if (!prefill) return base;
    return {
      ...base,
      ...(prefill.level ? { level: prefill.level } : {}),
      ...(prefill.percentage ? { percentage: prefill.percentage } : {}),
    };
  });
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState<StudentProfile | null>(null);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const isFirstRender = useRef(true);

  // Move focus to the new step's heading so keyboard and screen-reader users know where they are.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    stepHeadingRef.current?.focus();
  }, [step]);

  const set = <K extends DraftKey>(key: K, value: Draft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const stepErrors = validateDraft(draft, STEPS[step].fields);
    const firstInvalid = (Object.keys(stepErrors) as DraftKey[])[0];
    if (firstInvalid) {
      setErrors(stepErrors);
      document.getElementById(fieldId(firstInvalid))?.focus();
      return;
    }
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      return;
    }
    const profile = profileFromDraft(draft);
    setProfile(profile);
    setDone(profile);
  };

  const onDemo = () => {
    loadDemo();
    const profile = useAppStore.getState().profile!;
    setDraft(draftFromProfile(profile));
    setDone(profile);
    toast({
      title: 'Demo profile loaded',
      description: `Exploring as ${profile.name}`,
      tone: 'success',
    });
  };

  if (done) {
    return (
      <div className="container-page">
        <h1 className="sr-only">Your matches</h1>
        <RevealPanel profile={done} />
      </div>
    );
  }

  const progress = ((step + 1) / STEPS.length) * 100;
  const income = Number(draft.familyIncome);
  const cost = Number(draft.annualCost);

  return (
    <div className="container-page max-w-3xl py-8 sm:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold sm:text-4xl">
            {existing ? 'Update your profile' : 'Let’s find your scholarships'}
          </h1>
          <p className="mt-2 text-muted">
            Four quick steps. Fill this in once and every scholarship personalises to it.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={onDemo}
          leftIcon={<Wand2 className="h-4 w-4" aria-hidden />}
        >
          Try demo profile
        </Button>
      </div>

      {/* Progress */}
      <nav aria-label="Onboarding progress" className="mt-8">
        <div className="h-1.5 overflow-hidden rounded-full bg-surface-2" aria-hidden>
          <motion.div
            className="h-full rounded-full bg-primary"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <ol className="mt-3 flex items-center justify-between gap-2 text-sm sm:grid sm:grid-cols-4">
          {STEPS.map((s, i) => (
            <li
              key={s.title}
              aria-current={i === step ? 'step' : undefined}
              className={cn(
                'flex items-center gap-1.5 font-medium',
                i <= step ? 'text-ink' : 'text-muted',
              )}
            >
              <span
                className={cn(
                  'grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px]',
                  i < step
                    ? 'bg-primary text-primary-fg'
                    : i === step
                      ? 'border-2 border-primary text-primary'
                      : 'border border-border',
                )}
                aria-hidden
              >
                {i < step ? <Check className="h-3 w-3" /> : i + 1}
              </span>
              <span className={cn('truncate', i !== step && 'sr-only sm:not-sr-only')}>
                {s.title}
              </span>
              <span className="sr-only">
                {i < step ? '(completed)' : i === step ? '(current)' : ''}
              </span>
            </li>
          ))}
        </ol>
      </nav>

      <Card className="mt-6 overflow-hidden">
        <form onSubmit={onSubmit} noValidate className="p-5 sm:p-8">
          <h2 ref={stepHeadingRef} tabIndex={-1} className="text-2xl font-semibold outline-none">
            <span className="sr-only">
              Step {step + 1} of {STEPS.length}:{' '}
            </span>
            {STEPS[step].title}
          </h2>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.2 }}
              className="mt-6 grid gap-5 sm:grid-cols-2"
            >
              {step === 0 && (
                <>
                  <Input
                    id={fieldId('name')}
                    label="Your name"
                    autoComplete="name"
                    value={draft.name}
                    onChange={(e) => set('name', e.target.value)}
                    error={errors.name}
                    wrapperClassName="sm:col-span-2"
                  />
                  <RadioCards
                    id={fieldId('gender')}
                    legend="Gender"
                    value={draft.gender}
                    options={['Female', 'Male', 'Other']}
                    onChange={(v) => set('gender', v as Draft['gender'])}
                    error={errors.gender}
                  />
                  <Select
                    id={fieldId('state')}
                    label="State of residence"
                    placeholder="Choose your state"
                    value={draft.state}
                    options={INDIAN_STATES}
                    onChange={(e) => set('state', e.target.value)}
                    error={errors.state}
                  />
                </>
              )}

              {step === 1 && (
                <>
                  <Select
                    id={fieldId('level')}
                    label="Current level of study"
                    placeholder="Choose a level"
                    value={draft.level}
                    options={EDUCATION_LEVELS}
                    onChange={(e) => set('level', e.target.value as EducationLevel)}
                    error={errors.level}
                  />
                  <Select
                    id={fieldId('field')}
                    label="Field of study"
                    placeholder="Choose a field"
                    value={draft.field}
                    options={FIELDS}
                    onChange={(e) => set('field', e.target.value)}
                    error={errors.field}
                  />
                  <Input
                    id={fieldId('percentage')}
                    label="Latest marks (%)"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    max={100}
                    step="0.1"
                    value={draft.percentage}
                    onChange={(e) => set('percentage', e.target.value)}
                    hint="Your most recent exam or semester percentage. Convert CGPA × 9.5 if needed."
                    error={errors.percentage}
                    wrapperClassName="sm:col-span-2"
                  />
                </>
              )}

              {step === 2 && (
                <>
                  <Input
                    id={fieldId('familyIncome')}
                    label="Family income per year (₹)"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={10000}
                    value={draft.familyIncome}
                    onChange={(e) => set('familyIncome', e.target.value)}
                    hint={
                      draft.familyIncome && !Number.isNaN(income)
                        ? `= ${formatINR(income)} per year. Use the figure on your Income Certificate.`
                        : 'Use the figure on your Income Certificate if you have one.'
                    }
                    error={errors.familyIncome}
                  />
                  <Input
                    id={fieldId('annualCost')}
                    label="Your total cost of study per year (₹)"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={10000}
                    value={draft.annualCost}
                    onChange={(e) => set('annualCost', e.target.value)}
                    hint={
                      draft.annualCost && !Number.isNaN(cost)
                        ? `= ${formatINR(cost)}. Powers your Funding Gap Meter.`
                        : 'Tuition + hostel + books + travel. Powers your Funding Gap Meter.'
                    }
                    error={errors.annualCost}
                  />
                  <p className="flex items-start gap-2 rounded-xl bg-surface-2 p-3 text-xs text-muted sm:col-span-2">
                    <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                    Your answers stay on this device. Grantly has no server and never uploads your
                    data.
                  </p>
                </>
              )}

              {step === 3 && (
                <fieldset
                  className="sm:col-span-2"
                  aria-describedby={
                    errors.interests
                      ? `${fieldId('interests')}-error`
                      : `${fieldId('interests')}-hint`
                  }
                >
                  <legend className="text-sm font-medium">
                    What kinds of scholarships interest you?
                  </legend>
                  <p id={`${fieldId('interests')}-hint`} className="mt-1 text-xs text-muted">
                    Pick as many as you like. These boost your match scores.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {CATEGORIES.map((c, i) => (
                      <Chip
                        key={c}
                        id={i === 0 ? fieldId('interests') : undefined}
                        selected={draft.interests.includes(c)}
                        onClick={() =>
                          set(
                            'interests',
                            draft.interests.includes(c)
                              ? draft.interests.filter((x) => x !== c)
                              : [...draft.interests, c],
                          )
                        }
                      >
                        {draft.interests.includes(c) && (
                          <Check className="h-3.5 w-3.5" aria-hidden />
                        )}
                        {c}
                      </Chip>
                    ))}
                  </div>
                  {errors.interests && (
                    <p
                      id={`${fieldId('interests')}-error`}
                      role="alert"
                      className="mt-2 text-xs font-medium text-danger"
                    >
                      {errors.interests}
                    </p>
                  )}
                </fieldset>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-6">
            <Button
              variant="ghost"
              onClick={() => setStep(step - 1)}
              disabled={step === 0}
              leftIcon={<ArrowLeft className="h-4 w-4" aria-hidden />}
            >
              Back
            </Button>
            <Button
              type="submit"
              rightIcon={
                step === STEPS.length - 1 ? (
                  <Check className="h-4 w-4" aria-hidden />
                ) : (
                  <ArrowRight className="h-4 w-4" aria-hidden />
                )
              }
            >
              {step === STEPS.length - 1 ? 'Show my matches' : 'Next'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

interface RadioCardsProps {
  id: string;
  legend: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  error?: string;
}

/** Native radio inputs styled as segmented cards — arrow keys work out of the box. */
function RadioCards({ id, legend, value, options, onChange, error }: RadioCardsProps): ReactNode {
  return (
    <fieldset aria-describedby={error ? `${id}-error` : undefined}>
      <legend className="mb-1.5 text-sm font-medium">{legend}</legend>
      <div className="grid grid-cols-3 gap-2">
        {options.map((opt, i) => (
          <label
            key={opt}
            className={cn(
              'flex h-11 cursor-pointer items-center justify-center rounded-xl border text-sm font-medium transition-colors',
              'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-bg',
              value === opt
                ? 'border-primary bg-primary-soft text-primary'
                : error
                  ? 'border-danger'
                  : 'border-border hover:bg-surface-2',
            )}
          >
            <input
              type="radio"
              name={id}
              id={i === 0 ? id : undefined}
              value={opt}
              checked={value === opt}
              onChange={() => onChange(opt)}
              className="sr-only"
            />
            {opt}
          </label>
        ))}
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </fieldset>
  );
}
