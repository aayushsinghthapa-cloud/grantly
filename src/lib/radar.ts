export interface Placed {
  /** 0–100: horizontal position along the timeline. */
  pct: number;
  /** 0-based row so dots that are close in time don't overlap. */
  lane: number;
}

/**
 * Position items on a 0…windowDays timeline and stack near-collisions into lanes.
 * Items outside the window are dropped. Greedy: each item takes the first lane with room.
 */
export function placeOnTimeline<T extends { days: number }>(
  items: readonly T[],
  windowDays: number,
  minGapPct = 5,
): (T & Placed)[] {
  const laneEnds: number[] = [];
  return items
    .filter((i) => i.days >= 0 && i.days <= windowDays)
    .slice()
    .sort((a, b) => a.days - b.days)
    .map((item) => {
      const pct = (item.days / windowDays) * 100;
      let lane = laneEnds.findIndex((end) => pct - end >= minGapPct);
      if (lane === -1) lane = laneEnds.push(pct) - 1;
      else laneEnds[lane] = pct;
      return { ...item, pct, lane };
    });
}
