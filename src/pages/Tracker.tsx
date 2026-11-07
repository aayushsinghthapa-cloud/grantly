import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragStartEvent,
  type KeyboardCoordinateGetter,
} from '@dnd-kit/core';
import { KanbanSquare } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState, buttonClasses } from '@/components/ui';
import { TrackerCard } from '@/components/tracker/TrackerCard';
import { COLUMNS, ZONES, type ZoneMeta } from '@/components/tracker/board';
import { useTrackedItems, type TrackedItem } from '@/hooks/useMatches';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useAppStore } from '@/store/app';
import { toast } from '@/store/toast';
import { STATUS_LABEL } from '@/data/constants';
import { getScholarship } from '@/data/scholarships';
import { formatINRCompact } from '@/lib/format';
import { daysLeft } from '@/lib/deadline';
import { cn } from '@/lib/cn';
import type { TrackerStatus } from '@/types';

const nameOf = (id: string | number) => getScholarship(String(id))?.name ?? 'Scholarship';
const zoneLabel = (id: string | number | undefined) =>
  id ? STATUS_LABEL[id as TrackerStatus] : 'nowhere';

/** Column the card was picked up from — the store has already changed by the time onDragEnd is announced. */
let dragOrigin: TrackerStatus | null = null;

/** Screen-reader narration for keyboard drag-and-drop (dnd-kit's live region). */
const announcements: Announcements = {
  onDragStart: ({ active }) => {
    dragOrigin = useAppStore.getState().tracker[String(active.id)]?.status ?? null;
    return `Picked up ${nameOf(active.id)} from ${zoneLabel(dragOrigin ?? undefined)}.`;
  },
  onDragOver: ({ active, over }) =>
    over
      ? `${nameOf(active.id)} is over ${zoneLabel(over.id)}.`
      : `${nameOf(active.id)} is not over a column.`,
  onDragEnd: ({ active, over }) => {
    if (!over) return `${nameOf(active.id)} dropped. No change.`;
    return over.id === dragOrigin
      ? `${nameOf(active.id)} stayed in ${zoneLabel(over.id)}.`
      : `${nameOf(active.id)} moved to ${zoneLabel(over.id)}.`;
  },
  onDragCancel: ({ active }) => `Moving ${nameOf(active.id)} cancelled.`,
};
const screenReaderInstructions = {
  draggable:
    'To move this application, press Space or Enter to pick it up. Use the arrow keys to move between columns, then press Space or Enter to drop, or Escape to cancel. You can also use the “Move” menu on each card.',
};

const ZONE_ORDER = ZONES.map((z) => z.status);
const ARROWS: Record<string, 1 | -1> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

/** Each arrow press moves the dragged card to the next/previous zone (Saved → … → Not selected). */
const zoneCoordinates: KeyboardCoordinateGetter = (
  event,
  { context: { active, over, droppableRects } },
) => {
  const dir = ARROWS[event.code];
  if (!dir || !active) return undefined;
  event.preventDefault();
  const from = (over?.id ??
    useAppStore.getState().tracker[String(active.id)]?.status) as TrackerStatus;
  const index = Math.min(ZONE_ORDER.length - 1, Math.max(0, ZONE_ORDER.indexOf(from) + dir));
  const rect = droppableRects.get(ZONE_ORDER[index]);
  return rect ? { x: rect.left + 8, y: rect.top + 8 } : undefined;
};

/** After a menu move the card remounts in another column — put focus back on its menu button there. */
const refocusMenu = (name: string) =>
  requestAnimationFrame(() => {
    const trigger = document.querySelector<HTMLButtonElement>(
      `button[aria-label="Move ${CSS.escape(name)}"]`,
    );
    (trigger ?? document.getElementById('main'))?.focus();
  });

export default function TrackerPage() {
  useDocumentTitle('Tracker');
  const items = useTrackedItems();
  const setStatus = useAppStore((s) => s.setStatus);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: zoneCoordinates }),
  );

  const byStatus = useMemo(() => {
    const map = new Map<TrackerStatus, TrackedItem[]>(ZONES.map((z) => [z.status, []]));
    for (const it of items) map.get(it.entry.status)?.push(it);
    // Open items: soonest deadline first. Results: most recently updated first.
    for (const [status, list] of map) {
      list.sort((a, b) =>
        status === 'won' || status === 'rejected'
          ? b.entry.updatedAt.localeCompare(a.entry.updatedAt)
          : daysLeft(a.scholarship.deadline) - daysLeft(b.scholarship.deadline),
      );
    }
    return map;
  }, [items]);

  const move = (id: string, status: TrackerStatus | null) => {
    const current = items.find((i) => i.scholarship.id === id)?.entry.status;
    if (status === current) return;
    setStatus(id, status);
    const name = nameOf(id);
    if (status === null) toast({ title: 'Removed from tracker', description: name });
    else if (status === 'won')
      toast({
        title: 'Congratulations!',
        description: `${name} marked as won.`,
        tone: 'success',
      });
    else toast({ title: `Moved to ${STATUS_LABEL[status]}`, description: name });
  };

  const onDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));
  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    if (e.over) move(String(e.active.id), e.over.id as TrackerStatus);
  };

  const activeItem = activeId ? items.find((i) => i.scholarship.id === activeId) : undefined;
  const inPlay = items
    .filter((i) => i.entry.status === 'preparing' || i.entry.status === 'submitted')
    .reduce((sum, i) => sum + i.scholarship.amount, 0);

  return (
    <div className="container-page pb-16">
      <PageHeader
        eyebrow="Tracker"
        title="Application tracker"
        description={
          items.length > 0
            ? `${items.length} application${items.length === 1 ? '' : 's'} · ${formatINRCompact(inPlay)} in progress. Drag cards between columns, or use the ··· menu.`
            : 'Every scholarship you save lands here.'
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon={<KanbanSquare className="h-6 w-6" />}
          title="Your board is empty"
          description="Save scholarships from Discover — they’ll appear here so you can track them from saved to submitted to result."
          action={
            <Link to="/discover" className={buttonClasses('primary')}>
              Find scholarships
            </Link>
          }
        />
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragCancel={() => setActiveId(null)}
          accessibility={{ announcements, screenReaderInstructions }}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {COLUMNS.map((col) => (
              <section
                key={col.title}
                aria-labelledby={`col-${col.title}`}
                className="flex flex-col rounded-2xl bg-surface-2/70 p-3"
              >
                <h2
                  id={`col-${col.title}`}
                  className="flex items-center justify-between px-1 pb-2 pt-1 font-sans text-sm font-semibold tracking-normal"
                >
                  {col.title}
                  <span className="tabular rounded-full bg-surface px-2 py-0.5 text-xs text-muted">
                    {col.zones.reduce((n, z) => n + (byStatus.get(z.status)?.length ?? 0), 0)}
                  </span>
                </h2>
                <div className="flex flex-1 flex-col gap-3">
                  {col.zones.map((zone) => (
                    <DropZone key={zone.status} zone={zone} showLabel={col.zones.length > 1}>
                      {(byStatus.get(zone.status) ?? []).map((item) => (
                        <DraggableCard
                          key={item.scholarship.id}
                          item={item}
                          onMove={(s) => {
                            move(item.scholarship.id, s);
                            refocusMenu(item.scholarship.name);
                          }}
                        />
                      ))}
                    </DropZone>
                  ))}
                </div>
              </section>
            ))}
          </div>
          <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }}>
            {activeItem ? <TrackerCard item={activeItem} onMove={() => {}} overlay /> : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}

function DropZone({
  zone,
  showLabel,
  children,
}: {
  zone: ZoneMeta;
  showLabel: boolean;
  children: ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: zone.status });
  const empty = Array.isArray(children) && children.length === 0;
  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex min-h-28 flex-1 flex-col gap-2 rounded-xl border-2 border-transparent p-1 transition-colors',
        isOver && 'border-dashed border-primary bg-primary-soft/60',
      )}
    >
      {showLabel && (
        <p className="flex items-center gap-1.5 px-1 text-xs font-semibold text-muted">
          <span className={cn('h-2 w-2 rounded-full', zone.dot)} aria-hidden />
          {zone.label}
        </p>
      )}
      <ul className="flex flex-col gap-2" aria-label={zone.label}>
        {children}
      </ul>
      {empty && (
        <p className="grid flex-1 place-items-center rounded-lg border border-dashed border-border px-3 py-4 text-center text-xs text-muted">
          {zone.hint}
        </p>
      )}
    </div>
  );
}

function DraggableCard({
  item,
  onMove,
}: {
  item: TrackedItem;
  onMove: (s: TrackerStatus | null) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.scholarship.id,
  });
  return (
    <li>
      <TrackerCard
        ref={setNodeRef}
        item={item}
        onMove={onMove}
        dragging={isDragging}
        handleProps={{ ...attributes, ...listeners }}
      />
    </li>
  );
}
