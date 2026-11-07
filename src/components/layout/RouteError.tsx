import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { Button, buttonClasses } from '@/components/ui';

/** True when a lazy route chunk failed to load: usually a new deploy replaced the old files. */
function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /dynamically imported module|Loading chunk|Importing a module script failed|Failed to fetch/i.test(
    message,
  );
}

/**
 * Route-level error boundary. Never shows a blank screen: explains what happened in plain words
 * and offers a way forward. Stack traces stay in the console.
 */
export function RouteError() {
  const error = useRouteError();
  const stale = isChunkLoadError(error);
  const status = isRouteErrorResponse(error) ? error.status : null;
  console.error(error);

  return (
    <main
      id="main"
      className="container-page flex min-h-[70vh] flex-col items-center justify-center py-16 text-center"
    >
      <p className="text-[13px] font-semibold text-primary">
        {status ? `Error ${status}` : 'Something went wrong'}
      </p>
      <h1 className="mt-2 text-balance text-3xl font-semibold sm:text-4xl">
        {stale ? 'GRANTLY was just updated' : 'This page hit a problem'}
      </h1>
      <p className="mt-3 max-w-md text-pretty text-muted">
        {stale
          ? 'A newer version is live. Reload to get it. Your profile, tracker and notes are safe on this device.'
          : 'Your data is safe on this device. Reloading usually fixes it; if not, head back home.'}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button
          onClick={() => window.location.reload()}
          leftIcon={<RefreshCw className="h-4 w-4" aria-hidden />}
        >
          Reload
        </Button>
        <Link to="/" className={buttonClasses('secondary')}>
          Go home
        </Link>
      </div>
    </main>
  );
}
