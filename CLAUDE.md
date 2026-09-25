# stark-ui-kit — guide for Claude Code

Read `README.md` first: it is the consumer contract (install by commit sha, import order,
`--brand-*` theming, the per-stylesheet host contracts, the utilities and hooks). This file
holds only what the README does not: what the kit is a part of, who consumes it, the rules
for changing it, and how a change travels. Keep both true when the code moves — a note that
lies is worse than none.

## What this is

The portable part of **Stark**, a strictly monochrome design language (black / white / grey,
no accent colour — a decision, not an omission). The reference rendering is frelikh.com
(repo `maksimfrelikh/frelikh`). The whole language — header, hero, bisect sections, list rows,
rhythm — is documented as the Claude Design system **Stark**:
https://claude.ai/artifact/Da7if9WhD7hxZjf5sL6m2F. That system is **generated from the
frelikh repo** (`npm run design-system` there), not from here: the kit alone cannot carry the
full look. See `frelikh/CLAUDE.md` for the generator and the republish steps.

Hosts on any stack consume the same package: the CSS is plain CSS, the root JS entry imports
no framework. Astro (frelikh), React (hushsend) and, planned, a Svelte/other host (quietkit)
all take it the same way.

## Consumers (pinned by commit — verify with `grep stark-ui-kit <repo>/package.json`)

| repo | stack | pin (as of 2026-09-25) | takes |
|---|---|---|---|
| `frelikh` | Astro SSR | `2a3f7ec` = 0.3.0 | every stylesheet, `theme-mono.css`, `trapTab` / `lockScroll` / `copyToClipboard` |
| `hushsend` | Vite + React | `b23a2e5` = 0.1.0 (pre-split) | `styles.css` + `copyToClipboard`; its own `--brand-*` in `src/ui/theme.css`. Moving it to `theme-mono.css` + `stark-ui-kit/react` is an open item in `hushsend/BACKLOG.md` |
| quietkit | planned | — | spec: `~/projects/quietkit-spec.md` on laptop-server, § 4.2 |

## Rules

1. **The root entry imports no framework.** React hooks live only in `src/react.ts`
   (`stark-ui-kit/react`, `react` an optional peer). Measured cost of breaking this: frelikh's
   page chunk grew from 4.9 KB to 13 KB with React inside.
2. **Brand is a contract.** `tokens.css` reads `var(--brand-*, <neutral fallback>)`; house
   values live only in `theme-mono.css`. The fallbacks in `tokens.css` are NOT the site's
   values — when deciding whether something "is already fixed", check `theme-mono.css` and the
   computed style on a live page, not the declaration.
3. **Additive.** Add tokens and classes; rename or remove one only with every consumer bumped
   in the same pass. Consumers pin a sha, so nothing breaks silently — the pin bump is where a
   breaking change surfaces.
4. **One stylesheet per component, each its own entry.** A new file needs: an `exports` key
   and a `files` entry in `package.json`, a header comment describing the expected markup and
   the host contract, and a row in the README table. Behaviour (keyboard, aria, state) stays
   with the host; the kit ships styles plus the two DOM primitives the styles depend on.
5. **Two consumers before promotion.** Site behaviour (scroll-spy, ⌘K filtering, the GitHub
   graph, TOC) never comes here; a component with one consumer stays in that consumer.
6. **Values are never copied by hand** — not from screenshots, not from the design-system
   artifact, not from a mockup. Three divergent copies of the greys existed before
   `theme-mono.css`; the code here is the single source.
7. Breakpoints inside the component stylesheets (900 / 680 / 480 px) are frelikh's; a host with
   a different nav shape overrides them in its own CSS rather than changing them here.

## How a change travels

1. Edit here → `npx tsc --noEmit && npm run build` → commit → push.
2. In each consumer: bump the sha in `package.json`, `npm install` (npm caches a git dep by
   sha; a `file:` dep is cached by version and goes stale — never use it), then run that
   host's gates (frelikh: `npm run verify` and the screenshot gate `npm run visual`).
3. In frelikh: `npm run design-system`, commit the regenerated files, republish the Stark
   artifact (steps in `frelikh/CLAUDE.md`).
4. Update the consumer table above.

## Verify

`npx tsc --noEmit && npm run build`. There is no test suite in this repo; the proof that a kit
change did not move the design is frelikh's visual-regression gate (`frelikh/visual/`).

## Where the clones are

Private GitHub repo `maksimfrelikh/stark-ui-kit`, not on the npm registry (`npm install
stark-ui-kit` fetches an unrelated package). Clones: `~/projects/stark-ui-kit` on the owner's
Mac and on laptop-server; both sync only through GitHub `main` — `git pull --ff-only` before
editing on either machine.
