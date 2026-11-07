import { useEffect, useState, type RefObject } from 'react';
import { useReducedMotion } from './useReducedMotion';

/**
 * 'final'   resting state: the finished content. What crawlers, screenshots, pre-rendered HTML
 *           and reduced-motion users see.
 * 'armed'   the visitor has scrolled and the element is about to enter: reset to the start state.
 * 'playing' the element is in view: run the animation (once).
 */
export type PlayPhase = 'final' | 'armed' | 'playing';

/**
 * Progressive-enhancement entrance. Content is complete by default; the animation only runs for
 * a real visitor who scrolls toward it, so nothing is ever hidden from a reader that doesn't scroll.
 * Fires once: scrolling back never re-hides content.
 */
export function usePlayOnScroll(ref: RefObject<HTMLElement>, { playAt = 0.72 } = {}): PlayPhase {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<PlayPhase>('final');

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce) return;
    let armed = false;
    let done = false;

    const check = () => {
      if (done) return;
      const top = el.getBoundingClientRect().top;
      const vh = window.innerHeight;
      if (!armed) {
        if (top > vh && top < vh * 2.5) {
          armed = true; // still below the fold: safe to reset without the reader seeing it
          setPhase('armed');
        } else if (top <= vh) {
          done = true; // already on screen when scrolling began: leave it finished
          cleanup();
        }
        return;
      }
      if (top < vh * playAt) {
        done = true;
        setPhase('playing');
        cleanup();
      }
    };
    const cleanup = () => window.removeEventListener('scroll', check);
    window.addEventListener('scroll', check, { passive: true });
    return cleanup;
  }, [ref, reduce, playAt]);

  return phase;
}
