import { useIsAdmin } from "@/hooks/useIsAdmin";
import { isAllowedAdmin } from "@/lib/adminAllowlist";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { type StripeConfiguration, createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import {
  STRIPE_CONFIGURED_QUERY_KEY,
  useStripeCheckout,
} from "../hooks/useStripeCheckout";

/**
 * StripeSetupPanel — admin-only Stripe configuration surface.
 *
 * Mirrors the `AdminAuthGuard` gate: `useInternetIdentity()` +
 * backend `isAdmin` (via `useIsAdmin`) as the source of truth, with the
 * client allowlist `isAllowedAdmin` as a fast-path fallback. Non-admins
 * render `null` so the panel can be dropped into any admin page without
 * leaking the form.
 *
 * Reads `isStripeConfigured` from `useStripeCheckout` (TanStack Query
 * over `backend.isStripeConfigured()`). When Stripe is NOT configured,
 * the setup form is shown: a single secret-key input (`.admin-input`)
 * plus a read-only GB country field (the backend always stores
 * `allowedCountries: ['GB']`). On submit, the panel calls
 * `backend.setStripeConfiguration({ secretKey, allowedCountries: ['GB'] })`
 * via a `useMutation` and invalidates `STRIPE_CONFIGURED_QUERY_KEY` so
 * the `isStripeConfigured` query refetches and the form collapses.
 *
 * When Stripe IS configured, the form is hidden and an "Update Stripe
 * key" button (`.btn-outline-invert`) re-opens the form so the admin
 * can rotate the key. The save CTA is the single red primary action
 * (`.btn-primary-square`); all secondary controls use the neutral
 * foreground treatment per the brand discipline.
 *
 * Styling: `.bg-navy` surface, `.admin-input` field, square corners,
 * zero shadows, dark navy / red / white Oswald brand system.
 */
export function StripeSetupPanel() {
  const { identity, isAuthenticated, isInitializing } = useInternetIdentity();
  const principalText = identity?.getPrincipal().toText() ?? "";

  // Backend-authoritative admin check for the signed-in principal.
  const { isAdmin } = useIsAdmin(principalText);

  // Gate: mirror AdminAuthGuard. While II is initializing or the
  // principal is still resolving, render nothing so no admin content
  // flashes before the gate clears. Non-admins also render null.
  if (isInitializing || (isAuthenticated && !principalText)) return null;
  if (!isAdmin && !isAllowedAdmin(principalText)) return null;

  return <StripeSetupPanelInner />;
}

export default StripeSetupPanel;

// ──────────────────────────────────────────────────────────────────────────
// StripeSetupPanelInner — rendered only after the admin gate clears.
// Split so the gate logic above stays a pure render-null guard and the
// hook calls below run unconditionally (Rules of Hooks).
// ──────────────────────────────────────────────────────────────────────────

function StripeSetupPanelInner() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  const {
    isStripeConfigured,
    isStripeConfiguredLoading,
    refetchIsStripeConfigured,
  } = useStripeCheckout();

  const [showForm, setShowForm] = useState(false);
  const [secretKey, setSecretKey] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  // The form is shown when (a) Stripe is not yet configured, or (b) the
  // admin has explicitly opened it via the "Update Stripe key" button.
  const configured = isStripeConfigured;
  const formVisible = !configured || showForm;

  const saveMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      if (!actor) {
        throw new Error("Backend actor is not ready. Please try again.");
      }
      const trimmed = secretKey.trim();
      if (!trimmed) {
        throw new Error("Enter your Stripe secret key before saving.");
      }
      const config: StripeConfiguration = {
        secretKey: trimmed,
        allowedCountries: ["GB"],
      };
      await actor.setStripeConfiguration(config);
    },
    onSuccess: () => {
      // Invalidate the configured-state query so it refetches; the form
      // collapses automatically once `isStripeConfigured` flips true.
      queryClient.invalidateQueries({
        queryKey: [...STRIPE_CONFIGURED_QUERY_KEY],
      });
      setSecretKey("");
      setSubmitError(null);
      setShowForm(false);
    },
    onError: (error) => {
      setSubmitError(error.message ?? "Failed to save Stripe configuration.");
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);
    saveMutation.mutate();
  };

  const handleCancel = () => {
    setSecretKey("");
    setSubmitError(null);
    setShowForm(false);
    // Re-sync the configured state in case the admin dismissed after a
    // failed save left the cache stale.
    void refetchIsStripeConfigured();
  };

  // ── Loading state — wait for the configured-state query to resolve ──
  if (isStripeConfiguredLoading && configured === false && !showForm) {
    return (
      <section
        className="bg-navy border border-border p-6 sm:p-8"
        data-ocid="admin.stripe_setup.panel"
        aria-busy="true"
      >
        <p className="text-eyebrow">Payments</p>
        <p className="mt-3 text-sm text-muted-foreground">
          Checking Stripe configuration…
        </p>
      </section>
    );
  }

  return (
    <section
      className="bg-navy border border-border p-6 sm:p-8"
      data-ocid="admin.stripe_setup.panel"
      aria-labelledby="stripe-setup-title"
    >
      <p className="text-eyebrow">Payments</p>
      <h2
        id="stripe-setup-title"
        className="mt-2 font-display text-2xl font-bold uppercase tracking-tight text-foreground"
      >
        Stripe Setup
      </h2>

      {/* ── Status line ─────────────────────────────────────────────── */}
      <p className="mt-3 max-w-xl text-sm text-muted-foreground">
        {configured
          ? "Stripe is configured. Checkout is live for UK customers."
          : "Stripe is not configured. Enter your secret key to enable checkout."}
      </p>

      {/* ── Configured: show the Update CTA, hide the form ──────────── */}
      {configured && !showForm ? (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => {
              setSubmitError(null);
              setShowForm(true);
            }}
            data-ocid="admin.stripe_setup.update_button"
            className="btn-outline-invert"
          >
            <span>Update Stripe key</span>
          </button>
        </div>
      ) : null}

      {/* ── Form: shown when not configured OR when re-opened ───────── */}
      {formVisible ? (
        <form
          onSubmit={handleSubmit}
          className="mt-6 flex flex-col gap-5"
          data-ocid="admin.stripe_setup.form"
          noValidate
        >
          {/* Secret key — the only editable field */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="stripe-secret-key"
              className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground"
            >
              Stripe secret key
            </label>
            <input
              id="stripe-secret-key"
              name="secretKey"
              type="password"
              autoComplete="off"
              spellCheck={false}
              value={secretKey}
              onChange={(event) => setSecretKey(event.target.value)}
              placeholder="sk_live_…"
              className="admin-input font-mono"
              data-ocid="admin.stripe_setup.secret_key_input"
              aria-describedby="stripe-secret-key-help"
              disabled={saveMutation.isPending}
            />
            <p
              id="stripe-secret-key-help"
              className="text-xs text-muted-foreground"
            >
              Paste your Stripe secret key. It is stored on the canister and
              never exposed to non-admin clients.
            </p>
          </div>

          {/* Allowed country — read-only, always GB */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="stripe-allowed-country"
              className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground"
            >
              Allowed country
            </label>
            <input
              id="stripe-allowed-country"
              name="allowedCountries"
              type="text"
              value="GB"
              readOnly
              className="admin-input cursor-not-allowed opacity-70"
              data-ocid="admin.stripe_setup.country_input"
              aria-readonly="true"
              disabled={saveMutation.isPending}
            />
            <p className="text-xs text-muted-foreground">
              Checkout is locked to the United Kingdom (GB).
            </p>
          </div>

          {/* ── Action row: single red primary CTA + neutral cancel ── */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={saveMutation.isPending || !secretKey.trim()}
              data-ocid="admin.stripe_setup.save_button"
              className="btn-primary-square disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span>
                {saveMutation.isPending
                  ? "Saving…"
                  : configured
                    ? "Update key"
                    : "Save Stripe key"}
              </span>
            </button>

            {configured ? (
              <button
                type="button"
                onClick={handleCancel}
                disabled={saveMutation.isPending}
                data-ocid="admin.stripe_setup.cancel_button"
                className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground underline-offset-4 transition-smooth hover:text-foreground hover:underline disabled:opacity-60"
              >
                Cancel
              </button>
            ) : null}
          </div>

          {/* ── Pending / error feedback ─────────────────────────────── */}
          {saveMutation.isPending ? (
            <output
              data-ocid="admin.stripe_setup.saving_state"
              className="text-xs text-muted-foreground"
            >
              Saving configuration…
            </output>
          ) : null}

          {submitError ? (
            <p
              role="alert"
              data-ocid="admin.stripe_setup.error_state"
              className="text-sm text-destructive"
            >
              {submitError}
            </p>
          ) : null}

          {saveMutation.isSuccess && !showForm ? (
            <output
              data-ocid="admin.stripe_setup.success_state"
              className="text-sm text-foreground"
            >
              Stripe key saved. Checkout is now live.
            </output>
          ) : null}
        </form>
      ) : null}
    </section>
  );
}
