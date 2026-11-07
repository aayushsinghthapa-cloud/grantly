import { useReducedMotion as useFramerReducedMotion } from 'framer-motion';

/** True when the user prefers reduced motion — use to skip non-essential animation. */
export function useReducedMotion(): boolean {
  return useFramerReducedMotion() ?? false;
}
