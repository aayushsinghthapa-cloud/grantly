/**
 * scrollcraft engine (MIT, © Nate Herk, see ./LICENSE), vendored unmodified.
 * The engine is an IIFE that attaches `window.ScrollCraft`; importing this module runs it once.
 * It never generates DOM: our React markup carries data-sc-* attributes and the engine drives them.
 */
import './scrollcraft.js';

export interface ScrollCraftInstance {
  layout: () => void;
  read: () => void;
  destroy: () => void;
}

interface ScrollCraftGlobal {
  mount: (root?: Element | Document | string, opts?: { lerp?: number }) => ScrollCraftInstance;
}

declare global {
  interface Window {
    ScrollCraft: ScrollCraftGlobal;
  }
}

/** Mount the engine on a subtree. Call the returned destroy() on unmount (client-side routing). */
export function mountScrollCraft(root: Element): ScrollCraftInstance {
  return window.ScrollCraft.mount(root);
}
