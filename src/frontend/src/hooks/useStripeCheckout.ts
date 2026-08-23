import { type ShoppingItem, createActor } from "@/backend";
import { mockBackend } from "@/mocks/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";

/**
 * useStripeCheckout — Stripe checkout integration hook.
 *
 * Exposes:
 *   (a) `isStripeConfigured` — TanStack Query wrapping
 *       `backend.isStripeConfigured()` so the shop UI can gate the
 *       checkout button on whether the canister has Stripe credentials
 *       configured. Mirrors the `useGalleryItems` / `useBlogPosts`
 *       pattern: `useActor(createActor)` at hook top level, query
 *       enabled once the actor is ready, mock-mode fallback to
 *       `mockBackend` when `VITE_USE_MOCK=true`.
 *   (b) `createCheckoutSession(items)` — builds the success/cancel URLs
 *       from `window.location.origin` (the canonical routes
 *       `/checkout/success` and `/checkout/cancel`), calls
 *       `backend.createCheckoutSession(items, successUrl, cancelUrl)`,
 *       parses the returned JSON string to extract `url`, validates it
 *       is non-empty (throws a clear Error if missing — never redirects
 *       to `/undefined`), and redirects the browser to Stripe's hosted
 *       checkout via `window.location.href = url`.
 *
 * The redirect is a full-page navigation to an external Stripe-hosted
 * page, NOT a router navigation — `window.location.href` is intentional.
 *
 * Mock mode: when `VITE_USE_MOCK=true` and the real actor is null, the
 * hook falls back to `mockBackend`. The mock may not implement the
 * Stripe methods yet; in that case `isStripeConfigured` resolves to
 * `false` and `createCheckoutSession` throws a clear error so the UI
 * shows the "not configured" state instead of crashing.
 */

/** True when running in frontend-only mock mode (`VITE_USE_MOCK=true`). */
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

/** Query key for the `isStripeConfigured` query. */
export const STRIPE_CONFIGURED_QUERY_KEY = ["stripe", "isConfigured"] as const;

/**
 * Resolves the effective backend actor. Returns the real actor when
 * available; otherwise falls back to `mockBackend` in mock mode.
 * Returns `null` in production when the actor is not yet ready.
 */
function resolveActor<T>(actor: T | null): T | null {
  if (actor) return actor;
  return USE_MOCK ? (mockBackend as unknown as T) : null;
}

/**
 * Safely invokes `isStripeConfigured()` on a possibly-mock actor.
 * Returns `false` when the actor lacks the method (e.g. an older mock)
 * so the UI degrades to the "not configured" state instead of throwing.
 */
async function safeIsStripeConfigured(actor: unknown): Promise<boolean> {
  const anyActor = actor as {
    isStripeConfigured?: () => Promise<boolean>;
  };
  if (!anyActor || typeof anyActor.isStripeConfigured !== "function") {
    return false;
  }
  return await anyActor.isStripeConfigured();
}

export function useStripeCheckout() {
  const { actor, isFetching } = useActor(createActor);
  const resolvedActor = resolveActor(actor);

  const configuredQuery = useQuery<boolean>({
    queryKey: [...STRIPE_CONFIGURED_QUERY_KEY],
    queryFn: async () => {
      if (!resolvedActor) return false;
      return safeIsStripeConfigured(resolvedActor);
    },
    enabled: Boolean(resolvedActor) && (USE_MOCK || !isFetching),
  });

  /**
   * Creates a Stripe Checkout Session and redirects the browser to
   * Stripe's hosted checkout page.
   *
   * Builds the success/cancel URLs from the current origin so Stripe
   * returns the user to `/checkout/success` or `/checkout/cancel`
   * (with `?session_id=...` appended by Stripe on success).
   *
   * The backend returns a JSON string (`{ url: "https://checkout.stripe.com/..." }`).
   * We parse it, validate the `url` is non-empty, and redirect via
   * `window.location.href`. If the URL is missing or empty we throw a
   * clear Error so the caller can surface a message — we never redirect
   * to `/undefined` or an empty string.
   */
  const createCheckoutSession = async (
    items: ShoppingItem[],
  ): Promise<void> => {
    if (!resolvedActor) {
      throw new Error(
        USE_MOCK
          ? "Stripe checkout is not available in mock mode."
          : "Backend actor is not ready. Please try again.",
      );
    }

    const successUrl = `${window.location.origin}/checkout/success`;
    const cancelUrl = `${window.location.origin}/checkout/cancel`;

    const result = await (
      resolvedActor as {
        createCheckoutSession: (
          items: ShoppingItem[],
          successUrl: string,
          cancelUrl: string,
        ) => Promise<string>;
      }
    ).createCheckoutSession(items, successUrl, cancelUrl);

    let parsed: unknown;
    try {
      parsed = JSON.parse(result);
    } catch {
      throw new Error(
        "Stripe checkout response was not valid JSON. Please try again.",
      );
    }

    const url =
      parsed && typeof parsed === "object" && "url" in parsed
        ? String((parsed as { url: unknown }).url)
        : "";

    if (!url) {
      throw new Error(
        "Stripe did not return a checkout URL. Please try again.",
      );
    }

    // External redirect to Stripe's hosted checkout — intentionally a
    // full-page navigation, not a router navigation.
    window.location.href = url;
  };

  return {
    isStripeConfigured: configuredQuery.data ?? false,
    isStripeConfiguredLoading: isFetching || configuredQuery.isLoading,
    isStripeConfiguredError: configuredQuery.error,
    refetchIsStripeConfigured: configuredQuery.refetch,
    createCheckoutSession,
  };
}
