import { createActor } from "@/backend";
import { mockBackend } from "@/mocks/backend";
import {
  DEFAULT_NAV_ENTRIES,
  NAV_CONFIG_QUERY_KEY,
  type NavEntry,
  toNavEntries,
} from "@/types/site-config";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";

/**
 * useNavConfig — fetches the navigation structure from the backend via
 * `getNavConfig()` and normalizes it into the frontend `NavEntry[]` shape
 * (the same shape `NAV_ENTRIES` produces in `lib/routes.ts`).
 *
 * Replaces the static `NAV_ENTRIES` import in Nav.tsx and Footer.tsx so the
 * nav structure is backend-driven and admin-editable. The rendered layout
 * (PRIMARY_ENTRIES / MORE_OVERFLOW / MOBILE_MENU_SECTIONS) is unchanged —
 * only the data source moves from a static const to a backend query.
 *
 * Graceful degradation contract:
 *   - While loading: `entries` falls back to `DEFAULT_NAV_ENTRIES` (the
 *     existing hardcoded `NAV_ENTRIES`) so the navbar shows the known-default
 *     links immediately rather than an empty bar.
 *   - On fetch error: `entries` falls back to the same `DEFAULT_NAV_ENTRIES`
 *     so the site remains fully navigable.
 *   - On empty backend config: `entries` falls back to `DEFAULT_NAV_ENTRIES`.
 *   - On success: `entries` is the backend-driven nav structure.
 *
 * `loading` is true only during the initial fetch (before any data has
 * resolved). Once the query has resolved — success OR error — `loading` is
 * false and `entries` is either the backend value or the fallback. This lets
 * callers distinguish "first paint, no data yet" from "data resolved (possibly
 * to the fallback)" without flickering the fallback away once it appears.
 *
 * Mock mode: when `VITE_USE_MOCK=true` the core-infrastructure actor factory
 * cannot reach a real canister, so `useActor` returns a null actor and the
 * query would never fire. To keep the navbar rendering the seeded sample nav
 * during frontend-only development, we fall back to the in-memory
 * `mockBackend` whenever the real actor is null AND mock mode is enabled.
 * Production behavior is unchanged — the fallback only activates in mock mode.
 */

/** True when running in frontend-only mock mode (`VITE_USE_MOCK=true`). */
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

/**
 * Resolves the effective backend actor for read queries. Returns the real
 * actor when available; otherwise falls back to `mockBackend` in mock mode
 * so the seeded sample nav renders. Returns `null` in production when the
 * actor is not yet ready.
 */
function resolveActor<T>(actor: T | null): T | null {
  if (actor) return actor;
  return USE_MOCK ? (mockBackend as unknown as T) : null;
}

export interface UseNavConfigResult {
  /** Nav entries in the frontend `NavEntry[]` shape (backend-driven, or the
   *  baked-in default fallback while loading / on error / on empty). */
  entries: NavEntry[];
  /** True only during the initial fetch (before any data has resolved). */
  loading: boolean;
  /** The fetch error, if any. `entries` falls back to defaults on error. */
  error: unknown;
  /** Re-fetch the nav config. */
  refetch: () => void;
  /** True when the query is fetching in the background (refetch, etc.). */
  isFetching: boolean;
}

export function useNavConfig(): UseNavConfigResult {
  const { actor, isFetching } = useActor(createActor);
  const resolvedActor = resolveActor(actor);

  const query = useQuery<NavEntry[]>({
    queryKey: NAV_CONFIG_QUERY_KEY,
    queryFn: async () => {
      if (!resolvedActor) return [...DEFAULT_NAV_ENTRIES];
      const config = await resolvedActor.getNavConfig();
      const entries = toNavEntries(config);
      // Empty backend config → fall back to defaults so the navbar is never
      // an empty bar.
      return entries.length > 0 ? entries : [...DEFAULT_NAV_ENTRIES];
    },
    enabled: Boolean(resolvedActor) && (USE_MOCK || !isFetching),
  });

  // Fallback contract: `entries` is NEVER empty. While loading, on error, or
  // when the query returns an empty array, fall back to a mutable copy of
  // the baked-in default nav entries. A fresh mutable copy is returned each
  // call so consumers can treat `entries` as `NavEntry[]`.
  const realEntries = query.data;
  const entries =
    realEntries && realEntries.length > 0
      ? realEntries
      : [...DEFAULT_NAV_ENTRIES];

  return {
    entries,
    loading: isFetching || query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}
