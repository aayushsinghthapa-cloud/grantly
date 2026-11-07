import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, X } from 'lucide-react';
import { useAppStore, MAX_COMPARE } from '@/store/app';
import { getScholarship } from '@/data/scholarships';
import { buttonClasses } from '@/components/ui';

/** Floating tray that appears once at least one scholarship is ticked for comparison. */
export function CompareTray() {
  const compare = useAppStore((s) => s.compare);
  const toggleCompare = useAppStore((s) => s.toggleCompare);
  const clearCompare = useAppStore((s) => s.clearCompare);
  const items = compare.map(getScholarship).filter((s) => s !== undefined);

  return (
    <AnimatePresence>
      {items.length > 0 && (
        <motion.aside
          aria-label="Compare tray"
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-x-3 bottom-[5.5rem] z-30 mx-auto max-w-2xl rounded-2xl border border-border bg-surface p-3 shadow-lift md:bottom-6"
        >
          <div className="flex flex-wrap items-center gap-2">
            <p className="px-1 text-sm font-semibold">
              Compare{' '}
              <span className="tabular text-muted">
                ({items.length}/{MAX_COMPARE})
              </span>
            </p>
            <ul className="flex min-w-0 flex-1 flex-wrap gap-1.5">
              {items.map((s) => (
                <li
                  key={s.id}
                  className="inline-flex max-w-full items-center gap-1 rounded-full bg-surface-2 py-1 pl-3 pr-1 text-xs font-medium"
                >
                  <span className="truncate">{s.name}</span>
                  <button
                    type="button"
                    onClick={() => toggleCompare(s.id)}
                    aria-label={`Remove ${s.name} from compare`}
                    className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-muted hover:bg-border hover:text-ink"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex w-full gap-2 sm:w-auto">
              <button
                type="button"
                onClick={clearCompare}
                className={buttonClasses('ghost', 'sm', 'flex-1 sm:flex-none')}
              >
                Clear
              </button>
              <Link to="/compare" className={buttonClasses('primary', 'sm', 'flex-1 sm:flex-none')}>
                {items.length < 2 ? 'Open compare' : 'Compare now'}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
