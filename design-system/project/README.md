# Stark

A strictly monochrome design system: black, white and grey, **no accent colour** — a
decision, not an omission. It is the design of frelikh.com, extracted into the npm package
`stark-ui-kit` (private GitHub repo `maksimfrelikh/stark-ui-kit`) so that hosts on Astro,
React and Svelte share one set of tokens, one base layer and the same few components.

**Source of truth is the code.** Every value on this page is generated from
`src/styles/tokens.css` and `src/styles/theme-mono.css` by `scripts/design-system.mjs`
in that repo; `components/bundle.css` is the kit's CSS verbatim. Nothing here is edited by
hand: a change starts in the kit, is republished here, and reaches the sites by bumping their
dependency pin. frelikh.com is the reference *rendering*, guarded by its screenshot gate.

## Principles

1. **Monochrome, always.** Surfaces are `brand-bg`, text is `brand-fg`, and every wash, tint
   or fill is `brand-fg` mixed into transparency (4 % focus tint, 9 % active row, 10 % tap
   highlight) so it adapts to the theme by itself. Never introduce a hue.
2. **No horizontal rules, no shadows.** Sections, lists and timelines are separated by air:
   a row is its own padding, and the first and last rows sit flush with the edges so a list
   never looks framed. The only line in content is a *vertical* hairline (`brand-line`)
   bisecting a two-column section. Elevation is a hairline border plus a dimmed backdrop
   (`brand-scrim`), never `box-shadow`.
3. **Two themes, dark by default.** Production boots dark. Light is the token baseline.
   Switching themes is a **cut, not a cross-fade**: it is a change of context, so every
   transition is suppressed for one frame while `data-theme` flips.
4. **Type is the ornament.** One grotesk (Archivo; Onest steps in for Cyrillic), one mono
   (IBM Plex Mono). Headings are tight (−0.02 … −0.035 em) and balanced; labels are
   uppercase and tracked. Weight 600 everywhere it is not 400.
5. **Accessibility is structural.** AA contrast on the surface a colour actually sits on,
   a visible 2 px `brand-fg` focus ring, reduced-motion and forced-colors handled in the base
   layer, 24 px targets for every pointer and 44 px on touch.

## Colour

Text greys are chosen for the darkest *fill* they can land on, not for the bare background:
`brand-muted` (#666666 light) sits on the active palette row (`brand-fg` at 9 % ≈ #e9e9e9)
at 4.73:1, and 5.74:1 on `brand-bg`. `brand-faint` is the floor for 12 px+ text on the plain
background only. Hairlines (`brand-line`) are decorative — 1.5:1 on dark — and never carry
meaning; control edges use `brand-line-2`, which is visible in both themes.

`prefers-contrast: more` swaps the four quiet greys for their `*-contrast` twins (AAA text,
≥ 3:1 rules). Windows High Contrast (`forced-colors`) keeps the focus ring and the selected
language option through system `Highlight` colours.

## Motion

Two curves, three durations, nothing else:

| token | value | use |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` | anything that **moves** (transform, position, clip) |
| `--ease-soft` | `ease` | pure colour / opacity fades |
| `--dur-fast` | 120 ms | hovers, colour fades |
| `--dur-base` | 160 ms | link underline reveal, header border, palette entry |
| `--dur-slow` | 280 ms | flips (theme toggle, copy icon), list collapse |

New movement → `--ease-out`; new fade → `--ease-soft`; snap durations to the nearest step.
Link underlines are one mechanic: an ink line that flows in from the left (`::after`,
`right: 100% → 0`). A press is an answer, not an offer: `:active` lands the line at once.
Reduced motion zeroes every duration site-wide; the copy-icon flip degrades to a fade.

## States

- **Focus (keyboard):** `outline: 2px solid var(--fg); outline-offset: 3px` (2 px on controls
  that sit tight against their own border). Mouse focus shows nothing.
- **Hover** is gated behind `@media (hover: hover)`; touch never gets a stuck hover.
- **Touch press** is recoloured, not removed: `-webkit-tap-highlight-color` = `brand-fg` at
  10 %, so coverage stays complete and follows the theme. Strong controls add an `:active`
  mirroring their hover (pills invert into `brand-ink`).
- **Selected / current:** inverted (`brand-ink` on `brand-ink-fg`) for the language switch;
  a 9 % `brand-fg` fill plus full-contrast text for the palette cursor.

## Layout and rhythm

Container `maxw` 1200 px with fluid gutters `clamp(20px, 5vw, 72px)`. Vertical rhythm is
`clamp(64px, 8vh, 112px)` per section on desktop and rebuilt at ≤ 680 px to roughly a third,
proportions kept (section > section head > list row > row internals). Breakpoints, all
`max-width`: **900** (two-column sections collapse, 44 px touch targets), **760** (hero stacks
and centres), **680** (burger menu, flat language switch, palette hint hidden), **480**
(smaller key chip). Radii are one scale (`r-xs` 2 · `r-sm` 6 · `r-md` 10 · `r-pill` · `r-circle`);
nested corners are concentric (inner = outer − gap), the only computed radius allowed.

## Iconography

Inline stroke SVG on `currentColor` only — no icon fonts, no `<img>` icons, no Unicode
glyphs (iOS renders them as colour emoji). Stroke 1.4, rounded caps, sized in em. Two
meanings are kept apart: **↗** = opens in a new tab, **⧉ → ✓** = click copies. There are no
brand logos for contacts; GitHub, Telegram and LinkedIn are text plus the arrow. The theme
toggle is a half-filled circle that rotates 180° — one icon for both themes.

## Components

The kit ships four component stylesheets and two headless utilities; behaviour stays with the
host. Each preview below is a static rendition of markup taken from frelikh.com, styled by the
kit's CSS unchanged. Guidelines per component say what the host must supply (attributes,
custom properties, scripts).

## Not synced

The token grammar of this page cannot hold, so these live in `components/bundle.css` and in
the kit only — never re-derive them from a screenshot:

- the fluid type scale (`--t-mega … --t-meta` are `clamp()` expressions × `--scale`; the
  styles listed here are their values at a 1440 px viewport);
- `--gut` and `--section-pad` (`clamp()`), `--scale`, the weight and label tokens;
- the motion tokens above (no motion family exists here);
- `brand-scrim` and `brand-tap-highlight`, which are `color-mix()` in code and are listed
  here as their resolved literals;
- the metric-matched `"Archivo Fallback"` `@font-face` (a host declares it against CLS);
- fonts load from Google Fonts in previews; the sites self-host them via `@fontsource`.
