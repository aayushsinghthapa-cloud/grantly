import { Monitor, Moon, Sun } from 'lucide-react';
import { useUIStore, type Theme } from '@/store/ui';
import { cn } from '@/lib/cn';

const order: Theme[] = ['light', 'dark', 'system'];
const meta: Record<Theme, { icon: typeof Sun; label: string }> = {
  light: { icon: Sun, label: 'Light' },
  dark: { icon: Moon, label: 'Dark' },
  system: { icon: Monitor, label: 'System' },
};

/** Compact icon button that cycles light → dark → system. */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useUIStore();
  const next = order[(order.indexOf(theme) + 1) % order.length];
  const Icon = meta[theme].icon;
  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Theme: ${meta[theme].label}. Switch to ${meta[next].label}`}
      title={`Theme: ${meta[theme].label}`}
      className={cn(
        'grid h-10 w-10 place-items-center rounded-xl text-muted transition-colors hover:bg-surface-2 hover:text-ink',
        className,
      )}
    >
      <Icon className="h-5 w-5" aria-hidden />
    </button>
  );
}

/** Full segmented control for the Profile page. */
export function ThemeSegmented() {
  const { theme, setTheme } = useUIStore();
  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className="inline-flex rounded-xl border border-border bg-surface-2 p-1"
    >
      {order.map((t) => {
        const { icon: Icon, label } = meta[t];
        const checked = theme === t;
        return (
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={checked}
            onClick={() => setTheme(t)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              checked ? 'bg-surface text-ink shadow-soft' : 'text-muted hover:text-ink',
            )}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {label}
          </button>
        );
      })}
    </div>
  );
}
