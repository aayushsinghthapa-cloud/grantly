import { NavLink, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { NAV_ITEMS } from './nav-items';
import { buttonClasses } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/store/app';
import { usePaletteStore } from '@/store/palette';

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

/** Slim, translucent top bar. The active-page pill glides between links (shared layoutId). */
export function TopNav() {
  // Sample-student visitors still see the sign-up CTA rather than the demo's initials.
  const name = useAppStore((s) => (s.isDemo ? undefined : s.profile?.name));
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-bg/75 backdrop-blur-xl backdrop-saturate-150">
      <div className="container-page flex h-14 items-center justify-between gap-4">
        <Logo />
        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-0.5">
            {NAV_ITEMS.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      'relative block rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors duration-200',
                      isActive ? 'text-ink' : 'text-muted hover:text-ink',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-0 -z-10 rounded-full bg-surface shadow-soft ring-1 ring-border/70"
                          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                          aria-hidden
                        />
                      )}
                      {label}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => usePaletteStore.getState().setOpen(true)}
            aria-label="Search (Command K)"
            aria-keyshortcuts="Meta+K Control+K"
            className="flex h-9 items-center gap-2 rounded-full px-2.5 text-[13px] text-muted transition-colors hover:bg-surface-2 hover:text-ink lg:bg-surface-2/80 lg:pl-3 lg:pr-2"
          >
            <Search className="h-[18px] w-[18px] lg:h-4 lg:w-4" aria-hidden />
            <span className="hidden lg:inline">Search</span>
            <kbd
              className="hidden rounded-md bg-surface px-1.5 font-sans text-[11px] lg:inline"
              aria-hidden
            >
              ⌘K
            </kbd>
          </button>
          <ThemeToggle />
          {/* Once a profile exists, the sign-up CTA becomes an avatar link to Profile. */}
          {name ? (
            <Link
              to="/profile"
              aria-label={`Profile: ${name}`}
              className="ml-1 grid h-8 w-8 place-items-center rounded-full bg-ink text-xs font-semibold text-bg transition-transform active:scale-95"
            >
              {initials(name)}
            </Link>
          ) : (
            <Link
              to="/onboarding"
              className={buttonClasses('primary', 'sm', 'ml-1 hidden h-8 sm:inline-flex')}
            >
              Get started
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
