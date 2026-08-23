import type {
  HeroVideoConfig as BackendHeroVideoConfig,
  NavConfig as BackendNavConfig,
} from "@/backend";
import {
  VIDEO_EDUCATION_CROWD,
  VIDEO_FLAG_WAVING,
  VIDEO_HISTORIC_LONDON,
  VIDEO_MASCOT_WALK,
  VIDEO_MERCH_DISPLAY,
  VIDEO_NEWSPAPER_AD,
} from "@/lib/assets";
import {
  NAV_ENTRIES,
  type NavDropdown,
  type NavEntry,
  type NavLink,
} from "@/lib/routes";

/**
 * Re-export the canonical frontend `NavEntry` union (`NavLink | NavDropdown`)
 * from `@/lib/routes` so consumers (hooks/useNavConfig.ts, Nav.tsx, Footer.tsx)
 * can import the type alongside the normalizer without reaching into
 * `@/lib/routes` directly.
 */
export type { NavEntry };

/**
 * Site-config frontend domain types.
 *
 * The backend exposes two admin-editable config blobs:
 *   - `getNavConfig()`        → `{ entries: NavEntry[] }`
 *   - `getHeroVideoConfig()`  → `{ slots: HeroVideoSlot[] }`
 *
 * The backend `NavEntry` shape is `{ text, href, children }` (Motoko reserves
 * `label`, so the field is named `text`). The frontend `lib/routes.ts`
 * `NavEntry` shape is `{ label, to, items }` (with `to` optional on
 * dropdowns). `toNavEntry` normalizes the backend record into the frontend
 * shape so Nav.tsx and Footer.tsx can consume backend-driven nav without any
 * changes to their rendering code.
 *
 * Both hooks (`useNavConfig`, `useHeroVideoConfig`) ship baked-in defaults
 * derived from the existing hardcoded constants so the site remains fully
 * navigable while the backend is loading, unreachable, or returns an empty
 * config. The defaults are the same values the static `NAV_ENTRIES` /
 * `VIDEO_*` constants already produce, so the visual presentation is identical
 * to the pre-dynamic version during the loading/fallback window.
 */

/**
 * Backend `NavEntry` shape (from `@/backend`). Re-exported here so consumers
 * can import the canonical type alongside the normalizer.
 */
export type BackendNavEntry = import("@/backend").NavEntry;

/**
 * Normalizes a single backend `NavEntry` (`{ text, href, children }`) into
 * the frontend `NavEntry` shape (`{ label, to, items }`) used by
 * `lib/routes.ts`, Nav.tsx, and Footer.tsx.
 *
 * - `text`   → `label`
 * - `href`   → `to`
 * - `children` → `items` (recursively normalized)
 *
 * A dropdown (children non-empty) renders as `{ label, items }` with no `to`
 * — matching the existing `NavDropdown` shape where `to` is optional. A leaf
 * entry (children empty) renders as `{ label, to }` — matching `NavLink`.
 * External links are detected by absolute `http(s)://` prefixes and tagged
 * with `external: true` so Nav.tsx / Footer.tsx render them as new-tab
 * anchors (the existing `NavLink.external` contract).
 */
export function toNavEntry(entry: BackendNavEntry): NavEntry {
  // The frontend NavDropdown.items type is NavLink[] (no nested dropdowns
  // supported in the current frontend type contract), so the dropdown branch
  // casts the recursively-normalized children to NavLink[]. The backend
  // NavEntry only ever carries one level of children in the seeded config,
  // so this cast is sound for the current contract.
  const items = entry.children.map(toNavEntry) as NavLink[];
  if (items.length > 0) {
    return { label: entry.text, items };
  }
  const external = /^(https?:)?\/\//i.test(entry.href);
  return external
    ? { label: entry.text, to: entry.href, external: true }
    : { label: entry.text, to: entry.href };
}

/**
 * Normalizes a full backend `NavConfig` into a frontend `NavEntry[]` (the
 * shape Nav.tsx and Footer.tsx already consume from `NAV_ENTRIES`). Returns
 * an empty array when the backend config is empty so the caller can fall
 * back to baked-in defaults.
 */
export function toNavEntries(config: BackendNavConfig): NavEntry[] {
  return config.entries.map(toNavEntry);
}

/**
 * Baked-in default nav entries — the existing hardcoded `NAV_ENTRIES` const
 * from `lib/routes.ts`. Used as the synchronous fallback while the backend
 * nav config is loading, on fetch error, or when the backend returns an
 * empty config. The visual presentation is identical to the pre-dynamic
 * version because the defaults ARE the pre-dynamic values.
 */
export const DEFAULT_NAV_ENTRIES: readonly NavEntry[] = NAV_ENTRIES;

/**
 * Hero video slot — frontend domain type for a single hero background video
 * configuration entry. Mirrors the backend `HeroVideoSlot` candid type
 * (`{ key, videoUrl, posterUrl }`) with no normalization needed (all fields
 * are plain strings).
 */
export type HeroVideoSlot = import("@/backend").HeroVideoSlot;

/**
 * Normalizes a backend `HeroVideoConfig` into a `Map<string, HeroVideoSlot>`
 * keyed by slot `key` so consumers can look up a specific slot by its key
 * (e.g. `flag-waving`) in O(1). Returns an empty map when the backend config
 * is empty so the caller can fall back to baked-in defaults.
 */
export function toHeroVideoSlotMap(
  config: BackendHeroVideoConfig,
): Map<string, HeroVideoSlot> {
  const map = new Map<string, HeroVideoSlot>();
  for (const slot of config.slots) {
    map.set(slot.key, slot);
  }
  return map;
}

/**
 * Baked-in default hero video slots — the hardcoded `VIDEO_*` constants from
 * `lib/assets.ts`. Used as the synchronous fallback per slot while the
 * backend hero video config is loading, on fetch error, or when the backend
 * returns an empty config (or a missing slot key).
 *
 * Poster/fallback images were removed universally: every hero renders its
 * HTML5 background video with no static image fallback, so `posterUrl` is
 * always the empty string (the backend candid type still carries the field).
 *
 * The keys match the backend seed contract (`flag-waving`, `mascot-walk`,
 * `newspaper-ad`, `historic-london`, `education-crowd`, `merch-display`).
 */
export const DEFAULT_HERO_VIDEO_SLOTS: readonly HeroVideoSlot[] = [
  {
    key: "flag-waving",
    videoUrl: VIDEO_FLAG_WAVING,
    posterUrl: "",
  },
  {
    key: "mascot-walk",
    videoUrl: VIDEO_MASCOT_WALK,
    posterUrl: "",
  },
  {
    key: "newspaper-ad",
    videoUrl: VIDEO_NEWSPAPER_AD,
    posterUrl: "",
  },
  {
    key: "historic-london",
    videoUrl: VIDEO_HISTORIC_LONDON,
    posterUrl: "",
  },
  {
    key: "education-crowd",
    videoUrl: VIDEO_EDUCATION_CROWD,
    posterUrl: "",
  },
  {
    key: "merch-display",
    videoUrl: VIDEO_MERCH_DISPLAY,
    posterUrl: "",
  },
];

/**
 * Baked-in default hero video slot lookup map — keyed by slot `key` for O(1)
 * lookup by `useHeroVideoConfig`. Built once at module load from
 * `DEFAULT_HERO_VIDEO_SLOTS` so the fallback path never rebuilds the map.
 */
export const DEFAULT_HERO_VIDEO_SLOT_MAP: ReadonlyMap<string, HeroVideoSlot> =
  new Map(DEFAULT_HERO_VIDEO_SLOTS.map((slot) => [slot.key, slot]));

/** Query key for the nav config (admin-editable). */
export const NAV_CONFIG_QUERY_KEY = ["site-config", "nav"] as const;

/** Query key for the hero video config (admin-editable). */
export const HERO_VIDEO_CONFIG_QUERY_KEY = [
  "site-config",
  "hero-videos",
] as const;
