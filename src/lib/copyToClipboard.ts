// Low-level copy-to-clipboard. Resolves true on success, false if the Clipboard API is
// unavailable (insecure context / no permission) or the write rejects at runtime — so the
// caller can fall back (e.g. open a `mailto:` link) instead of trapping the user. UI
// feedback (icon flips, live-region announcements) is intentionally left to the caller.

/** Low-level copy. Resolves true on success, false if unavailable or rejected. */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!navigator.clipboard?.writeText) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
