import { createActor } from "@/backend";
import { SEED_ENTRIES } from "@/hooks/useGallerySeed";
import { mockBackend } from "@/mocks/backend";
import {
  DEFAULT_GALLERY_CATEGORY,
  GALLERY_QUERY_KEY,
  type GalleryItem,
  toGalleryItem,
} from "@/types/gallery";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";

/**
 * useGalleryItems — fetches all gallery items via `getGalleryItems()`.
 *
 * Returns the normalized frontend `GalleryItem[]` (number ids, string
 * image URLs from `ExternalBlob.getDirectURL()`, plus the new `eventDate`
 * and `category` fields), ordered by the backend (createdAt desc). Exposes
 * `loading`, `error`, and `refetch` for the gallery page and admin
 * dashboard.
 *
 * The query is enabled only once the actor is ready (post-auth). While
 * the actor is fetching, `isLoading` is true so callers can show a
 * skeleton without distinguishing the two loading phases.
 *
 * Mock mode: when `VITE_USE_MOCK=true` the core-infrastructure actor
 * factory cannot reach a real canister, so `useActor` returns a null
 * actor and the query would never fire. To keep the public gallery
 * rendering the seeded sample items during frontend-only development,
 * we fall back to the in-memory `mockBackend` (from `@/mocks/backend`)
 * whenever the real actor is null AND mock mode is enabled. Production
 * behavior is unchanged — the fallback only activates in mock mode.
 *
 * Fallback contract: the returned `items` is NEVER empty due to a backend
 * empty/failure. If `query.data` is a non-empty array, real backend records
 * take priority. If `query.data` is empty, undefined, or the query errored,
 * `items` falls back to `DEFAULT_STATIC_GALLERY_ITEMS` (bundled static
 * assets) so the grid renders immediately on first render with no wait on
 * the backend. Each fallback item is tagged with `category:
 * DEFAULT_GALLERY_CATEGORY` ('Uncategorized') and no `eventDate` so it
 * renders under the new schema. `loading`/`error`/`refetch`/`isFetching`
 * semantics are unchanged — only the `items` value gets the fallback.
 */

/** True when running in frontend-only mock mode (`VITE_USE_MOCK=true`). */
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

/**
 * Resolves the effective backend actor for read queries. Returns the
 * real actor when available; otherwise falls back to `mockBackend` in
 * mock mode so seeded sample items render on /gallery. Returns `null`
 * in production when the actor is not yet ready.
 */
function resolveActor<T>(actor: T | null): T | null {
  if (actor) return actor;
  return USE_MOCK ? (mockBackend as unknown as T) : null;
}

/** Base path for staged seed assets (served from `public/`). */
const SEED_ASSET_BASE = "/assets/gallery/";

/** Default description for every fallback item (matches the seed). */
const DEFAULT_DESCRIPTION = "Turning Point UK on the ground.";

/**
 * Fixed createdAt timestamp captured once at module load. Using a single
 * constant (rather than `Date.now()` per item) keeps the 15 fallback items
 * in a stable, deterministic order and avoids per-render churn.
 */
const DEFAULT_CREATED_AT = 1_754_438_400_000; // 2025-08-06T00:00:00Z (fixed)

/**
 * Stable synthetic id base for fallback items. 900_001..900_015 avoids
 * colliding with real backend ids (which are canister-assigned and start
 * from small integers). The fallback items are pure frontend display
 * records — they are never sent to the backend and never overlap with
 * real records when both are present (real records take priority).
 */
const FALLBACK_ID_BASE = 900_000;

/**
 * DEFAULT_STATIC_GALLERY_ITEMS — frontend-only `GalleryItem` records,
 * one per staged photo, used as the synchronous fallback when the backend
 * query is empty, undefined, or errored. Each item points directly at its
 * bundled local static asset (`/assets/gallery/<filename>`) so the browser
 * loads the file with no object-storage proxy indirection.
 *
 * These are NOT hardcoded backend records — they are display-only. Real
 * backend records (from `getGalleryItems()`) always take priority when
 * present. The fallback exists so the public `/gallery` page never shows
 * an empty/error wall while the backend is unreachable, still seeding, or
 * genuinely empty.
 *
 * Each fallback item is tagged with `category: DEFAULT_GALLERY_CATEGORY`
 * ('Uncategorized') and no `eventDate` so it renders under the new schema
 * (which requires a `category` on every item).
 */
export const DEFAULT_STATIC_GALLERY_ITEMS: readonly GalleryItem[] =
  SEED_ENTRIES.map((entry, i) => ({
    id: FALLBACK_ID_BASE + i + 1,
    imageUrl: `${SEED_ASSET_BASE}${entry.filename}`,
    title: entry.title,
    description: DEFAULT_DESCRIPTION,
    createdAt: DEFAULT_CREATED_AT,
    category: DEFAULT_GALLERY_CATEGORY,
  }));

export function useGalleryItems() {
  const { actor, isFetching } = useActor(createActor);
  const resolvedActor = resolveActor(actor);

  const query = useQuery<GalleryItem[]>({
    queryKey: GALLERY_QUERY_KEY,
    queryFn: async () => {
      if (!resolvedActor) return [];
      const items = await resolvedActor.getGalleryItems();
      return items.map(toGalleryItem);
    },
    enabled: Boolean(resolvedActor) && (USE_MOCK || !isFetching),
  });

  // Real backend records take priority. Fall back to a mutable copy of the
  // static default items whenever the query has not produced a non-empty
  // array — covering empty, undefined, and errored states. The fallback is
  // a synchronous module-level constant, so `items` is non-empty on the
  // very first render with no wait on the backend. A fresh mutable copy is
  // returned each call so consumers can treat `items` as `GalleryItem[]`
  // (the real `query.data` is already mutable).
  const realItems = query.data;
  const items =
    realItems && realItems.length > 0
      ? realItems
      : [...DEFAULT_STATIC_GALLERY_ITEMS];

  // True when the backend query has resolved AND returned an empty array.
  // Distinct from `items.length === 0`, which is never true because of the
  // fallback above. Consumers that need to act on genuine backend emptiness
  // (e.g. the one-time seed trigger) must use this flag instead of
  // `items.length` — otherwise the fallback masks the empty state and the
  // seed never fires, leaving the backend unpopulated and admin CRUD on the
  // fallback items silently non-persisting.
  const backendEmpty =
    !query.isLoading &&
    !query.error &&
    Array.isArray(realItems) &&
    realItems.length === 0;

  return {
    items,
    loading: isFetching || query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
    backendEmpty,
  };
}
