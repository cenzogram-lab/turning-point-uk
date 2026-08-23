import { createActor } from "@/backend";
import { mockBackend } from "@/mocks/backend";
import {
  DEFAULT_HERO_VIDEO_SLOT_MAP,
  HERO_VIDEO_CONFIG_QUERY_KEY,
  type HeroVideoSlot,
  toHeroVideoSlotMap,
} from "@/types/site-config";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";

/**
 * useHeroVideoConfig — fetches the hero video config from the backend via
 * `getHeroVideoConfig()` and exposes a `getSlot(key)` lookup so every page
 * component and `BackgroundVideo` consumer can read its video URL + poster
 * URL by slot key instead of importing the `VIDEO_*` / `POSTER_*` constants
 * from `lib/assets.ts`.
 *
 * Replaces the static `VIDEO_*` constants in `lib/assets.ts` so the hero
 * videos are backend-driven and admin-editable. The rendered hero video
 * presentation (autoPlay, loop, muted, playsInline, IntersectionObserver
 * lazy loading, poster fallback, play() retries) is unchanged — only the
 * data source moves from static consts to a backend query.
 *
 * Graceful degradation contract:
 *   - While loading: `getSlot(key)` falls back to the baked-in default slot
 *     for that key (from `DEFAULT_HERO_VIDEO_SLOT_MAP`) so heroes never
 *     blank out.
 *   - On fetch error: `getSlot(key)` falls back to the same default slot.
 *   - On missing slot key in the backend config: `getSlot(key)` falls back
 *     to the default slot for that key.
 *   - On success: `getSlot(key)` returns the backend-driven slot.
 *
 * `loading` is true only during the initial fetch (before any data has
 * resolved). Once the query has resolved — success OR error — `loading` is
 * false and `getSlot` returns either the backend value or the fallback.
 *
 * Mock mode: when `VITE_USE_MOCK=true` the core-infrastructure actor factory
 * cannot reach a real canister, so `useActor` returns a null actor and the
 * query would never fire. To keep heroes rendering the seeded sample video
 * config during frontend-only development, we fall back to the in-memory
 * `mockBackend` whenever the real actor is null AND mock mode is enabled.
 * Production behavior is unchanged — the fallback only activates in mock mode.
 */

/** True when running in frontend-only mock mode (`VITE_USE_MOCK=true`). */
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

/**
 * Sanitizes a backend-driven slot map against the retired video/poster era.
 *
 * The deployed canister state may still carry the pre-redesign seed values:
 * local `/videos/*.mp4` paths (removed in favour of the authoritative hosted
 * file.garden URLs) and static poster images (removed universally — heroes
 * have no fallback image anymore). Without this pass, the stale stored
 * config would override the new baked-in defaults on the live site.
 *
 *   - A slot whose videoUrl is empty or points at a retired local
 *     `/videos/` path is replaced by the current default videoUrl for that
 *     key (unknown keys keep their admin-set URL untouched).
 *   - posterUrl is always blanked: fallback images are gone site-wide.
 *
 * Admin-set external URLs pass through unchanged, so the config remains
 * fully admin-editable going forward. The Candid actor interface is not
 * touched — this is a pure read-side normalization.
 */
function sanitizeSlotMap(
  map: Map<string, HeroVideoSlot>,
): Map<string, HeroVideoSlot> {
  const sanitized = new Map<string, HeroVideoSlot>();
  for (const [key, slot] of map) {
    const isRetiredUrl =
      slot.videoUrl.trim() === "" || slot.videoUrl.startsWith("/videos/");
    const fallback = DEFAULT_HERO_VIDEO_SLOT_MAP.get(key);
    sanitized.set(key, {
      key,
      videoUrl: isRetiredUrl && fallback ? fallback.videoUrl : slot.videoUrl,
      posterUrl: "",
    });
  }
  return sanitized;
}

/**
 * Resolves the effective backend actor for read queries. Returns the real
 * actor when available; otherwise falls back to `mockBackend` in mock mode
 * so the seeded sample hero video config renders. Returns `null` in
 * production when the actor is not yet ready.
 */
function resolveActor<T>(actor: T | null): T | null {
  if (actor) return actor;
  return USE_MOCK ? (mockBackend as unknown as T) : null;
}

export interface UseHeroVideoConfigResult {
  /**
   * Look up a single hero video slot by its key (e.g. `flag-waving`).
   * Returns the backend-driven slot when available; otherwise falls back
   * to the baked-in default slot for that key. Returns `undefined` only
   * when the key is unknown to both the backend config AND the defaults
   * (which should never happen for the six known slot keys).
   */
  getSlot: (key: string) => HeroVideoSlot | undefined;
  /** All backend-driven slots (or the baked-in defaults while loading / on
   *  error / on empty). Useful for consumers that iterate every slot. */
  slots: HeroVideoSlot[];
  /** True only during the initial fetch (before any data has resolved). */
  loading: boolean;
  /** The fetch error, if any. `getSlot` falls back to defaults on error. */
  error: unknown;
  /** Re-fetch the hero video config. */
  refetch: () => void;
  /** True when the query is fetching in the background (refetch, etc.). */
  isFetching: boolean;
}

export function useHeroVideoConfig(): UseHeroVideoConfigResult {
  const { actor, isFetching } = useActor(createActor);
  const resolvedActor = resolveActor(actor);

  const query = useQuery<Map<string, HeroVideoSlot>>({
    queryKey: HERO_VIDEO_CONFIG_QUERY_KEY,
    queryFn: async () => {
      if (!resolvedActor) return new Map(DEFAULT_HERO_VIDEO_SLOT_MAP);
      const config = await resolvedActor.getHeroVideoConfig();
      // Normalize stale stored values (retired local /videos/ paths, poster
      // images) against the current defaults — see sanitizeSlotMap.
      const map = sanitizeSlotMap(toHeroVideoSlotMap(config));
      // Empty backend config → fall back to defaults so heroes never blank.
      return map.size > 0 ? map : new Map(DEFAULT_HERO_VIDEO_SLOT_MAP);
    },
    enabled: Boolean(resolvedActor) && (USE_MOCK || !isFetching),
  });

  // Fallback contract: the slot map is NEVER empty. While loading, on error,
  // or when the query returns an empty map, fall back to the baked-in
  // default slot map. `getSlot` reads from whichever map is active.
  const realMap = query.data;
  const activeMap =
    realMap && realMap.size > 0 ? realMap : DEFAULT_HERO_VIDEO_SLOT_MAP;

  const getSlot = (key: string): HeroVideoSlot | undefined =>
    activeMap.get(key);

  const slots = Array.from(activeMap.values());

  return {
    getSlot,
    slots,
    loading: isFetching || query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}
