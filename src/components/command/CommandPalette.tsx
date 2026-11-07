import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarPlus,
  Columns3,
  Compass,
  CornerDownLeft,
  FileText,
  FolderLock,
  Home,
  KanbanSquare,
  LayoutDashboard,
  Moon,
  Search,
  Sun,
  UserRoundPen,
  Wand2,
} from 'lucide-react';
import { usePaletteStore } from '@/store/palette';
import { useAppStore } from '@/store/app';
import { useUIStore } from '@/store/ui';
import { toast } from '@/store/toast';
import { SCHOLARSHIPS, getScholarship } from '@/data/scholarships';
import { createRankedScholarshipSearch } from '@/lib/search';
import { getMatch } from '@/lib/match';
import { daysLeft, daysLeftLabel } from '@/lib/deadline';
import { formatINRCompact } from '@/lib/format';
import { downloadCalendar } from '@/lib/ics';
import { cn } from '@/lib/cn';

interface Command {
  id: string;
  group: 'Scholarships' | 'Go to' | 'Actions';
  label: string;
  hint?: string;
  icon: ReactNode;
  keywords?: string;
  run: () => void;
}

const search = createRankedScholarshipSearch(SCHOLARSHIPS);
const GROUP_ORDER: Command['group'][] = ['Scholarships', 'Go to', 'Actions'];
const icon = (Icon: typeof Home) => <Icon className="h-4 w-4" aria-hidden />;

/**
 * ⌘K / Ctrl+K command palette. WAI-ARIA combobox: focus stays in the input, arrow keys move
 * the active option (aria-activedescendant), Enter runs it, Escape closes.
 */
export function CommandPalette() {
  const { open, setOpen } = usePaletteStore();
  const navigate = useNavigate();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const listId = useId();
  const optionId = (i: number) => `${listId}-opt-${i}`;

  const profile = useAppStore((s) => s.profile);
  const tracker = useAppStore((s) => s.tracker);
  const loadDemo = useAppStore((s) => s.loadDemo);
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);

  // Global shortcut: ⌘K on macOS, Ctrl+K elsewhere.
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        usePaletteStore.getState().toggle();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) {
      setQuery('');
      setActive(0);
      el.showModal();
      inputRef.current?.focus();
    }
    if (!open && el.open) el.close();
  }, [open]);

  const commands = useMemo<Command[]>(() => {
    const go = (to: string) => () => navigate(to);
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const pages: Command[] = [
      { id: 'p-home', group: 'Go to', label: 'Home', icon: icon(Home), run: go('/') },
      {
        id: 'p-dash',
        group: 'Go to',
        label: 'Dashboard',
        keywords: 'funding gap radar',
        icon: icon(LayoutDashboard),
        run: go('/dashboard'),
      },
      {
        id: 'p-disc',
        group: 'Go to',
        label: 'Discover scholarships',
        keywords: 'search browse find',
        icon: icon(Compass),
        run: go('/discover'),
      },
      {
        id: 'p-track',
        group: 'Go to',
        label: 'Tracker',
        keywords: 'kanban board status',
        icon: icon(KanbanSquare),
        run: go('/tracker'),
      },
      {
        id: 'p-vault',
        group: 'Go to',
        label: 'Document vault',
        keywords: 'documents aadhaar income',
        icon: icon(FolderLock),
        run: go('/vault'),
      },
      { id: 'p-comp', group: 'Go to', label: 'Compare', icon: icon(Columns3), run: go('/compare') },
      {
        id: 'p-prof',
        group: 'Go to',
        label: 'Profile & settings',
        keywords: 'edit reset',
        icon: icon(UserRoundPen),
        run: go('/profile'),
      },
    ];
    const tracked = Object.keys(tracker)
      .map(getScholarship)
      .filter((s) => s !== undefined)
      .filter(
        (s) => daysLeft(s.deadline) >= 0 && !['won', 'rejected'].includes(tracker[s.id].status),
      );
    const actions: Command[] = [
      {
        id: 'a-theme',
        group: 'Actions',
        label: isDark ? 'Switch to light theme' : 'Switch to dark theme',
        keywords: 'theme dark light mode',
        icon: icon(isDark ? Sun : Moon),
        run: () => setTheme(isDark ? 'light' : 'dark'),
      },
      ...(tracked.length > 0
        ? [
            {
              id: 'a-ics',
              group: 'Actions' as const,
              label: 'Export tracked deadlines to calendar',
              keywords: 'ics calendar google apple outlook',
              hint: `${tracked.length} deadlines`,
              icon: icon(CalendarPlus),
              run: () => {
                downloadCalendar(tracked, 'grantly-deadlines.ics');
                toast({ title: `${tracked.length} deadlines exported`, tone: 'success' });
              },
            },
          ]
        : []),
      {
        id: 'a-demo',
        group: 'Actions',
        label: 'Load demo profile',
        keywords: 'sample example judge',
        icon: icon(Wand2),
        run: () => {
          loadDemo();
          toast({ title: 'Demo profile loaded', tone: 'success' });
          navigate('/dashboard');
        },
      },
    ];

    const q = query.trim().toLowerCase();
    const matchText = (c: Command) => `${c.label} ${c.keywords ?? ''}`.toLowerCase().includes(q);
    const scholarships = (
      q
        ? search(q)
        : profile
          ? SCHOLARSHIPS.filter((s) => daysLeft(s.deadline) >= 0)
              .map((s) => ({ s, score: getMatch(profile, s).score }))
              .sort((a, b) => b.score - a.score)
              .slice(0, 4)
              .map(({ s }) => s)
          : []
    ).map<Command>((s) => {
      const days = daysLeft(s.deadline);
      return {
        id: `s-${s.id}`,
        group: 'Scholarships',
        label: s.name,
        hint: `${formatINRCompact(s.amount)} · ${daysLeftLabel(days)}${profile ? ` · ${getMatch(profile, s).score}% match` : ''}`,
        icon: icon(FileText),
        run: go(`/scholarship/${s.id}`),
      };
    });

    const matchedPages = pages.filter((c) => !q || matchText(c));
    const matchedActions = actions.filter((c) => !q || matchText(c));
    // A direct hit on a page/action name ("vault", "dark") outranks fuzzy scholarship matches.
    return q && matchedPages.length + matchedActions.length > 0
      ? [...matchedPages, ...matchedActions, ...scholarships]
      : [...scholarships, ...matchedPages, ...matchedActions];
  }, [query, profile, tracker, theme, navigate, setTheme, loadDemo]);

  // Keep the active option valid and visible.
  useEffect(() => setActive(0), [query]);
  useEffect(() => {
    document.getElementById(optionId(active))?.scrollIntoView({ block: 'nearest' });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- optionId is derived from a stable useId
  }, [active]);

  const runCommand = (c: Command | undefined) => {
    if (!c) return;
    setOpen(false);
    c.run();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const last = commands.length - 1;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => (a >= last ? 0 : a + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => (a <= 0 ? last : a - 1));
    } else if (e.key === 'Home' && e.ctrlKey) {
      setActive(0);
    } else if (e.key === 'End' && e.ctrlKey) {
      setActive(last);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      runCommand(commands[active]);
    }
  };

  // Render groups in the order they first appear, so visual order always equals keyboard order.
  const groupOrder = GROUP_ORDER.slice().sort(
    (a, b) => commands.findIndex((c) => c.group === a) - commands.findIndex((c) => c.group === b),
  );
  let index = -1;
  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions -- backdrop click; Escape is native
    <dialog
      ref={dialogRef}
      aria-label="Command palette"
      onClose={() => setOpen(false)}
      onCancel={(e) => {
        e.preventDefault();
        setOpen(false);
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) setOpen(false);
      }}
      className="m-0 h-full max-h-none w-full max-w-none bg-transparent p-4 text-ink open:flex open:items-start open:justify-center sm:pt-[12vh]"
    >
      <div className="flex max-h-[min(32rem,80vh)] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-lift">
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="h-5 w-5 shrink-0 text-muted" aria-hidden />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={commands.length > 0 ? optionId(active) : undefined}
            aria-label="Search scholarships, pages and actions"
            placeholder="Search scholarships, pages, actions…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            className="h-14 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <kbd className="hidden rounded-md border border-border px-1.5 py-0.5 text-xs text-muted sm:inline">
            Esc
          </kbd>
        </div>

        <div
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label="Results"
          className="flex-1 overflow-y-auto p-2"
        >
          {commands.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-muted">No results for “{query}”.</p>
          )}
          {groupOrder.map((group) => {
            const items = commands.filter((c) => c.group === group);
            if (items.length === 0) return null;
            const headingId = `${listId}-${group.replace(/\s/g, '')}`;
            return (
              <div key={group} role="group" aria-labelledby={headingId} className="mb-1">
                <div
                  id={headingId}
                  role="presentation"
                  className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-muted"
                >
                  {group}
                </div>
                {items.map((c) => {
                  index += 1;
                  const i = index;
                  const selected = i === active;
                  return (
                    // Combobox pattern: focus stays in the input, which handles all keys (arrows/Enter).
                    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                    <div
                      key={c.id}
                      id={optionId(i)}
                      role="option"
                      aria-selected={selected}
                      tabIndex={-1}
                      onMouseMove={() => setActive(i)}
                      onClick={() => runCommand(c)}
                      className={cn(
                        'flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm',
                        selected ? 'bg-primary-soft text-ink' : 'text-ink',
                      )}
                    >
                      <span className={cn('shrink-0', selected ? 'text-primary' : 'text-muted')}>
                        {c.icon}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{c.label}</span>
                        {c.hint && (
                          <span className="block truncate text-xs text-muted">{c.hint}</span>
                        )}
                      </span>
                      {selected && (
                        <CornerDownLeft className="h-4 w-4 shrink-0 text-muted" aria-hidden />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div
          className="hidden items-center gap-4 border-t border-border px-4 py-2 text-xs text-muted sm:flex"
          aria-hidden
        >
          <span>
            <kbd className="font-sans">↑↓</kbd> navigate
          </span>
          <span>
            <kbd className="font-sans">↵</kbd> open
          </span>
          <span>
            <kbd className="font-sans">⌘K</kbd> toggle
          </span>
        </div>
      </div>
    </dialog>
  );
}
