import { NavLink, Link } from 'react-router-dom';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { NAV_ITEMS } from './nav-items';
import { buttonClasses } from '@/components/ui';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/store/app';

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

export function TopNav() {
  const name = useAppStore((s) => s.profile?.name);
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-bg/85 backdrop-blur supports-[backdrop-filter]:bg-bg/70">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV_ITEMS.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      'relative rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive ? 'text-ink' : 'text-muted hover:text-ink',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {label}
                      {isActive && (
                        <span
                          className="absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-primary"
                          aria-hidden
                        />
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          {/* Once a profile exists, the sign-up CTA becomes an avatar link to Profile. */}
          {name ? (
            <Link
              to="/profile"
              aria-label={`Profile: ${name}`}
              className="grid h-9 w-9 place-items-center rounded-full bg-primary font-display text-sm font-semibold text-primary-fg"
            >
              {initials(name)}
            </Link>
          ) : (
            <Link
              to="/onboarding"
              className={buttonClasses('primary', 'sm', 'hidden sm:inline-flex')}
            >
              Find my scholarships
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
