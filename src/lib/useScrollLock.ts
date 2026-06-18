import { useEffect } from 'react';
import { lockScroll, unlockScroll } from './scrollLock';

/**
 * Thin React wrapper around {@link lockScroll} / {@link unlockScroll}. Locks body scroll
 * while `active`, releasing on unmount or when `active` flips false. The underlying counter
 * makes nested locks (and React 18 StrictMode's double-invoked effects) safe.
 */
export function useScrollLock(active = true): void {
  useEffect(() => {
    if (!active) return;
    lockScroll();
    return () => unlockScroll();
  }, [active]);
}
