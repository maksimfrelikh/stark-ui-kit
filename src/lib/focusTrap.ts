// Modal focus management. aria-modal="true" tells assistive tech to treat the rest of the
// page as inert, but it does NOT stop the Tab key from walking into the background — that
// needs an explicit trap. This helper keeps keyboard focus inside an open dialog.

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/** Visible, tabbable elements inside `container`, in DOM order. */
function focusable(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.getClientRects().length > 0,
  );
}

/**
 * Wrap Tab / Shift+Tab around the focusable elements of `container`. Call from a keydown
 * handler while the dialog is open. It only preventDefaults when it actually needs to move
 * focus, so normal tabbing between in-dialog controls is untouched. With a single tabbable
 * control (e.g. a search input) focus simply stays put.
 */
export function trapTab(container: HTMLElement, e: KeyboardEvent): void {
  if (e.key !== 'Tab') return;
  const nodes = focusable(container);
  if (nodes.length === 0) {
    e.preventDefault();
    return;
  }
  const first = nodes[0]!;
  const last = nodes[nodes.length - 1]!;
  const active = document.activeElement;
  if (e.shiftKey) {
    if (active === first || !container.contains(active)) {
      e.preventDefault();
      last.focus();
    }
  } else if (active === last || !container.contains(active)) {
    e.preventDefault();
    first.focus();
  }
}
