import { useEffect, type RefObject } from 'react';
import { trapTab } from './focusTrap';

/**
 * Thin React wrapper around {@link trapTab}. While `active`, wraps Tab / Shift+Tab around
 * the focusable elements inside the element referenced by `ref` (attach it to your dialog
 * container). Listens on `document` so the trap holds wherever focus currently sits.
 */
export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  active = true,
): void {
  useEffect(() => {
    if (!active) return;
    const el = ref.current;
    if (!el) return;
    const onKeyDown = (e: KeyboardEvent) => trapTab(el, e);
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [ref, active]);
}
