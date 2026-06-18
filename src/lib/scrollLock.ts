// Body-scroll lock for modal / overlay surfaces.
//
// The host page should reserve the scrollbar track at all times
// (html { scrollbar-gutter: stable } — shipped in src/styles/tokens.css) so opening a
// modal doesn't shove a centred layout sideways. But a plain `overflow: hidden` lock
// leaves that reserved track EMPTY: a fixed-position scrim can't paint into the scrollbar
// gutter — it sits outside the scrollport — so the bare gutter shows the canvas background
// (invisible on a dark theme; a bright vertical strip next to the dim scrim on a light one).
//
// So while locked we DROP the reservation (scrollbar-gutter: auto) — which lets the scrim
// reach the viewport edge — and pad the body by the scrollbar's width instead, which keeps
// the centred layout from shifting. A counter lets nested locks stack (e.g. a global palette
// opening over a modal) without the inner close prematurely unlocking the outer.

// `document.documentElement` is read lazily inside each call (never at module load) so this
// module is safe to import in an SSR / server context where `document` doesn't exist. It's a
// stable singleton for the page's lifetime, so reading it per-call is behaviourally identical
// to caching it once.
let locks = 0;

export function lockScroll(): void {
  if (locks++ > 0) return; // already locked — keep the first measurement
  const html = document.documentElement;
  const sbw = window.innerWidth - html.clientWidth; // reserved gutter / scrollbar width
  html.style.scrollbarGutter = 'auto';
  document.body.style.overflow = 'hidden';
  if (sbw > 0) document.body.style.paddingRight = `${sbw}px`;
}

export function unlockScroll(): void {
  if (locks === 0 || --locks > 0) return;
  const html = document.documentElement;
  html.style.scrollbarGutter = '';
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
}
