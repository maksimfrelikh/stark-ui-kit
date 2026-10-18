# stark-ui-kit — guide for Claude Code

Read `README.md` first: it is the consumer contract (install by release tag, import order,
`--brand-*` theming, the per-stylesheet host contracts, the utilities and hooks, versioning).
This file holds only what the README does not: the rules for changing the kit and how a
release is cut. Keep both true when the code moves — a note that lies is worse than none.
Consumers are deliberately **not** listed here: the kit is generic, and whoever pins a tag
is their own business.

## What this is

The portable part of **Stark**, a strictly monochrome design language (black / white / grey,
no accent colour — a decision, not an omission). The whole language — header, hero, bisect
sections, list rows, rhythm — lives in the author's reference site, which consumes this kit;
the kit alone cannot carry the full look.

Hosts on any stack consume the same package: the CSS is plain CSS, the root JS entry imports
no framework. Astro (SSR and static), React, Svelte and plain-DOM renderers all take it the
same way.

## Rules

1. **The root entry imports no framework.** React hooks live only in `src/react.ts`
   (`stark-ui-kit/react`, `react` an optional peer). Measured cost of breaking this: a
   non-React consumer's page chunk grew from 4.9 KB to 13 KB with React inside.
2. **Brand is a contract.** `tokens.css` reads `var(--brand-*, <neutral fallback>)`; house
   values live only in `theme-mono.css`. The fallbacks in `tokens.css` are NOT the house
   values — when deciding whether something "is already fixed", check `theme-mono.css` and the
   computed style on a live page, not the declaration.
3. **Additive.** Add tokens and classes; rename or remove one only across a MINOR release with
   the change named in the tag's notes. Consumers pin a tag, so nothing breaks silently — the
   pin bump is where a breaking change surfaces.
4. **One stylesheet per component, each its own entry.** A new file needs: an `exports` key
   and a `files` entry in `package.json`, a header comment describing the expected markup and
   the host contract, and a row in the README table. Behaviour (keyboard, aria, state) stays
   with the host; the kit ships styles plus the two DOM primitives the styles depend on.
5. **Two consumers before promotion.** Site behaviour (scroll-spy, ⌘K filtering, a GitHub
   graph, TOC) never comes here; a component with one consumer stays in that consumer.
6. **Values are never copied by hand** — not from screenshots, not from the design-system
   artifact, not from a mockup. Three divergent copies of the greys existed before
   `theme-mono.css`; the code here is the single source.
7. Breakpoints inside the component stylesheets (900 / 680 / 480 px) are the reference site's;
   a host with a different nav shape overrides them in its own CSS rather than changing them here.
8. **Shape carries meaning; keep the pill on `.lang-switch`.** Tried once as 0.3.1: the switch
   took the `--r-sm` box of `.theme-toggle` and `.cmdk-hint`, and the three nav controls stopped
   reading as two actions plus one state indicator. Reverted the same day, never released.
   Boxes are actions, pills are state.
9. **Touch feedback is quiet, and it is the component's own.** The house palette sets
   `--brand-tap-highlight: transparent` (0.3.2): WebKit's highlight covers the whole tapped
   element the instant a finger lands, and on a full-width row the fg-10% wash read as a flash
   on a real iPhone. The inversion of `.pill` / `.btn` is the HOVER language; on `(hover: none)`
   their `:active` is the fg at 10%, applied with no transition. A new control gets a press
   state of its own on the same terms — never the inversion on touch, never a transition on
   the press.

## Cutting a release

1. Edit → `npx tsc --noEmit && npm run build` → commit on `main`.
2. Bump `version` in `package.json` (semver, see README § Versioning), commit
   `release: vX.Y.Z`, tag it: `git tag -a vX.Y.Z -m "..."` with one line per change that a
   consumer can see, then `git push && git push --tags`.
3. In each consumer: bump the tag in `package.json`, `npm install` (npm caches a git dep by
   commit; a `file:` dep is cached by version and goes stale — never use it), run that host's
   own gates (the reference site also regenerates its design-system export).

## Verify

`npx tsc --noEmit && npm run build`. There is no test suite in this repo; the proof that a kit
change did not move the design is the reference site's visual-regression gate, run there
after the pin bump.

## Where the clones are

Public GitHub repo `maksimfrelikh/stark-ui-kit` (MIT), not on the npm registry. Clones on the
author's machines sync only through GitHub `main` — `git pull --ff-only` before editing.
