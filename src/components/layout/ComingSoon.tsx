import { Hammer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from './PageHeader';
import { EmptyState, buttonClasses } from '@/components/ui';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

/** Temporary scaffold for routes that land in later build phases. */
export function ComingSoon({
  title,
  eyebrow,
  description,
}: {
  title: string;
  eyebrow: string;
  description: string;
}) {
  useDocumentTitle(title);
  return (
    <div className="container-page">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <EmptyState
        icon={<Hammer className="h-6 w-6" />}
        title="Being built right now"
        description="This screen is part of an upcoming build phase."
        action={
          <Link to="/" className={buttonClasses('secondary')}>
            Back to home
          </Link>
        }
      />
    </div>
  );
}
