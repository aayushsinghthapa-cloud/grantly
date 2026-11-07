import { Link } from 'react-router-dom';
import { CheckCircle2, CircleDashed, AlertTriangle, ArrowRight } from 'lucide-react';
import { Card, ProgressRing } from '@/components/ui';
import { GlossaryTerm } from './GlossaryTerm';
import { useReadiness } from '@/hooks/useMatches';
import { useAppStore } from '@/store/app';
import { toast } from '@/store/toast';
import type { DocType, Scholarship } from '@/types';
import { cn } from '@/lib/cn';
import { docAnchor } from '@/lib/readiness';

/** "4 of 6 documents ready", computed live from the Document Vault. */
export function DocumentReadiness({ scholarship }: { scholarship: Scholarship }) {
  const readiness = useReadiness(scholarship)!;
  const toggleDoc = useAppStore((s) => s.toggleDoc);
  const { ready, total, expired } = readiness;

  const markReady = (doc: DocType) => {
    if (expired.includes(doc)) return; // expired docs need a new expiry date — handled in the Vault
    toggleDoc(doc);
    toast({
      title: `${doc} marked as ready`,
      description: 'Updated in your Document Vault.',
      tone: 'success',
    });
  };

  return (
    <Card as="section" aria-labelledby="docs-heading" className="p-5 sm:p-6">
      <div className="flex items-center gap-4">
        <ProgressRing
          value={readiness.percent}
          size={56}
          tone={readiness.complete ? 'primary' : 'accent'}
          showValue={false}
          label={`${ready.length} of ${total} documents ready`}
        />
        <div>
          <h2 id="docs-heading" className="text-xl font-semibold">
            Document readiness
          </h2>
          <p className="tabular text-sm text-muted">
            <strong className="text-ink">
              {ready.length} of {total}
            </strong>{' '}
            documents ready
          </p>
        </div>
      </div>

      <ul className="mt-5 space-y-2">
        {scholarship.requiredDocuments.map((doc) => {
          const isReady = ready.includes(doc);
          const isExpired = expired.includes(doc);
          const Icon = isReady ? CheckCircle2 : isExpired ? AlertTriangle : CircleDashed;
          return (
            <li
              key={doc}
              className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2.5"
            >
              <span className="flex min-w-0 items-center gap-2.5 text-sm">
                <Icon
                  className={cn(
                    'h-4 w-4 shrink-0',
                    isReady ? 'text-success' : isExpired ? 'text-danger' : 'text-muted',
                  )}
                  aria-hidden
                />
                <span className="min-w-0">
                  <GlossaryTerm term={doc} />
                  <span className="sr-only">
                    : {isReady ? 'ready' : isExpired ? 'expired' : 'missing'}
                  </span>
                  {isExpired && (
                    <span className="block text-xs text-danger">Expired, renew it</span>
                  )}
                </span>
              </span>
              {isReady ? (
                <span className="text-xs font-medium text-success">Ready</span>
              ) : isExpired ? (
                <Link
                  to={`/vault#${docAnchor(doc)}`}
                  className="shrink-0 text-xs font-semibold text-primary hover:underline"
                >
                  Update
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => markReady(doc)}
                  className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-primary hover:bg-primary-soft"
                >
                  I have this<span className="sr-only">: {doc}</span>
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <Link
        to="/vault"
        className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
      >
        Open Document Vault <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </Card>
  );
}
