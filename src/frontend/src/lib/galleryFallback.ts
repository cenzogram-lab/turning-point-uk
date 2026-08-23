import { SEED_ENTRIES } from "@/hooks/useGallerySeed";
import type { GalleryItem } from "@/types/gallery";

/**
 * galleryFallback — resolves a browser-fetchable fallback URL for a gallery
 * image whose opaque object-storage proxy URL has failed to load.
 *
 * Background: `GalleryItem.imageUrl` is the opaque proxy URL returned by
 * `ExternalBlob.getDirectURL()`. That URL is returned synchronously BEFORE
 * the bytes are uploaded (the bytes push lazily during backend
 * `createGalleryItem` serialization), so an `<img>` that tries to load it
 * too early — or after the gateway has rotated the asset — renders broken.
 * Without an `onError` handler the broken `<img>` is invisible and the
 * parent's near-black `bg-card` shows through, producing the "black cards"
 * symptom.
 *
 * Resolution strategy (in order):
 *   1. If the item's own `imageUrl` carries a filename that is a bundled
 *      gallery asset (present on disk in `public/assets/gallery/`), fall
 *      back to that staged asset at `/assets/gallery/<filename>`. This
 *      recovers ANY item whose proxy URL failed but whose underlying
 *      filename is a bundled asset — regardless of whether its title
 *      matches a seed entry (admin-uploaded items, mock sample items, and
 *      seeded records all benefit). Matching by filename is stable because
 *      the filename is the on-disk identity of the asset, unlike a title
 *      which can be edited or duplicated.
 *   2. Otherwise, if the item's title matches a `SEED_ENTRIES` title, fall
 *      back to that seed entry's staged asset. This covers items whose
 *      imageUrl does not carry a bundled filename but whose title is a
 *      known seed title.
 *   3. Otherwise fall back to the neutral placeholder SVG at
 *      `/assets/images/placeholder.svg`. This is acceptable only when no
 *      real bundled asset exists for the item.
 *
 * Every filename in the bundled set is guaranteed to exist on disk (the
 * seed list was trimmed to only files present in the bundle), so a match
 * always resolves a real image — never a broken-image icon.
 */

/** Base path for staged seed assets (served from `public/`). */
const SEED_ASSET_BASE = "/assets/gallery/";

/** Neutral placeholder for items with no matching bundled asset. */
const PLACEHOLDER_URL = "/assets/images/placeholder.svg";

/**
 * Set of filenames that are guaranteed to exist on disk in
 * `public/assets/gallery/`. Built once at module load from `SEED_ENTRIES`
 * (the seed list was trimmed to only files present in the bundle), so a
 * filename in this set always resolves to a real browser-fetchable asset.
 */
const BUNDLED_FILENAMES: ReadonlySet<string> = new Set(
  SEED_ENTRIES.map((entry) => entry.filename),
);

/**
 * Map of seed title -> first matching staged filename. Built once at module
 * load from `SEED_ENTRIES` so the lookup is O(1) per failed image. Duplicate
 * titles collapse to the first entry. Used as a secondary fallback when the
 * item's own imageUrl does not carry a bundled filename.
 */
const TITLE_TO_FILENAME: ReadonlyMap<string, string> = (() => {
  const map = new Map<string, string>();
  for (const entry of SEED_ENTRIES) {
    if (!map.has(entry.title)) {
      map.set(entry.title, entry.filename);
    }
  }
  return map;
})();

/**
 * Extracts the bare filename (last path segment, query string stripped) from
 * an image URL. Returns null when the URL has no usable path segment.
 */
function filenameFromUrl(url: string): string | null {
  try {
    const withoutQuery = url.split("?")[0];
    const segments = withoutQuery.split("/");
    const last = segments[segments.length - 1];
    return last && last.length > 0 ? last : null;
  } catch {
    return null;
  }
}

/**
 * Returns a browser-fetchable fallback URL for the given gallery item.
 *
 * Prefers the item's own imageUrl filename when it is a bundled gallery
 * asset; otherwise falls back to the staged seed asset matching the item's
 * title; otherwise falls back to the neutral placeholder SVG.
 */
export function getFallbackImageUrl(item: GalleryItem): string {
  const ownFilename = filenameFromUrl(item.imageUrl);
  if (ownFilename && BUNDLED_FILENAMES.has(ownFilename)) {
    return `${SEED_ASSET_BASE}${ownFilename}`;
  }
  const titleFilename = TITLE_TO_FILENAME.get(item.title);
  if (titleFilename) {
    return `${SEED_ASSET_BASE}${titleFilename}`;
  }
  return PLACEHOLDER_URL;
}

/**
 * Returns the neutral placeholder URL. Used when no item context is available
 * (e.g. a lightbox whose item has no title).
 */
export function getPlaceholderImageUrl(): string {
  return PLACEHOLDER_URL;
}
