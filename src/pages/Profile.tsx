import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, RotateCcw, ShieldCheck, Trash2, UserRoundPen, Wand2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ThemeSegmented } from '@/components/layout/ThemeToggle';
import {
  Button,
  Card,
  Chip,
  Dialog,
  EmptyState,
  Input,
  Select,
  buttonClasses,
} from '@/components/ui';
import { CATEGORIES, EDUCATION_LEVELS, FIELDS, INDIAN_STATES } from '@/data/constants';
import { SCHOLARSHIPS } from '@/data/scholarships';
import { useAppStore } from '@/store/app';
import { toast } from '@/store/toast';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { getMatch } from '@/lib/match';
import { isClosed } from '@/lib/deadline';
import { formatINR, formatINRCompact } from '@/lib/format';
import {
  draftFromProfile,
  profileFromDraft,
  validateDraft,
  type DraftErrors,
  type DraftKey,
  type ProfileDraft,
} from '@/lib/profileForm';
import type { EducationLevel, StudentProfile } from '@/types';

const fid = (k: DraftKey) => `pf-${k}`;

export default function ProfilePage() {
  useDocumentTitle('Profile');
  const profile = useAppStore((s) => s.profile);

  return (
    <div className="container-page pb-16">
      <PageHeader
        eyebrow="Profile"
        title="Your profile"
        description="One profile powers every match score, suggestion and deadline in Grantly."
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0">
          {profile ? (
            <ProfileForm key={JSON.stringify(profile)} profile={profile} />
          ) : (
            <EmptyState
              icon={<UserRoundPen className="h-6 w-6" />}
              title="No profile yet"
              description="Create your eligibility profile to see match scores across every scholarship."
              action={
                <Link to="/onboarding" className={buttonClasses('primary')}>
                  Create my profile
                </Link>
              }
            />
          )}
        </div>
        <Settings />
      </div>
    </div>
  );
}

function ProfileForm({ profile }: { profile: StudentProfile }) {
  const setProfile = useAppStore((s) => s.setProfile);
  const [draft, setDraft] = useState<ProfileDraft>(() => draftFromProfile(profile));
  const [errors, setErrors] = useState<DraftErrors>({});
  const dirty = JSON.stringify(draft) !== JSON.stringify(draftFromProfile(profile));

  const set = <K extends DraftKey>(key: K, value: ProfileDraft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  // Live preview: how many open scholarships this (possibly unsaved) profile qualifies for.
  const preview = useMemo(() => {
    if (Object.keys(validateDraft(draft)).length > 0) return null;
    const p = profileFromDraft(draft);
    const eligible = SCHOLARSHIPS.filter((s) => !isClosed(s.deadline) && getMatch(p, s).eligible);
    return { count: eligible.length, total: eligible.reduce((sum, s) => sum + s.amount, 0) };
  }, [draft]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errs = validateDraft(draft);
    const first = (Object.keys(errs) as DraftKey[])[0];
    if (first) {
      setErrors(errs);
      document.getElementById(fid(first))?.focus();
      return;
    }
    setProfile(profileFromDraft(draft));
    toast({
      title: 'Profile saved',
      description: 'Match scores updated everywhere.',
      tone: 'success',
    });
  };

  return (
    <Card as="section" aria-labelledby="edit-heading">
      <form onSubmit={onSubmit} noValidate>
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border p-5 sm:p-6">
          <div>
            <h2 id="edit-heading" className="text-2xl font-semibold">
              Eligibility details
            </h2>
            <p className="mt-1 text-sm text-muted" aria-live="polite">
              {preview ? (
                <>
                  These details qualify you for{' '}
                  <strong className="tabular text-ink">{preview.count}</strong> open scholarships
                  worth{' '}
                  <strong className="tabular text-ink">{formatINRCompact(preview.total)}</strong>.
                </>
              ) : (
                'Fix the highlighted fields to see your matches.'
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <Input
            id={fid('name')}
            label="Name"
            autoComplete="name"
            value={draft.name}
            onChange={(e) => set('name', e.target.value)}
            error={errors.name}
          />
          <Select
            id={fid('gender')}
            label="Gender"
            placeholder="Choose"
            value={draft.gender}
            options={['Female', 'Male', 'Other']}
            onChange={(e) => set('gender', e.target.value as ProfileDraft['gender'])}
            error={errors.gender}
          />
          <Select
            id={fid('state')}
            label="State of residence"
            placeholder="Choose your state"
            value={draft.state}
            options={INDIAN_STATES}
            onChange={(e) => set('state', e.target.value)}
            error={errors.state}
          />
          <Select
            id={fid('level')}
            label="Level of study"
            placeholder="Choose a level"
            value={draft.level}
            options={EDUCATION_LEVELS}
            onChange={(e) => set('level', e.target.value as EducationLevel)}
            error={errors.level}
          />
          <Select
            id={fid('field')}
            label="Field of study"
            placeholder="Choose a field"
            value={draft.field}
            options={FIELDS}
            onChange={(e) => set('field', e.target.value)}
            error={errors.field}
          />
          <Input
            id={fid('percentage')}
            label="Latest marks (%)"
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            step="0.1"
            value={draft.percentage}
            onChange={(e) => set('percentage', e.target.value)}
            error={errors.percentage}
          />
          <Input
            id={fid('familyIncome')}
            label="Family income per year (₹)"
            type="number"
            inputMode="numeric"
            min={0}
            step={10000}
            value={draft.familyIncome}
            onChange={(e) => set('familyIncome', e.target.value)}
            hint={draft.familyIncome ? `= ${formatINR(Number(draft.familyIncome))}` : undefined}
            error={errors.familyIncome}
          />
          <Input
            id={fid('annualCost')}
            label="Cost of study per year (₹)"
            type="number"
            inputMode="numeric"
            min={0}
            step={10000}
            value={draft.annualCost}
            onChange={(e) => set('annualCost', e.target.value)}
            hint={
              draft.annualCost
                ? `= ${formatINR(Number(draft.annualCost))} · drives your Funding Gap Meter`
                : undefined
            }
            error={errors.annualCost}
          />
          <fieldset
            className="sm:col-span-2"
            aria-describedby={errors.interests ? `${fid('interests')}-error` : undefined}
          >
            <legend className="text-sm font-medium">Interests</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {CATEGORIES.map((c, i) => {
                const on = draft.interests.includes(c);
                return (
                  <Chip
                    key={c}
                    id={i === 0 ? fid('interests') : undefined}
                    selected={on}
                    onClick={() =>
                      set(
                        'interests',
                        on ? draft.interests.filter((x) => x !== c) : [...draft.interests, c],
                      )
                    }
                  >
                    {on && <Check className="h-3.5 w-3.5" aria-hidden />}
                    {c}
                  </Chip>
                );
              })}
            </div>
            {errors.interests && (
              <p
                id={`${fid('interests')}-error`}
                role="alert"
                className="mt-2 text-xs font-medium text-danger"
              >
                {errors.interests}
              </p>
            )}
          </fieldset>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border p-4 sm:px-6">
          {dirty && (
            <Button
              variant="ghost"
              leftIcon={<RotateCcw className="h-4 w-4" aria-hidden />}
              onClick={() => {
                setDraft(draftFromProfile(profile));
                setErrors({});
              }}
            >
              Discard changes
            </Button>
          )}
          <Button type="submit" disabled={!dirty}>
            Save profile
          </Button>
        </div>
      </form>
    </Card>
  );
}

function Settings() {
  const resetAll = useAppStore((s) => s.resetAll);
  const loadDemo = useAppStore((s) => s.loadDemo);
  const hasData = useAppStore(
    (s) =>
      s.profile !== null || Object.keys(s.tracker).length > 0 || Object.keys(s.vault).length > 0,
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <aside className="space-y-6" aria-label="Settings">
      <Card as="section" aria-labelledby="appearance-heading" className="p-5 sm:p-6">
        <h2 id="appearance-heading" className="text-lg font-semibold">
          Appearance
        </h2>
        <p className="mb-4 text-sm text-muted">Light, dark, or follow your device.</p>
        <ThemeSegmented />
      </Card>

      <Card as="section" aria-labelledby="privacy-heading" className="p-5 sm:p-6">
        <h2 id="privacy-heading" className="flex items-center gap-2 text-lg font-semibold">
          <ShieldCheck className="h-5 w-5 text-primary" aria-hidden /> Your data
        </h2>
        <p className="mt-1 text-sm text-muted">
          Everything is stored only in this browser. Grantly has no server, no account and no
          tracking.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <Button
            variant="secondary"
            leftIcon={<Wand2 className="h-4 w-4" aria-hidden />}
            onClick={() => {
              loadDemo();
              toast({
                title: 'Demo profile loaded',
                description: 'Your previous data was replaced.',
                tone: 'success',
              });
            }}
          >
            Load demo profile
          </Button>
          <Button
            variant="ghost"
            className="text-danger hover:bg-danger-soft"
            leftIcon={<Trash2 className="h-4 w-4" aria-hidden />}
            disabled={!hasData}
            onClick={() => setConfirmOpen(true)}
          >
            Reset all data
          </Button>
        </div>
      </Card>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Reset all data?"
        description="This permanently clears your profile, tracker, document vault and roadmap progress from this browser."
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Keep my data
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                resetAll();
                setConfirmOpen(false);
                toast({ title: 'All data cleared' });
                navigate('/');
              }}
            >
              Yes, reset everything
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">
          There’s no undo, but you can always start again in about a minute.
        </p>
      </Dialog>
    </aside>
  );
}
