import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// jsdom lacks a few browser APIs the UI relies on (skipped for node-environment logic tests).
if (typeof window !== 'undefined') {
  if (!window.matchMedia) {
    window.matchMedia = (query: string) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList;
  }
  class NoopObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  window.IntersectionObserver ??= NoopObserver as unknown as typeof IntersectionObserver;
  window.ResizeObserver ??= NoopObserver as unknown as typeof ResizeObserver;
  window.scrollTo = () => {};
  Element.prototype.scrollIntoView ??= () => {};
}

afterEach(() => {
  if (typeof window === 'undefined') return;
  cleanup();
  localStorage.clear();
});
