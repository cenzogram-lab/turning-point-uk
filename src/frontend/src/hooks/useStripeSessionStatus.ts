import { type StripeSessionStatus, createActor } from "@/backend";
import { mockBackend } from "@/mocks/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";

/**
 * useStripeSessionStatus — polls the backend for the status of a Stripe
 * Checkout Session after the user returns from Stripe's hosted checkout.
 *
 * Stripe appends `?session_id=...` to the success URL. The page reads
 * that `session_id` from the URL query params (via TanStack Router's
 * `useSearch`) and passes it into this hook. The hook polls
 * `backend.getStripeSessionStatus(sessionId)` every 2 seconds via
 * TanStack Query (`refetchInterval: 2000`). Polling stops automatically
 * (`refetchInterval: false`) once the status `__kind__` is
 * `'completed'` or `'failed'` — the two terminal states.
 *
 * The hook exposes a normalized consumer-facing shape:
 *   - `status: 'loading'`  — actor fetching, no session id, or polling
 *   - `status: 'completed'` — backend reported `__kind__: 'completed'`
 *   - `status: 'failed'`    — backend reported `__kind__: 'failed'`
 *   - `data?: StripeSessionStatus` — the raw backend variant, present
 *     once a terminal status is received (switch on `data.__kind__`).
 *
 * Mirrors the `useGalleryItems` / `useBlogPosts` pattern:
 * `useActor(createActor)` at hook top level, query enabled once the
 * actor is ready, mock-mode fallback to `mockBackend` when
 * `VITE_USE_MOCK=true`.
 *
 * No webhooks — the canister polls Stripe on demand per the project's
 * payment-status-tracking contract.
 */

/** True when running in frontend-only mock mode (`VITE_USE_MOCK=true`). */
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

/** Polling interval for `getStripeSessionStatus` (2 seconds). */
const POLL_INTERVAL_MS = 2000;

/** Normalized status string exposed to consumers. */
export type StripeSessionPollStatus = "loading" | "completed" | "failed";

/**
 * Resolves the effective backend actor. Returns the real actor when
 * available; otherwise falls back to `mockBackend` in mock mode.
 * Returns `null` in production when the actor is not yet ready.
 */
function resolveActor<T>(actor: T | null): T | null {
  if (actor) return actor;
  return USE_MOCK ? (mockBackend as unknown as T) : null;
}

/** True when the status is terminal and polling should stop. */
function isTerminal(status: StripeSessionStatus | undefined): boolean {
  return (
    !!status &&
    (status.__kind__ === "completed" || status.__kind__ === "failed")
  );
}

/**
 * Maps the raw backend variant + query state to the normalized
 * `{ status, data }` consumer shape.
 */
function toPollResult(data: StripeSessionStatus | undefined): {
  status: StripeSessionPollStatus;
  data?: StripeSessionStatus;
} {
  if (!data) {
    return { status: "loading" };
  }
  switch (data.__kind__) {
    case "completed":
      return { status: "completed", data };
    case "failed":
      return { status: "failed", data };
    default:
      return { status: "loading" };
  }
}

/**
 * @param sessionId — the Stripe `session_id` read from the URL query
 *   params by the calling page. When omitted or empty, the hook reports
 *   a `failed` status with a descriptive error so the page can render a
 *   recovery path instead of spinning forever.
 */
export function useStripeSessionStatus(sessionId?: string | null) {
  const { actor, isFetching } = useActor(createActor);
  const resolvedActor = resolveActor(actor);
  const effectiveSessionId = sessionId ?? null;

  const query = useQuery<StripeSessionStatus>({
    queryKey: ["stripe", "sessionStatus", effectiveSessionId],
    queryFn: async () => {
      if (!resolvedActor || !effectiveSessionId) {
        // No session id in the URL — there is nothing to poll. Return
        // a synthetic `failed` so consumers can show a recovery path
        // rather than spinning forever.
        const synthetic: StripeSessionStatus = {
          __kind__: "failed",
          failed: { error: "No session_id found in the URL." },
        };
        return synthetic;
      }
      return await (
        resolvedActor as {
          getStripeSessionStatus: (
            sessionId: string,
          ) => Promise<StripeSessionStatus>;
        }
      ).getStripeSessionStatus(effectiveSessionId);
    },
    enabled: Boolean(resolvedActor) && (USE_MOCK || !isFetching),
    refetchInterval: (query) => {
      const data = query.state.data as StripeSessionStatus | undefined;
      return isTerminal(data) ? false : POLL_INTERVAL_MS;
    },
    refetchOnWindowFocus: false,
  });

  const { status, data } = toPollResult(query.data);
  const isCompleted = status === "completed";
  const isFailed = status === "failed";
  const isPending = status === "loading";

  return {
    /** The Stripe session_id passed in (or null when absent). */
    sessionId: effectiveSessionId,
    /** Normalized status — `'loading' | 'completed' | 'failed'`. */
    status,
    /** Raw backend variant once a terminal status is received. */
    data,
    /** True once the backend reports `completed`. */
    isCompleted,
    /** True once the backend reports `failed`. */
    isFailed,
    /** True while waiting for a terminal status. */
    isPending,
    /** Combined loading flag (actor fetching or query loading). */
    loading: isFetching || query.isLoading,
    /** True while polling is actively refetching. */
    isPolling: query.isFetching && !isCompleted && !isFailed,
    error: query.error,
    refetch: query.refetch,
  };
}
