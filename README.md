# stark-ui-kit

The portable layer of a monochrome design system: structural design tokens + a
normalisation/a11y base, plus headless UI utilities and thin React hooks.

This package ships **structure, not brand**. Colours, fonts and themes are a contract:
you supply them via `--brand-*` custom properties; sensible neutral fallbacks apply if you
don't. No project-specific palette or typefaces are baked into the core — an optional monochrome
theme ships alongside it (see below).

## Install

```sh
npm install stark-ui-kit
```

`react` and `react-dom` (>=18) are peer dependencies — only needed if you use the hooks.

## Styles

Import the token + base layer once, at the root of your app:

```ts
import 'stark-ui-kit/styles.css';
```

> **Import order.** The token *contract* is order-independent — the kit reads
> `var(--brand-*, fallback)` rather than competing on the same declarations, so your
> `--brand-*` values always win wherever you set them. The **base layer** (reset + body
> base), however, is real declarations on ordinary properties: import the kit CSS **before**
> your own global stylesheet, and don't stack a second reset on top of it, or you'll hit
> cascade conflicts.

Then theme it by setting `--brand-*` on `:root` (and per `[data-theme]` for dark mode):

```css
:root {
  --brand-bg: #ffffff;
  --brand-fg: #0b0b0b;
  --brand-muted: #6c6c6c;
  --brand-line: #e6e6e6;
  --brand-ink: #0b0b0b;
  --brand-ink-fg: #ffffff;
  --brand-font-grotesk: "Archivo Variable", system-ui, sans-serif;
  --brand-font-mono: "IBM Plex Mono", ui-monospace, monospace;
}
[data-theme="dark"] {
  --brand-bg: #000000;
  --brand-fg: #f2f2f2;
  /* … */
}
```

Tokens exposed: radii (`--r-xs/sm/md/pill/circle`), z-index ladder
(`--z-below/nav/skip/overlay/modal`), motion (`--ease-out/-soft`, `--dur-fast/base/slow`),
type scale (`--t-mega/h1/h2/h3/lead/body/meta`), weights (`--w-display/name/strong`),
label system (`--label-case/track/font/weight`), rhythm (`--maxw`, `--gut`, `--scale`),
`--scroll-shadow` for horizontally scrolling panels, `--scrim` for overlay backdrops,
`--tap-highlight` for the touch press wash, and the semantic colour/font roles above. Base layer adds reset, `:focus-visible`,
`.sr-only`, `.skip-link`, themed scrollbars and `prefers-reduced-motion` /
`prefers-contrast` handling.

## Monochrome theme (optional)

The core is brand-free. `theme-mono.css` is one concrete filling of the contract: the
strictly monochrome house palette — black / white / grey, **no accent colour**, which is a
deliberate design decision rather than an omission.

```ts
import 'stark-ui-kit/styles.css';      // structure + base  (always)
import 'stark-ui-kit/theme-mono.css';  // house palette     (optional)
```

It defines `--brand-*` only, so it composes with the core instead of overriding it, and you
can still override any single value after the import. Skip it entirely and supply your own
`--brand-*` for a different look.

Theme selection:

| Host markup | Result |
|---|---|
| `:root` (baseline) | light |
| `<html data-theme="dark">` | dark |
| `<html data-theme="light">` | light |
| no `data-theme` attribute | follows `prefers-color-scheme` |

A host that always writes `data-theme` never reaches the OS branch, so adopting the theme
cannot change its boot theme.

It also sets `color-scheme` per theme, so native scrollbars, form controls and the canvas
match without extra work.

> **Source of truth: frelikh.com (`src/styles/app.css`), verbatim.** That site is the
> reference rendering; every value here is the one it ships, high-contrast included, and its
> appearance does not move to accommodate this package. Each value carries its contrast ratio
> in a comment so nobody has to re-derive them. Don't take values from a screenshot, a mockup
> or an extracted design-system artefact: three divergent copies of these greys existed before
> this file, and the high-contrast set is exactly where they drifted apart — one of them left
> hairlines at 1.74:1, under the 3:1 that SC 1.4.11 asks of non-text contrast.

## Two behaviours worth knowing

**Theme switching should be a cut.** Flipping a theme is a change of context, not an
interaction with a control, so cross-fading every themed property at once reads as a wash.
The base layer zeroes all transitions while `data-theme-switching` is present on `<html>`:

```ts
html.setAttribute('data-theme-switching', '');
html.setAttribute('data-theme', next);
void getComputedStyle(html).backgroundColor;   // commit inside the window
requestAnimationFrame(() => html.removeAttribute('data-theme-switching'));
```

**Touch gets a press state.** Every hover here is gated on `@media (hover: hover)`, so a
phone would otherwise see nothing. Rather than switch `-webkit-tap-highlight-color` off and
enumerate every interactive element, the kit recolours it through `--tap-highlight` — a
monochrome wash derived from `--fg` instead of the platform's fixed ~18% black. Coverage
stays complete, including elements added later. The kit's own controls additionally carry an
`:active` mirroring their hover, unconditionally: on a pointer device hover has already
taken them there, so it only adds the state where nothing else would.

## Utilities & hooks

```ts
import {
  trapTab, lockScroll, unlockScroll, copyToClipboard,
  useFocusTrap, useScrollLock,
} from 'stark-ui-kit';
```

- `trapTab(container, event)` — wrap Tab/Shift+Tab inside a dialog (call from a keydown handler).
- `lockScroll()` / `unlockScroll()` — counter-based body-scroll lock (pairs with `scrollbar-gutter: stable`).
- `copyToClipboard(text)` — low-level copy; resolves `false` when unavailable so you can fall back.
- `useFocusTrap(ref, active?)` / `useScrollLock(active?)` — thin React wrappers over the above.

> These modules are safe to import anywhere — they touch `document` / `window` / `navigator`
> only when called, never at module load — so they won't crash an SSR/server render. The DOM
> work itself still has to run client-side, so call the utilities (and the hooks' effects)
> in the browser.
