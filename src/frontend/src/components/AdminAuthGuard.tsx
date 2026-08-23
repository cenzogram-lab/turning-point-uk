import { useIsAdmin } from "@/hooks/useIsAdmin";
import { isAllowedAdmin } from "@/lib/adminAllowlist";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { type ReactNode, useCallback, useEffect, useState } from "react";

/**
 * AdminAuthGuard — single centralized auth + authorization gate for the
 * entire `/admin/*` workspace.
 *
 * Wraps `AdminLayout` (and therefore every `/admin/*` child route) so
 * protection is centralized, not duplicated per page. Renders BEFORE
 * `AdminLayout`'s chrome so the admin header, tab nav, quick links,
 * and CMS tools are completely hidden in the not-signed-in and
 * unauthorized states.
 *
 * States (rendered in order, before any admin content):
 *   1. Not signed in (or auth still initializing) — center-screen
 *      "Sign In with Internet Identity" CTA. Dashboard, CMS tools,
 *      header, and quick-links hidden. Never gated behind a loading
 *      state that could hang.
 *   2. Signed in but principal not yet resolved — brief, genuinely
 *      transient verifying state right after login.
 *   3. Signed in but NOT authorized — hard 403 "Access Denied" screen
 *      with the active Principal ID, a "Copy Principal" button, and a
 *      Sign out control. CMS tools, header, and quick-links are NOT
 *      rendered.
 *   4. Authorized — renders the full admin workspace (the children =
 *      `AdminLayout` chrome + child route outlet).
 *
 * Authorization uses the backend `isAdmin(caller)` query as the source
 * of truth (see `useIsAdmin`), so the first signed-in user is authorized
 * when the backend whitelist is empty. The client-side allowlist
 * (`isAllowedAdmin`) is kept as a fast-path fallback so a known operator
 * is authorized even before the backend query resolves.
 *
 * The guard deliberately does NOT loop on `isAdminLoading`: an unresolved
 * admin check falls through to the Access Denied state so the page is
 * never stuck on a perpetual loading screen (which previously produced a
 * blank navy view when `useActor`'s `isFetching` never cleared).
 */
export function AdminAuthGuard({ children }: { children: ReactNode }) {
  const {
    login,
    isAuthenticated,
    isInitializing,
    isLoggingIn,
    loginError,
    clear,
    identity,
  } = useInternetIdentity();

  const principalText = identity?.getPrincipal().toText() ?? "";

  // Backend-authoritative admin check for the signed-in principal.
  const { isAdmin } = useIsAdmin(principalText);

  // ── Not signed in (or auth still initializing) ───────────────────
  // Render the sign-in screen immediately. This is never gated behind a
  // loading state that could hang, so the page is never blank while the
  // user is unauthenticated or II is still restoring the session.
  if (!isAuthenticated) {
    return (
      <SignInScreen
        isInitializing={isInitializing}
        isLoggingIn={isLoggingIn}
        loginError={loginError}
        onLogin={login}
      />
    );
  }

  // ── Signed in but principal not yet resolved ─────────────────────
  // Brief, genuinely transient window right after login before the
  // identity is exposed. Renders visible content, never a blank node.
  if (!principalText) {
    return <VerifyingAccess />;
  }

  // ── Authorized? ───────────────────────────────────────────────────
  // The backend `isAdmin` query is the source of truth. The client
  // allowlist is a fast-path fallback so a known operator is authorized
  // even while the backend query is still resolving (or if it errors).
  const authorized = isAdmin || isAllowedAdmin(principalText);

  // ── Authorized — render the full admin workspace ────────────────
  if (authorized) {
    return <>{children}</>;
  }

  // ── Signed in but NOT authorized ─────────────────────────────────
  // Deliberately do NOT loop on `isAdminLoading`: an unresolved admin
  // check falls through to Access Denied so the page is never stuck on
  // a perpetual loading screen. The client allowlist fast-path already
  // authorizes known operators before the backend query resolves.
  return (
    <AccessDenied principalText={principalText} onLogout={() => clear()} />
  );
}

export default AdminAuthGuard;

// ──────────────────────────────────────────────────────────────────────────
// VerifyingAccess — loading state shown while auth status / principal
// resolves. No admin chrome is rendered.
// ──────────────────────────────────────────────────────────────────────────

function VerifyingAccess() {
  return (
    <div
      className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-blue-950 px-6 text-center"
      data-ocid="admin.verifying"
    >
      <p className="text-eyebrow entrance-left">Admin</p>
      <p className="text-sm text-muted-foreground entrance-left">
        Verifying access…
      </p>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// SignInScreen — center-screen "Sign In with Internet Identity" CTA.
// Dashboard, CMS tools, header, and quick-links are hidden completely.
// ──────────────────────────────────────────────────────────────────────────

interface SignInScreenProps {
  isInitializing: boolean;
  isLoggingIn: boolean;
  loginError?: Error;
  onLogin: () => void;
}

function SignInScreen({
  isInitializing,
  isLoggingIn,
  loginError,
  onLogin,
}: SignInScreenProps) {
  return (
    <div
      className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 bg-blue-950 px-6 py-16 text-center"
      data-ocid="admin.signin"
    >
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6">
        <p className="text-eyebrow entrance-left">Restricted</p>
        <h1 className="text-headline entrance-left" data-entrance-delay="80">
          Turning Point UK — Admin Sign In
        </h1>
        <p
          className="max-w-sm text-sm text-muted-foreground entrance-right"
          data-entrance-delay="160"
        >
          This area is restricted to authorised administrators. Sign in with
          Internet Identity to continue.
        </p>

        <button
          type="button"
          onClick={onLogin}
          disabled={isInitializing || isLoggingIn}
          data-ocid="admin.signin_button"
          className="btn-primary-square group entrance-left disabled:cursor-not-allowed disabled:opacity-60"
          data-entrance-delay="240"
        >
          <span>
            {isInitializing
              ? "Loading…"
              : isLoggingIn
                ? "Signing in…"
                : "Sign in with Internet Identity"}
          </span>
        </button>

        {loginError ? (
          <p
            role="alert"
            data-ocid="admin.signin_error"
            className="max-w-sm text-sm text-destructive entrance-left"
          >
            {loginError.message ?? "Sign-in failed. Please try again."}
          </p>
        ) : null}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// AccessDenied — hard 403 screen for signed-in but unauthorized users.
// Shows the active Principal ID, a "Copy Principal" button with a copied
// notification, and a Sign out control. CMS tools, header, and quick-links
// are NOT rendered.
// ──────────────────────────────────────────────────────────────────────────

interface AccessDeniedProps {
  principalText: string;
  onLogout: () => void;
}

function AccessDenied({ principalText, onLogout }: AccessDeniedProps) {
  const [copied, setCopied] = useState(false);

  // Reset the copied flag a moment after the user clicks copy so the
  // notification is brief and the button returns to its default label.
  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 2500);
    return () => window.clearTimeout(t);
  }, [copied]);

  const handleCopy = useCallback(async () => {
    if (!principalText) return;
    try {
      await navigator.clipboard.writeText(principalText);
      setCopied(true);
    } catch {
      // Clipboard API can be unavailable (insecure context) or blocked.
      // Fall back to a transient select-and-execCommand so the user can
      // still copy the ID manually.
      try {
        const ta = document.createElement("textarea");
        ta.value = principalText;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        setCopied(true);
      } catch {
        setCopied(false);
      }
    }
  }, [principalText]);

  return (
    <div
      className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 bg-blue-950 px-6 py-16 text-center"
      data-ocid="admin.access_denied"
    >
      <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-6">
        <p className="text-eyebrow entrance-left">Access Denied</p>
        <h1 className="text-headline entrance-left" data-entrance-delay="80">
          Access Denied
        </h1>
        <p
          className="max-w-md text-sm text-muted-foreground entrance-right"
          data-entrance-delay="160"
        >
          You do not have permission to view this workspace.
        </p>

        {/* ── Principal ID code box ─────────────────────────────────── */}
        <div
          className="flex w-full flex-col gap-3 entrance-left"
          data-entrance-delay="240"
        >
          <div
            className="flex items-center justify-between gap-3 rounded-lg border border-slate-700 bg-slate-900 p-3 text-left"
            data-ocid="admin.access_denied.principal_box"
          >
            <code className="break-all font-mono text-sm text-amber-400">
              {principalText}
            </code>
          </div>

          {/* ── Copy button + copied notification ───────────────────── */}
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              data-ocid="admin.access_denied.copy_principal_button"
              className="btn-primary-square group"
            >
              <span>{copied ? "Copied to clipboard!" : "Copy Principal"}</span>
            </button>
            {copied ? (
              <output
                data-ocid="admin.access_denied.copied_confirmation"
                className="text-xs text-primary"
              >
                Copied to clipboard!
              </output>
            ) : null}
          </div>
        </div>

        {/* ── Sign out ─────────────────────────────────────────────── */}
        <button
          type="button"
          onClick={onLogout}
          data-ocid="admin.access_denied.signout_button"
          className="btn-outline-invert entrance-left"
          data-entrance-delay="320"
        >
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );
}
