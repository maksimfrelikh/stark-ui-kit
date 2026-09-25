#!/usr/bin/env node
// Generates the Claude Design "Design System" artifact files from the kit's CSS.
//
//   npm run design-system        → design-system/project/{tokens.json, components/bundle.css, design-system.json}
//
// The kit is the only source of truth. tokens.json carries exactly the --brand-* contract
// (theme-mono.css) plus the structural scales (tokens.css); the compiled tokens.css the
// artifact page produces therefore defines the same --brand-* custom properties a host would,
// and the kit's own CSS runs unchanged inside bundle.css. Whatever the artifact's token
// grammar cannot hold (clamp() type scale, --gut, motion, color-mix()) lives in bundle.css
// and is listed under "Not synced" in README.md. README.md and components/*/ are hand-written
// and committed; this script never touches them.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const css = (f) => readFileSync(resolve(root, 'src/styles', f), 'utf8');
const out = (f, s) => writeFileSync(resolve(root, 'design-system/project', f), s);
const tokensCss = css('tokens.css');
const monoCss = css('theme-mono.css');
const sha = execSync('git rev-parse --short HEAD', { cwd: root }).toString().trim();
const now = new Date().toISOString();

// --name: value; pairs inside the first block that starts with `selector {`
function block(src, selector) {
  const i = src.indexOf(selector);
  if (i < 0) throw new Error('selector not found: ' + selector);
  const body = src.slice(src.indexOf('{', i) + 1, src.indexOf('}', i));
  const vars = {};
  for (const m of body.matchAll(/(--[\w-]+):\s*([^;]+);/g)) vars[m[1]] = m[2].trim();
  return vars;
}
const light = block(monoCss, ':root {');
const dark = block(monoCss, '[data-theme="dark"] {');
const structural = block(tokensCss, ':root {');

const usage = {
  'brand-bg': 'Page background. The canvas every other token is read against.',
  'brand-fg': 'Primary text and the ink hover fill. Also the base of every color-mix() wash (focus tint 4%, active row 9%, tap highlight 10%).',
  'brand-muted': 'Secondary text at 11–13px. Check it on the darkest fill it can sit on (the active palette row, --fg at 9%), not on the bare background.',
  'brand-faint': 'Captions, meta, placeholders, the ⌘K group labels. AA at body size; do not use it under 12px on a tinted surface.',
  'brand-line': 'Hairlines: the one vertical rule in a bisect section, the nav border on scroll, pre borders. Decorative (1.5:1 on dark), never a control edge.',
  'brand-line-2': 'Control borders: chips, the theme toggle, the language pill, the ⌘K card, the mobile menu edge. Visible on its own background in both themes.',
  'brand-ink': 'Strong rules, inverted blocks, the hover/active fill of pills and buttons, ::selection background.',
  'brand-ink-fg': 'Text on brand-ink.',
  'brand-scroll-shadow': 'Edge fade of horizontally scrolling code blocks (a light glow on dark, since a dark shadow is invisible on #000).',
  'brand-scrim': 'Backdrop behind the ⌘K overlay. Dims toward black in both themes on purpose: a light wash over a light page reads as fog.',
  'brand-tap-highlight': 'Touch press wash (-webkit-tap-highlight-color): --fg at 10% instead of the platform’s fixed 18% black, so it follows the theme.',
  'brand-muted-contrast': 'brand-muted when prefers-contrast: more — AAA text (7.46:1 light, 10.16:1 dark).',
  'brand-faint-contrast': 'brand-faint when prefers-contrast: more — AAA text (7.00:1 light, 8.45:1 dark).',
  'brand-line-contrast': 'brand-line when prefers-contrast: more — 3.45:1 light, 3.06:1 dark (tight, do not lower).',
  'brand-line-2-contrast': 'brand-line-2 when prefers-contrast: more — 5.10:1 light, 4.26:1 dark.',
};
const colorNames = Object.keys(usage);
const literal = { // color-mix() values the grammar cannot hold, resolved per theme
  'brand-scrim': { light: 'rgba(0, 0, 0, 0.58)', dark: 'rgba(0, 0, 0, 0.58)' },
  'brand-tap-highlight': { light: 'rgba(11, 11, 11, 0.10)', dark: 'rgba(242, 242, 242, 0.10)' },
};
const colorTokens = colorNames.map((name) => {
  const value = literal[name] ?? { light: light['--' + name], dark: dark['--' + name] };
  if (!value.light || !value.dark) throw new Error('missing theme value for ' + name);
  return { name, value, usage: usage[name] };
});

// fluid type at the reference viewport (1440px, 16px root) — clamp() itself cannot be a style
const px = (expr, vw = 1440) => {
  const m = /clamp\(([\d.]+)rem,\s*([\d.]+)vw,\s*([\d.]+)rem\)/.exec(expr);
  if (!m) throw new Error('not a clamp: ' + expr);
  const v = Math.min(Math.max(+m[1] * 16, (+m[2] * vw) / 100), +m[3] * 16);
  return Math.round(v * 100) / 100;
};
const scale = (k) => structural['--t-' + k].replace(/^calc\((.*) \* var\(--scale\)\)$/, '$1');
const styles = [
  ['mega', 1.0, 'Hero name. letter-spacing -0.035em, text-wrap: balance.'],
  ['h1', 1.05, 'Article title. letter-spacing -0.025em.'],
  ['h2', 1.1, 'Section title. letter-spacing -0.02em.'],
  ['h3', 1.2, 'Card/project title, blockquote.'],
  ['lead', 1.55, 'Article lead paragraph, in brand-muted.'],
  ['body', 1.55, 'Body copy. Prose paragraphs use line-height 1.68.'],
  ['meta', 1.55, 'Dates, counts, captions, the skip link.'],
].map(([k, lh, u]) => ({ name: 't-' + k, fontSize: px(scale(k)) + 'px', lineHeight: lh, fontWeight: k === 'mega' || k === 'h1' || k === 'h2' || k === 'h3' ? 600 : 400,
  sample: k === 'mega' ? 'Frelikh' : undefined, usage: `${u} Fluid in code: ${scale(k)} × --scale.` }));

const tokens = {
  name: 'Stark', version: 1,
  meta: { source: 'github', repo: 'maksimfrelikh/stark-ui-kit', ref: `main@${sha}`,
    paths: { tokens: ['src/styles/tokens.css', 'src/styles/theme-mono.css'], css: ['src/styles/prose.css', 'src/styles/theme-toggle.css', 'src/styles/lang-switch.css', 'src/styles/command-palette.css'] },
    synced: now, generator: 'scripts/design-system.mjs' },
  color: {
    note: 'Strictly monochrome: black, white, grey. No accent colour, by decision. Names are the kit’s --brand-* contract; a host sets exactly these.',
    themes: [{ id: 'light', name: 'Light' }, { id: 'dark', name: 'Dark (production default)' }],
    tokens: colorTokens,
  },
  type: {
    fonts: [],
    families: {
      grotesk: light['--brand-font-grotesk'].replace(/"Archivo Fallback", /, ''),
      mono: light['--brand-font-mono'],
    },
    groups: [
      { name: 'Scale', family: 'grotesk', styles },
      { name: 'Labels', family: 'grotesk', styles: [
        { name: 'label', fontSize: px(scale('meta')) + 'px', lineHeight: 1, fontWeight: +structural['--label-weight'], letterSpacing: structural['--label-track'], sample: 'PROJECTS · WRITING · RESUME', usage: 'Uppercase tracked labels: nav links, section kickers, skip link. text-transform: uppercase; frelikh.com tracks them at 0.14em.' },
      ] },
      { name: 'Mono', family: 'mono', styles: [
        { name: 'code', fontSize: '13.44px', lineHeight: 1.6, fontWeight: 400, sample: 'npm run visual', usage: 'Code blocks (0.84em of body) and inline code chips; ⌘K key hints at 0.72rem.' },
      ] },
    ],
  },
  spacing: { note: 'Rhythm is fluid in code (--gut: clamp(20px, 5vw, 72px); --section-pad on the site) and cannot be listed here — see bundle.css.',
    tokens: [{ name: 'maxw', value: structural['--maxw'], usage: 'Content container (.wrap) max width.' }] },
  radius: { tokens: [
    { name: 'r-xs', value: structural['--r-xs'], usage: 'Hairline corners: focus ring, thin bars, inline code chips.' },
    { name: 'r-sm', value: structural['--r-sm'], usage: 'Chips, inputs, small buttons, the theme toggle.' },
    { name: 'r-md', value: structural['--r-md'], usage: 'Cards, overlays, the ⌘K palette. Nested corners are concentric: inner = outer − gap.' },
    { name: 'r-pill', value: structural['--r-pill'], usage: 'Pills: the language switch, contact pills.' },
    { name: 'r-circle', value: structural['--r-circle'], usage: 'Dots.' },
  ] },
  zIndex: { note: 'One ladder for every layer.', tokens: [
    { name: 'z-below', value: structural['--z-below'], usage: 'Decorative pseudo-element behind its box.' },
    { name: 'z-nav', value: structural['--z-nav'], usage: 'Sticky nav.' },
    { name: 'z-skip', value: structural['--z-skip'], usage: 'Skip-to-content link, above the nav when focused.' },
    { name: 'z-overlay', value: structural['--z-overlay'], usage: 'Command palette, reading-progress bar.' },
    { name: 'z-modal', value: structural['--z-modal'], usage: 'A dialog above the palette overlay (reserved).' },
  ] },
};
out('tokens.json', JSON.stringify(tokens, null, 2) + '\n');

const bundle = `/* GENERATED by scripts/design-system.mjs from stark-ui-kit@${sha} — do not edit here.
   Loaded after the page's compiled tokens.css, which defines the --brand-* custom
   properties from tokens.json. Everything below is the kit's own CSS, verbatim, plus the
   few declarations the token grammar cannot express. */
@import url("https://fonts.googleapis.com/css2?family=Archivo:wght@100..900&family=IBM+Plex+Mono:wght@400;500&family=Onest:wght@100..900&display=swap");

/* fonts: the same stacks tokens.json lists, on the kit's --brand-* contract */
:root {
  --brand-font-grotesk: ${tokens.type.families.grotesk};
  --brand-font-mono: ${tokens.type.families.mono};
  color-scheme: light;
  --theme-toggle-flip: 180deg;   /* the kit's contract: set where LIGHT is active */
}
[data-theme="dark"] { color-scheme: dark; --theme-toggle-flip: 0deg; }

/* not expressible as tokens: fluid rhythm and the site's section padding */
:root { --section-pad: clamp(64px, 8vh, 112px); }

/* ---- src/styles/tokens.css ---- */
${tokensCss}
/* ---- src/styles/prose.css ---- */
${css('prose.css')}
/* ---- src/styles/theme-toggle.css ---- */
${css('theme-toggle.css')}
/* ---- src/styles/lang-switch.css ---- */
${css('lang-switch.css')}
/* ---- src/styles/command-palette.css ---- */
${css('command-palette.css')}`;
out('components/bundle.css', bundle);

const indexPath = resolve(root, 'design-system/project/design-system.json');
const prev = existsSync(indexPath) ? JSON.parse(readFileSync(indexPath, 'utf8')) : null;
const index = prev ?? { v: 3, layout: 'files', createdOnFiles: { v: 1, at: now }, title: 'Stark', namespace: 'Stark', libraries: [], sections: {}, groups: [], assetGroups: {}, blobs: {}, docs: { readme: 'project/README.md', sections: [] } };
index.lastChange = { by: 'Maksim Frelikh', at: now, via: `Claude Code · maksimfrelikh/stark-ui-kit@${sha}`, note: `regenerated from stark-ui-kit@${sha}` };
writeFileSync(indexPath, JSON.stringify(index, null, 2) + '\n');
console.log(`design-system/project written from ${sha}: ${colorTokens.length} colours × 2 themes, ${styles.length + 2} text styles, ${tokens.radius.tokens.length} radii, ${tokens.zIndex.tokens.length} z-steps`);
