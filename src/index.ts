// Low-level utilities (framework-agnostic)
export { trapTab } from './lib/focusTrap';
export { lockScroll, unlockScroll } from './lib/scrollLock';
export { copyToClipboard } from './lib/copyToClipboard';

// React hooks (thin wrappers over the utilities above)
export { useFocusTrap } from './lib/useFocusTrap';
export { useScrollLock } from './lib/useScrollLock';
