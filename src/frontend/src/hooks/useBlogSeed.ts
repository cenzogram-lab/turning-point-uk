import { BLOG_QUERY_KEY } from "@/types/blog";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

/**
 * useBlogSeed — one-time frontend-driven seed that populates the backend
 * blog with 1 placeholder article when the blog has no published posts.
 *
 * Why frontend-driven with local static URLs: the backend
 * `BlogPost.coverImage` is typed `Storage.ExternalBlob` with no `Text`
 * coverImageUrl field; `coverImageUrl` is frontend-derived from
 * `coverImage.getDirectURL()`. The seed passes the local static asset
 * URL (e.g. `/assets/blog/<filename>`) directly as `coverImageUrl` to the
 * existing `useCreateBlogPost` mutation, which rehydrates it into an
 * `ExternalBlob` via `ExternalBlob.fromURL(coverImageUrl)` and calls
 * `actor.createBlogPost(input)`. The backend stores that `ExternalBlob`,
 * and `toBlogPost` then derives `coverImageUrl = post.coverImage.getDirectURL()`
 * — which returns the same local static URL with no object-storage proxy
 * indirection and no lazy byte upload. This is why the covers render
 * correctly: the browser loads the bundled static asset directly.
 *
 * This deliberately bypasses `ExternalBlob.fromBytes(bytes, mimeType,
 * filename).getDirectURL()`, which returns an opaque object-storage proxy
 * URL that fails to resolve bytes in the browser. The admin upload path
 * (which genuinely needs object storage for new uploads) is unchanged —
 * only the seed records use local static URLs.
 *
 * Each seeded record becomes a genuine backend database record with a
 * unique canister-assigned id, stored in canister state, fully
 * deletable/editable from `/admin/blog`. No `BlogPost` objects are
 * hardcoded anywhere — the `SEED_ENTRIES` array below is seed CONFIG
 * (slug + title + excerpt + content + cover filename + category + readTime
 * + author), not blog posts. Real posts always come from the backend query.
 *
 * Double guard against re-running / duplicating:
 *   (a) the blog query has loaded AND returned zero published posts
 *       (`total === 0`, not loading, no error), AND
 *   (b) a localStorage flag `tpuk:blog-seeded` is not set.
 * The flag is set to `"true"` only after all 3 `createBlogPost` calls
 * succeed. If the seed is interrupted (some succeed, some fail), the flag
 * stays unset — but the blog won't be empty after a partial seed, so the
 * empty-blog check won't re-trigger. If an admin later deletes everything,
 * the flag (if set) prevents a re-seed; if the seed never completed, the
 * empty blog will retry the missing entries on next load.
 *
 * Re-entrancy: a module-level boolean (`seedInFlight`) plus a ref guard
 * prevent two concurrent seed runs across renders or StrictMode double-mounts.
 *
 * Mirrors `useGallerySeed` with the blog's 1 placeholder article.
 */

/** localStorage flag marking the blog as fully seeded. */
const SEED_FLAG = "tpuk:blog-seeded";

/**
 * Base path for staged seed cover assets (served from `public/`).
 *
 * Covers are generated cinematic deep-blue themed placeholder images written
 * to `public/assets/generated/` by `generate_image`. They are referenced
 * directly by their bundled static URL — no object-storage indirection.
 */
const SEED_ASSET_BASE = "/assets/generated/";

/**
 * Seed configuration — the 1 placeholder article in fixed order with
 * exact formatted title matching the existing frontend BlogPage copy.
 *
 * This is seed CONFIG, not blog posts — no `BlogPost` objects here.
 */
interface BlogSeedEntry {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverFilename: string;
  category: string;
  readTime: string;
  author: string;
}

export const SEED_ENTRIES: readonly BlogSeedEntry[] = [
  {
    slug: "education-watch-a-year-of-incident-reports",
    title: "Education Watch: a year of incident reports",
    excerpt:
      "Our confidential channel logged hundreds of reports. Here is what the patterns tell us about bias in the classroom.",
    category: "Blog",
    readTime: "9 min read",
    author: "Turning Point UK",
    coverFilename: "cover-education-watch.dim_1280x720.webp",
    content: `# Education Watch: a year of incident reports

Our confidential channel logged hundreds of reports this year. Here is what the patterns tell us about bias in the classroom - and what parents, students, and staff can do about it.

## The pattern

The reports are not random. They cluster:

1. **Around specific modules** where the reading list is one-sided and the seminar leader makes their politics known.
2. **Around assessment** where the feedback reads as a verdict on the student's views, not their work.
3. **Around guest lectures** where dissent from the floor is cut short while agreement is invited to expand.

## What you can do

- **Document everything.** Dates, times, names, and the exact words used.
- **Use the formal process.** A complaint that cites the policy is harder to dismiss than a feeling.
- **Tell us.** Our confidential channel is monitored by people who will not name you without consent.

## The year ahead

One year of reports is a snapshot, not a verdict. But the pattern is consistent enough to act on. Education Watch will keep logging, keep publishing the trends, and keep pushing institutions to treat every student - whatever their view - by the same standard.`,
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
    // localStorage may be unavailable (private mode, quota); the empty-blog
    // check still prevents re-seeding once records exist.
  }
}

export interface UseBlogSeedArgs {
  /** True when the blog query has loaded (not loading, no error) and total === 0. */
  isEmpty: boolean;
  /** Creates one blog post via the existing mutation. */
  createOne: (input: {
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    coverImageUrl: string;
    category: string;
    readTime: string;
    author: string;
    isPublished: boolean;
  }) => Promise<unknown>;
}

export interface UseBlogSeedResult {
  /** True while the seed is running (use to keep the skeleton visible). */
  seeding: boolean;
}

/**
 * Runs the one-time blog seed when the blog is empty and the
 * localStorage flag is unset. Call alongside `useBlogPosts()` in
 * `BlogPage.tsx`. Pass the existing `useCreateBlogPost().mutateAsync`
 * as `createOne` so the seed reuses the exact same upload + create path
 * as manual admin uploads.
 */
export function useBlogSeed({
  isEmpty,
  createOne,
}: UseBlogSeedArgs): UseBlogSeedResult {
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
    // Bail unless the blog has loaded and is genuinely empty.
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
          // Use the local static asset URL directly as the stored coverImageUrl.
          // `createOne` is `useCreateBlogPost().mutateAsync`, which
          // rehydrates `coverImageUrl` -> `ExternalBlob.fromURL(coverImageUrl)`
          // and calls `actor.createBlogPost(input)`. The backend stores that
          // ExternalBlob, and `toBlogPost` derives
          // `coverImageUrl = post.coverImage.getDirectURL()` — which returns
          // this same local URL with no object-storage proxy indirection and
          // no lazy byte upload, so the browser loads the bundled static asset
          // directly. This deliberately avoids
          // `ExternalBlob.fromBytes(...).getDirectURL()`, which returns an
          // opaque proxy URL that fails to resolve bytes in the browser.
          const coverImageUrl = `${SEED_ASSET_BASE}${entry.coverFilename}`;
          await createOne({
            slug: entry.slug,
            title: entry.title,
            excerpt: entry.excerpt,
            content: entry.content,
            coverImageUrl,
            category: entry.category,
            readTime: entry.readTime,
            author: entry.author,
            isPublished: true,
          });
        } catch (err) {
          console.error(`[blogSeed] seed failed for ${entry.slug}`, err);
          allSucceeded = false;
        }
      }

      if (cancelled) return;

      if (allSucceeded) {
        writeSeedFlag();
        // Invalidate so /blog re-renders with the new record(s) from
        // the backend query (the optimistic placeholders from each mutation
        // are replaced by the real records on refetch).
        await queryClient.invalidateQueries({ queryKey: BLOG_QUERY_KEY });
      }
      // If not all succeeded, leave the flag unset. The blog is no
      // longer empty (partial seed created some records), so the
      // empty-blog check won't re-trigger; an admin can finish the
      // job manually or delete everything to retry.
    })()
      .catch((err) => {
        console.error("[blogSeed] seed run crashed", err);
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
