import { DEFAULT_GALLERY_CATEGORY, GALLERY_QUERY_KEY } from "@/types/gallery";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

/**
 * useGallerySeed — one-time frontend-driven seed that populates the backend
 * gallery with the staged photos whose image files actually exist in
 * /assets/gallery/, when the gallery is empty.
 *
 * Why frontend-driven with local static URLs: the backend `GalleryItem.image`
 * is typed `Storage.ExternalBlob` with no `Text` imageUrl field; `imageUrl` is
 * frontend-derived from `image.getDirectURL()`. The seed passes the local
 * static asset URL (e.g. `/assets/gallery/<filename>`) directly as `imageUrl`
 * to the existing `useCreateGalleryItem` mutation, which rehydrates it into an
 * `ExternalBlob` via `ExternalBlob.fromURL(imageUrl)` and calls
 * `actor.createGalleryItem(image, title, description)`. The backend stores that
 * `ExternalBlob`, and `toGalleryItem` then derives `imageUrl =
 * item.image.getDirectURL()` — which returns the same local static URL with no
 * object-storage proxy indirection and no lazy byte upload. This is why the
 * cards render correctly: the browser loads the bundled static asset directly.
 *
 * This deliberately bypasses `ExternalBlob.fromBytes(bytes, mimeType,
 * filename).getDirectURL()`, which returns an opaque object-storage proxy URL
 * that fails to resolve bytes in the browser and renders cards as solid dark
 * boxes. The admin upload path (which genuinely needs object storage for new
 * uploads) is unchanged — only the seed records use local static URLs.
 *
 * Each seeded record becomes a genuine backend database record with a unique
 * canister-assigned id, stored in canister state, fully deletable/editable
 * from `/admin/gallery`. No `GalleryItem` objects are hardcoded anywhere —
 * the `SEED_ENTRIES` array below is seed CONFIG (filename + title + mimeType),
 * not gallery items. Real items always come from the backend query.
 *
 * Seed entries reference ONLY image files that actually exist in
 * /assets/gallery/. Earlier revisions seeded 15 entries, but 6 of those
 * filenames were missing from the bundle (portsmouth, manchester1, imperial,
 * loughborough1, loughborough2, birmingham2) — those records rendered as
 * broken images that fell through galleryFallback.ts to placeholder.svg,
 * making the gallery look incomplete. The missing-image entries were removed
 * so the gallery only seeds real, browser-fetchable imagery. The remaining
 * 9 entries all map to files present in public/assets/gallery/.
 *
 * Double guard against re-running / duplicating:
 *   (a) the gallery query has loaded AND returned an empty array
 *       (`items.length === 0`, not loading, no error), AND
 *   (b) a localStorage flag `tpuk:gallery-seeded` is not set.
 * The flag is set to `"true"` only after all `createGalleryItem` calls
 * succeed. If the seed is interrupted (some succeed, some fail), the flag
 * stays unset — but the gallery won't be empty after a partial seed, so the
 * empty-gallery check won't re-trigger. If an admin later deletes everything,
 * the flag (if set) prevents a re-seed; if the seed never completed, the
 * empty gallery will retry the missing entries on next load.
 *
 * Re-entrancy: a module-level boolean (`seedInFlight`) plus a ref guard
 * prevent two concurrent seed runs across renders or StrictMode double-mounts.
 */

/** localStorage flag marking the gallery as fully seeded. */
const SEED_FLAG = "tpuk:gallery-seeded";

/** Base path for staged seed assets (served from `public/`). */
const SEED_ASSET_BASE = "/assets/gallery/";

/** Default description for every seeded record. */
const SEED_DESCRIPTION = "Turning Point UK on the ground.";

/**
 * Default category for seeded records. The staged seed photos are campus
 * action shots, so 'Campus Events' (one of the user-specified gallery
 * categories) is the most accurate tag. Each seed entry may override this
 * with its own `category` if a more specific tag fits.
 */
const SEED_CATEGORY = "Campus Events";

/**
 * Seed configuration — the staged photos that actually exist in
 * /assets/gallery/, in fixed order with exact formatted titles. Duplicate
 * city names (two Keele) are kept as separate records sharing the same title;
 * uniqueness comes from the backend DB id, not the title.
 *
 * Only files present in public/assets/gallery/ are listed here. Earlier
 * revisions included 6 more entries (portsmouth, manchester1, imperial,
 * loughborough1, loughborough2, birmingham2) whose image files were missing
 * from the bundle — those were removed so the gallery only seeds real,
 * browser-fetchable imagery and never falls through to placeholder.svg.
 *
 * Each entry carries a `category` so the seed works with the new
 * `GalleryItem.category` schema (the backend requires a non-empty category
 * on create and defaults empty to 'Uncategorized'). The default
 * 'Campus Events' tag is accurate for these on-the-ground campus photos.
 *
 * This is seed CONFIG, not gallery items — no `GalleryItem` objects here.
 */
interface SeedEntry {
  filename: string;
  title: string;
  mimeType: string;
  /** Category label passed to `createGalleryItem`. Defaults to 'Campus Events'. */
  category?: string;
}

export const SEED_ENTRIES: readonly SeedEntry[] = [
  {
    filename: "home-600x450-019fd7d4-3d0d-772f-8898-dde66fbf2fa0.webp",
    title: "Home",
    mimeType: "image/webp",
  },
  {
    filename: "ucl-optimized-scaled-019fd7d4-3d50-7571-ae99-8bb8fea3a572.webp",
    title: "UCL",
    mimeType: "image/webp",
  },
  {
    filename: "coventry-1-019fd7d4-3e58-77cc-bac6-f8fa7f6cb5f9.webp",
    title: "Coventry",
    mimeType: "image/webp",
  },
  {
    filename: "southampton1-1-019fd7d4-3e64-705d-84b4-d337f1afea84.jpg",
    title: "Southampton",
    mimeType: "image/jpeg",
  },
  {
    filename: "winchester1-1-019fd7d4-3e79-763f-a5ea-c1edd1060d05.jpg",
    title: "Winchester",
    mimeType: "image/jpeg",
  },
  {
    filename: "york-1-019fd7d4-3e5d-73ba-b570-20a72e039619.webp",
    title: "York",
    mimeType: "image/webp",
  },
  {
    filename:
      "keele1-optimized-scaled-019fd7d4-3fb1-7691-8081-a85bc7ed82f6.webp",
    title: "Keele",
    mimeType: "image/webp",
  },
  {
    filename: "birmingham1-1-scaled-019fd7d4-4044-7494-94bb-bd25d683cb8f.webp",
    title: "Birmingham",
    mimeType: "image/webp",
  },
  {
    filename:
      "keele2-optimized-scaled-019fd7d4-4045-7095-b153-186b57fd9af1.webp",
    title: "Keele",
    mimeType: "image/webp",
  },
] as const;

/**
 * Module-level re-entrancy guard. Prevents two concurrent seed runs across
 * renders, StrictMode double-mounts, or overlapping effect triggers. The
 * ref inside the hook mirrors this for component lifecycle safety.
 */
let seedInFlight = false;

/** Reads the seeded flag from localStorage (defensive against SSR/throw). */
function readSeedFlag(): boolean {
  try {
    return window.localStorage.getItem(SEED_FLAG) === "true";
  } catch {
    return false;
  }
}

/** Writes the seeded flag to localStorage (defensive against SSR/throw). */
function writeSeedFlag(): void {
  try {
    window.localStorage.setItem(SEED_FLAG, "true");
  } catch {
    // localStorage may be unavailable (private mode, quota); the empty-gallery
    // check still prevents re-seeding once records exist.
  }
}

export interface UseGallerySeedArgs {
  /** True when the gallery query has loaded (not loading, no error). */
  isEmpty: boolean;
  /** Creates one gallery item via the existing mutation. Returns the created record's id. */
  createOne: (input: {
    imageUrl: string;
    title: string;
    description: string;
    eventDate?: number;
    category?: string;
  }) => Promise<unknown>;
}

export interface UseGallerySeedResult {
  /** True while the seed is running (use to keep the skeleton visible). */
  seeding: boolean;
}

/**
 * Runs the one-time gallery seed when the gallery is empty and the
 * localStorage flag is unset. Call alongside `useGalleryItems()` in
 * `GalleryPage.tsx`. Pass the existing `useCreateGalleryItem().mutateAsync`
 * as `createOne` so the seed reuses the exact same upload + create path
 * as manual admin uploads.
 */
export function useGallerySeed({
  isEmpty,
  createOne,
}: UseGallerySeedArgs): UseGallerySeedResult {
  const queryClient = useQueryClient();
  const [seeding, setSeeding] = useState(false);
  // Ref guard so the async seed survives StrictMode double-invoke without
  // starting a second run.
  const runRef = useRef(false);

  useEffect(() => {
    // Mock mode: the mock backend already seeds sample records and the real
    // actor is null, so firing createOne mutations would throw
    // 'Backend actor not ready'. The seed is redundant in mock mode.
    if (import.meta.env.VITE_USE_MOCK === "true") return;
    // Bail unless the gallery has loaded and is genuinely empty.
    if (!isEmpty) return;
    // Bail if the seed already completed once.
    if (readSeedFlag()) return;
    // Re-entrancy guards.
    if (seedInFlight || runRef.current) return;
    runRef.current = true;
    seedInFlight = true;
    setSeeding(true);

    let cancelled = false;

    (async () => {
      let allSucceeded = true;
      for (const entry of SEED_ENTRIES) {
        if (cancelled) break;
        try {
          // Use the local static asset URL directly as the stored imageUrl.
          // `createOne` is `useCreateGalleryItem().mutateAsync`, which
          // rehydrates `imageUrl` -> `ExternalBlob.fromURL(imageUrl)` and
          // calls `actor.createGalleryItem(image, title, description)`. The
          // backend stores that ExternalBlob, and `toGalleryItem` derives
          // `imageUrl = item.image.getDirectURL()` — which returns this same
          // local URL with no object-storage proxy indirection and no lazy
          // byte upload, so the browser loads the bundled static asset
          // directly. This deliberately avoids
          // `ExternalBlob.fromBytes(...).getDirectURL()`, which returns an
          // opaque proxy URL that fails to resolve bytes in the browser.
          const imageUrl = `${SEED_ASSET_BASE}${entry.filename}`;
          await createOne({
            imageUrl,
            title: entry.title,
            description: SEED_DESCRIPTION,
            category: entry.category ?? SEED_CATEGORY,
          });
        } catch (err) {
          console.error(`[gallerySeed] seed failed for ${entry.filename}`, err);
          allSucceeded = false;
        }
      }

      if (cancelled) return;

      if (allSucceeded) {
        writeSeedFlag();
        // Invalidate so /gallery re-renders with the 15 new records from
        // the backend query (the optimistic placeholders from each mutation
        // are replaced by the real records on refetch).
        await queryClient.invalidateQueries({ queryKey: GALLERY_QUERY_KEY });
      }
      // If not all succeeded, leave the flag unset. The gallery is no
      // longer empty (partial seed created some records), so the
      // empty-gallery check won't re-trigger; an admin can finish the
      // job manually or delete everything to retry.
    })()
      .catch((err) => {
        console.error("[gallerySeed] seed run crashed", err);
      })
      .finally(() => {
        if (!cancelled) {
          setSeeding(false);
        }
        runRef.current = false;
        seedInFlight = false;
      });

    return () => {
      cancelled = true;
    };
  }, [isEmpty, createOne, queryClient]);

  return { seeding };
}
