import { describe, expect, it } from 'vitest';
import { placeOnTimeline } from './radar';

describe('placeOnTimeline', () => {
  it('drops items outside the window and positions the rest by percentage', () => {
    const placed = placeOnTimeline([{ days: 30 }, { days: -1 }, { days: 61 }, { days: 0 }], 60);
    expect(placed.map((p) => p.pct)).toEqual([0, 50]);
  });

  it('stacks near-collisions into separate lanes and reuses free lanes', () => {
    const placed = placeOnTimeline([{ days: 10 }, { days: 11 }, { days: 12 }, { days: 30 }], 60, 5);
    expect(placed.map((p) => p.lane)).toEqual([0, 1, 2, 0]);
  });
});
