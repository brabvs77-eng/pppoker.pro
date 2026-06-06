'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    elementorFrontend?: {
      elementsHandler?: {
        runReadyTrigger: (scope: unknown) => void;
      };
    };
    jQuery?: (selector: unknown) => {
      each: (fn: (this: Element) => void) => unknown;
      length: number;
    };
  }
}

/** Re-run Elementor widget handlers after React hydration (swiper, popups, FAQ). */
export function LegacyElementorBoot() {
  useEffect(() => {
    const boot = () => {
      const { elementorFrontend, jQuery } = window;
      if (!elementorFrontend?.elementsHandler?.runReadyTrigger || !jQuery) return;

      jQuery('.elementor-element').each(function bootElement(this: Element) {
        elementorFrontend.elementsHandler!.runReadyTrigger(jQuery(this));
      });
    };

    const schedule =
      typeof window.requestIdleCallback === 'function'
        ? window.requestIdleCallback.bind(window)
        : (fn: () => void) => window.setTimeout(fn, 0);

    if (document.readyState === 'complete') {
      schedule(boot);
    } else {
      window.addEventListener('load', () => schedule(boot), { once: true });
    }
  }, []);

  return null;
}
