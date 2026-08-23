/**
 * adminAllowlist — shared client-side allowlist of authorized admin
 * Principal IDs for the `/admin/*` workspace.
 *
 * The backend is the source of truth for admin authorization via the
 * `isAdmin(caller)` query (see `hooks/useIsAdmin.ts`). When the backend
 * whitelist is empty, the backend authorizes the first signed-in user.
 *
 * This constant is a FAST-PATH FALLBACK layered on top: it lets a known
 * operator be authorized immediately, even before the backend `isAdmin`
 * query resolves (or if it errors). `AdminAuthGuard` and
 * `StripeSetupPanel` treat the user as authorized when EITHER the
 * backend `isAdmin` returns true OR the Principal ID appears below.
 *
 * ── Adding a new administrator ──────────────────────────────────────
 * Append the new operator's Internet Identity Principal ID (the exact
 * string returned by `identity.getPrincipal().toText()`) to the array
 * below. Principal IDs are long base32-text strings of the form
 * `xxxxx-xxxxx-...-xxxxx`. Keep one ID per line with a trailing comma
 * and an inline `// <name>` comment so the roster stays auditable.
 *
 * To revoke access, delete the line and redeploy. There is no in-app
 * UI to manage this list by design.
 */
export const ALLOWED_ADMIN_IDS: readonly string[] = [
  // Primary administrator — project lead.
  "u6iie-cqa5c-ml72l-7bv43-lb63c-rfitx-5hsbq-75oi6-cej4e-dusny-iae",
  // ── Append additional authorized Principal IDs below this line ──
  // "<principal-id-text>",
];

/**
 * Returns true when the given Principal ID text is on the admin
 * allowlist. Comparison is exact and case-sensitive (Principal IDs are
 * canonical text). An empty / undefined id is never authorized.
 */
export function isAllowedAdmin(
  principalText: string | undefined | null,
): boolean {
  if (!principalText) return false;
  return ALLOWED_ADMIN_IDS.includes(principalText);
}
