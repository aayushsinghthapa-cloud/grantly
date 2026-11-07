import { Suspense, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { TopNav } from './TopNav';
import { BottomTabBar } from './BottomTabBar';
import { Footer } from './Footer';
import { PageSkeleton, Toaster } from '@/components/ui';
import { useThemeSync } from '@/hooks/useTheme';

export function AppShell() {
  useThemeSync();
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const firstRender = useRef(true);

  // On route change: scroll to top and move focus to <main> so screen-reader users land on new content.
  useEffect(() => {
    window.scrollTo(0, 0);
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-fg"
      >
        Skip to content
      </a>
      <TopNav />
      <main id="main" ref={mainRef} tabIndex={-1} className="flex-1 pb-24 outline-none md:pb-0">
        <Suspense fallback={<PageSkeleton />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <BottomTabBar />
      <Toaster />
    </div>
  );
}
