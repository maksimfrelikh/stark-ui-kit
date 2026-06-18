# stark-ui-kit

The portable layer of a monochrome design system: structural design tokens + a
normalisation/a11y base, plus headless UI utilities and thin React hooks.

This package ships **structure, not brand**. Colours, fonts and themes are a contract:
you supply them via `--brand-*` custom properties; sensible neutral fallbacks apply if you
don't. No project-specific palette or typefaces are baked in.

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
and the semantic colour/font roles above. Base layer adds reset, `:focus-visible`,
`.sr-only`, `.skip-link`, themed scrollbars and `prefers-reduced-motion` /
`prefers-contrast` handling.

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
