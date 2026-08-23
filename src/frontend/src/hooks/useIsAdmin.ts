import { createActor } from "@/backend";
import { mockBackend } from "@/mocks/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { Principal } from "@icp-sdk/core/principal";
import { useQuery } from "@tanstack/react-query";

/**
 * useIsAdmin — backend-authoritative admin authorization hook.
 *
 * Calls `backend.isAdmin(caller)` (a bootstrap-aware query) with the
 * current Internet Identity principal so the backend is the source of
 * truth for admin authorization. When the backend whitelist is empty,
 * the backend authorizes the first signed-in user — so the admin panel
 * is reachable without a hardcoded client allowlist entry.
 *
 * Mirrors the `useStripeCheckout` pattern: `useActor(createActor)` at
 * hook top level, a TanStack Query enabled once the actor is ready, and
 * a mock-mode fallback to `mockBackend` when `VITE_USE_MOCK=true`.
 *
 * The hook accepts the current principal text (from
 * `identity.getPrincipal().toText()`). When no principal is provided it
 * returns `false` without querying, so callers can safely render a
 * sign-in prompt instead.
 */

/** True when running in frontend-only mock mode (`VITE_USE_MOCK=true`). */
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

/** Query key for the `isAdmin` query, scoped per principal. */
export const IS_ADMIN_QUERY_KEY = ["admin", "isAdmin"] as const;

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
 * Safely invokes `isAdmin(caller)` on a possibly-mock actor. Returns
 * `false` when the actor lacks the method so the UI degrades to the
 * unauthorized state instead of throwing.
 */
async function safeIsAdmin(
  actor: unknown,
  principalText: string,
): Promise<boolean> {
  const anyActor = actor as {
    isAdmin?: (caller: Principal) => Promise<boolean>;
  };
  if (!anyActor || typeof anyActor.isAdmin !== "function") {
    return false;
  }
  return await anyActor.isAdmin(Principal.fromText(principalText));
}

export function useIsAdmin(principalText: string) {
  const { actor, isFetching } = useActor(createActor);
  const resolvedActor = resolveActor(actor);

  const adminQuery = useQuery<boolean>({
    queryKey: [...IS_ADMIN_QUERY_KEY, principalText],
    queryFn: async () => {
      if (!resolvedActor || !principalText) return false;
      return safeIsAdmin(resolvedActor, principalText);
    },
    enabled:
      Boolean(resolvedActor) &&
      Boolean(principalText) &&
      (USE_MOCK || !isFetching),
  });

  return {
    isAdmin: adminQuery.data ?? false,
    isAdminLoading: isFetching || adminQuery.isLoading,
    isAdminError: adminQuery.error,
    refetchIsAdmin: adminQuery.refetch,
  };
}
