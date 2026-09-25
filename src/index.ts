// Framework-agnostic entry. Nothing here imports React (or any framework): an Astro,
// Svelte or plain-DOM host bundles only what it uses. The React hooks live behind
// 'stark-ui-kit/react' so that a non-React consumer never pulls React into its bundle
// (measured: re-exporting the hooks from here grew frelikh's page chunk from 4.9 KB to
// 13 KB with React inside).
export { trapTab } from './lib/focusTrap';
export { lockScroll, unlockScroll } from './lib/scrollLock';
export { copyToClipboard } from './lib/copyToClipboard';
