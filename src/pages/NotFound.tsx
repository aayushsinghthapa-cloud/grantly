import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { buttonClasses } from '@/components/ui';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function NotFoundPage() {
  useDocumentTitle('Page not found');
  return (
    <div className="container-page flex flex-col items-center py-24 text-center">
      <p className="font-display text-7xl font-semibold text-primary sm:text-8xl">404</p>
      <h1 className="mt-4 text-3xl font-semibold">This page slipped through the cracks</h1>
      <p className="mt-3 max-w-md text-muted">
        Unlike your scholarship deadlines, this one doesn&apos;t exist. Let&apos;s get you back on
        track.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/discover" className={buttonClasses('primary')}>
          <Compass className="h-4 w-4" aria-hidden />
          Discover scholarships
        </Link>
        <Link to="/" className={buttonClasses('secondary')}>
          Go home
        </Link>
      </div>
    </div>
  );
}
