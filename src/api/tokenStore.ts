// ─────────────────────────────────────────────────────────────────────────────
// FILE: api/tokenStore.ts
// A tiny wrapper around sessionStorage for the backend JWT access token.
//
// Why sessionStorage (not localStorage)?
//   - sessionStorage is cleared when the tab is closed — so the token doesn't
//     linger after the user closes the browser (more secure).
//   - It IS shared across page refreshes in the SAME tab.
//   - It is NOT shared between tabs (each tab manages its own session).
//
// The token stored here is the backend JWT (short-lived, 15 min). The refresh
// token lives in an httpOnly cookie and is invisible to JavaScript.
// ─────────────────────────────────────────────────────────────────────────────

const KEY = 'eqc_backend_token';

// get: read the token (null if not logged in or tab was just opened)
// set: save a new token after login or refresh
// clear: remove the token on logout or auth failure
export const tokenStore = {
  get: (): string | null => sessionStorage.getItem(KEY),
  set: (token: string): void => { sessionStorage.setItem(KEY, token); },
  clear: (): void => { sessionStorage.removeItem(KEY); },
};
