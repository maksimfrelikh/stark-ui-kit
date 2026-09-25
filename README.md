# stark-ui-kit

The portable layer of a monochrome design system: structural design tokens + a
normalisation/a11y base, optional component stylesheets, and two headless DOM
utilities (focus trap, scroll lock) with thin React hooks on a separate entry.
Framework-agnostic by construction: the CSS is plain CSS, the root JS entry imports no
framework, so Astro, Svelte, React and plain-DOM hosts all consume the same package.

This package ships **structure, not brand**. Colours, fonts and themes are a contract:
you supply them via `--brand-*` custom properties; sensible neutral fallbacks apply if you
don't. No project-specific palette or typefaces are baked into the core — an optional monochrome
theme ships alongside it (see below).

## Install

The package is private and is not on the npm registry (`npm install stark-ui-kit` would
fetch an unrelated package of the same name). Consumers depend on the GitHub repo, pinned
by commit:

```json
"stark-ui-kit": "github:maksimfrelikh/stark-ui-kit#<sha>"
```

npm builds `dist/` on install through the `prepare` script. Changing the kit is two steps:
push here, then bump the sha in the consumer and reinstall — npm keeps serving the old
commit from its cache otherwise. Do not use `file:../stark-ui-kit`: npm packs a `file:` dep
once and caches it by version, so edits silently stop reaching the consumer.

`react` (>=18) is an **optional** peer dependency, needed only by `stark-ui-kit/react`.
Non-React hosts install nothing extra.

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
  --brand-muted: #666666;
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

> **Where a value lives.** The palette was lifted verbatim from frelikh.com, which remains
> the reference *rendering*: its committed visual-regression baselines (`frelikh/visual/`)
> are what proves a kit change did not move the design. But the *values* now live here:
> frelikh declares no `--brand-*` of its own, so a change is made in this file first and the
> site follows by bumping its pin (the one deliberate change so far: light `--brand-muted`
> `#6c6c6c` → `#666666`, for contrast on tinted rows). Each value carries its contrast ratio
> in a comment so nobody has to re-derive them. Don't take values from a screenshot, a mockup
> or an extracted design-system artefact: three divergent copies of these greys existed before
> this file, and the high-contrast set is exactly where they drifted apart — one of them left
> hairlines at 1.74:1, under the 3:1 that SC 1.4.11 asks of non-text contrast.

## Component stylesheets (optional)

Each is a separate entry so a host takes only what it renders. Every file starts with a
header describing the expected markup; the contracts a host must supply are listed here:

| Import | What | Host contract |
|---|---|---|
| `stark-ui-kit/prose.css` | long-form typography for Markdown content (`.prose`, `.prose-title`, `.prose-lead`) | `--measure` (optional; default 64ch of body text frozen to `36.672rem`) |
| `stark-ui-kit/theme-toggle.css` | the light/dark toggle chip (`.theme-toggle` + inline SVG) | set `--theme-toggle-flip: 180deg` wherever the LIGHT theme is active; keep `aria-pressed` in sync |
| `stark-ui-kit/lang-switch.css` | two-option segmented control (`.lang-switch`, `.lang-sep`) | mark the active option with `aria-current="page"` (link) or `aria-pressed="true"` (button) |
| `stark-ui-kit/command-palette.css` | ⌘K hint chip and palette surface (`.cmdk-*`) | behaviour is the host's: toggle the `hidden` attribute, keep `.cmdk-item.active` = `aria-activedescendant`, use `trapTab` / `lockScroll` below |

The breakpoints inside `lang-switch.css` and `command-palette.css` (900px, 680px, 480px)
are the house ones from frelikh.com; override them in your own stylesheet if your nav
changes shape elsewhere.

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
// any host — no framework imports behind this entry
import { trapTab, lockScroll, unlockScroll, copyToClipboard } from 'stark-ui-kit';

// React hosts only — this entry imports 'react'
import { useFocusTrap, useScrollLock } from 'stark-ui-kit/react';
```

- `trapTab(container, event)` — wrap Tab/Shift+Tab inside a dialog (call from a keydown handler). `aria-modal` alone does not stop Tab leaving the dialog.
- `lockScroll()` / `unlockScroll()` — counter-based body-scroll lock. It belongs to the kit because it is coupled to the kit's CSS: `tokens.css` reserves the scrollbar gutter, and the lock drops that reservation while locked and pads the body instead, so a scrim reaches the viewport edge without shifting a centred layout.
- `copyToClipboard(text)` — low-level copy; resolves `false` when unavailable so you can fall back. A convenience, not part of the design system; kept because hosts already use it.
- `useFocusTrap(ref, active?)` / `useScrollLock(active?)` — thin React wrappers over the two utilities above.

The hooks are on their own entry on purpose: when they were re-exported from the root,
a non-React consumer that imported `trapTab` got React bundled along with it (frelikh's
page chunk grew from 4.9 KB to 13 KB).

> These modules are safe to import anywhere — they touch `document` / `window` / `navigator`
> only when called, never at module load — so they won't crash an SSR/server render. The DOM
> work itself still has to run client-side, so call the utilities (and the hooks' effects)
> in the browser.
