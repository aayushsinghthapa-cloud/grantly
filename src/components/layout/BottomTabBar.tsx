import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { NAV_ITEMS } from './nav-items';
import { cn } from '@/lib/cn';

/** Mobile-only bottom navigation. Respects the iOS home-indicator safe area. */
export function BottomTabBar() {
  return (
    <nav
      aria-label="Primary mobile"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-bg/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl backdrop-saturate-150 md:hidden"
    >
      <ul className="grid grid-cols-5">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex min-h-[3.75rem] flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors duration-200',
                  isActive ? 'text-primary' : 'text-muted hover:text-ink',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span className="relative isolate grid h-7 w-12 place-items-center">
                    {isActive && (
                      <motion.span
                        layoutId="tab-active"
                        className="absolute inset-0 -z-10 rounded-full bg-primary-soft"
                        transition={{ type: 'spring', stiffness: 460, damping: 36 }}
                        aria-hidden
                      />
                    )}
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
